const https = require('https');

class LLMAnalyzer {
    constructor() {
        this.backendEndpoint = process.env.KAFKACODE_BACKEND_ENDPOINT || 'https://adorable-motivation-production.up.railway.app';
        this.verbose = false;
        this.interestKeywords = new Set([
            'api', 'db', 'database', 'user', 'password', 'save', 'fetch', 'send', 'log',
            'auth', 'token', 'key', 'secret', 'credential', 'email', 'phone', 'address',
            'personal', 'sensitive', 'private', 'encrypt', 'decrypt', 'hash'
        ]);
    }

    _createSnippetPrompt(codeSnippet, filePath, startLine) {
        return `SYSTEM: You are an automated privacy and compliance analysis engine. Your task is to review the following CODE SNIPPET and identify potential privacy vulnerabilities based ONLY on the provided code. The snippet is from a larger file. Do not infer functionality outside of this snippet. Your analysis must focus on how the code handles data that could be considered sensitive or PII.

Your response MUST be a single, valid JSON object. The root object should contain a single key: "vulnerabilities". The value of "vulnerabilities" must be an array of objects. Each object in the array represents a single, distinct vulnerability and must have the following keys:
- "line_number": The integer line number where the vulnerability is found. This number MUST be relative to the original file, not the snippet.
- "severity": A string, which must be one of "High", "Medium", or "Low".
- "description": A concise, one-sentence string describing the vulnerability (e.g., "User email is logged to a publicly accessible file.").
- "suggestion": A one-sentence string providing an actionable recommendation for the developer (e.g., "Consider logging only non-sensitive user identifiers or hashing the data before logging.").

If you find zero vulnerabilities, you MUST return an empty array: {"vulnerabilities": []}.

USER: Analyze the following code snippet from the file '${filePath}'. The snippet starts at line ${startLine}:

${codeSnippet}`;
    }

    _identifyAreasOfInterest(content, patternFindings) {
        const lines = content.split('\n');
        const areas = new Set();

        // Add lines from pattern findings
        for (const finding of patternFindings) {
            const lineNum = finding.line_number || 1;
            areas.add(lineNum);
        }

        // Look for function/method definitions and lines with interest keywords
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineLower = line.toLowerCase();

            // Function/method definitions
            if (/^\s*(def\s+|function\s+|class\s+|\w+\s*\([^)]*\)\s*{)/.test(line.trim())) {
                areas.add(i + 1);
            }

            // Lines containing interest keywords
            if (Array.from(this.interestKeywords).some(keyword => lineLower.includes(keyword))) {
                areas.add(i + 1);
            }
        }

        // Convert to ranges with context
        const ranges = [];
        const sortedAreas = Array.from(areas).sort((a, b) => a - b);

        for (const lineNum of sortedAreas) {
            const start = Math.max(1, lineNum - 10);
            const end = Math.min(lines.length, lineNum + 10);
            ranges.push([start, end]);
        }

        // Merge overlapping ranges
        const mergedRanges = [];
        for (const [start, end] of ranges) {
            if (mergedRanges.length > 0 && start <= mergedRanges[mergedRanges.length - 1][1] + 10) {
                // Extend previous range
                const lastRange = mergedRanges[mergedRanges.length - 1];
                mergedRanges[mergedRanges.length - 1] = [lastRange[0], Math.max(lastRange[1], end)];
            } else {
                mergedRanges.push([start, end]);
            }
        }

        return mergedRanges;
    }

    async callGrokApi(codeSnippet, filePath, startLine) {
        try {
            return await this._callBackendApi(codeSnippet, filePath, startLine);
        } catch (error) {
            if (this.verbose) {
                console.log(`    ❌ LLM call failed, using mock: ${error.message}`);
            }
            return this._mockSnippetResponse(codeSnippet, filePath, startLine);
        }
    }

    async _callBackendApi(codeSnippet, filePath, startLine) {
        const payload = JSON.stringify({
            codeSnippet,
            filePath,
            startLine
        });

        const url = new URL(this.backendEndpoint);
        url.pathname = '/api/analyze';

        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 12000 // 12 second timeout for CLI request
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode === 429) {
                            const errorData = JSON.parse(data);
                            throw new Error(`Rate limit exceeded: ${errorData.message}`);
                        }

                        if (res.statusCode !== 200) {
                            throw new Error(`HTTP ${res.statusCode}: ${data}`);
                        }

                        const result = JSON.parse(data);
                        const content = result.data.choices[0].message.content;

                        try {
                            const parsedResponse = JSON.parse(content);
                            if (this.verbose) {
                                console.log(`    ✅ LLM returned ${parsedResponse.vulnerabilities?.length || 0} vulnerabilities`);
                                if (result.rateLimitRemaining !== undefined) {
                                    console.log(`    📊 Rate limit remaining: ${result.rateLimitRemaining}`);
                                }
                            }
                            parsedResponse.__source = 'llm';
                            resolve(parsedResponse);
                        } catch (jsonError) {
                            const jsonStart = content.indexOf('{');
                            const jsonEnd = content.lastIndexOf('}') + 1;
                            if (jsonStart !== -1 && jsonEnd > jsonStart) {
                                const parsed = JSON.parse(content.substring(jsonStart, jsonEnd));
                                if (this.verbose) {
                                    console.log(`    ✅ LLM returned ${parsed.vulnerabilities?.length || 0} vulnerabilities (extracted JSON)`);
                                }
                                parsed.__source = 'llm';
                                resolve(parsed);
                            } else {
                                resolve({ vulnerabilities: [] });
                            }
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Backend API request timeout'));
            });

            req.write(payload);
            req.end();
        });
    }


    _mockSnippetResponse(codeSnippet, filePath, startLine) {
        const vulnerabilities = [];
        const lines = codeSnippet.split('\n');

        // Simple heuristic-based mock analysis
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineLower = line.toLowerCase();
            const actualLineNum = startLine + i;

            // Look for logging of potentially sensitive data
            if (lineLower.includes('log') && ['email', 'user', 'password', 'token'].some(term => lineLower.includes(term))) {
                vulnerabilities.push({
                    line_number: actualLineNum,
                    severity: 'Medium',
                    description: 'Potential logging of sensitive user data detected.',
                    suggestion: 'Consider logging only non-sensitive identifiers or hashing sensitive data before logging.'
                });
            }

            // Look for insecure data transmission
            if (lineLower.includes('http://') && ['api', 'send', 'post', 'request'].some(term => lineLower.includes(term))) {
                vulnerabilities.push({
                    line_number: actualLineNum,
                    severity: 'High',
                    description: 'Insecure HTTP transmission of potentially sensitive data.',
                    suggestion: 'Use HTTPS instead of HTTP for all data transmission.'
                });
            }
        }

        return { vulnerabilities, __source: 'mock' };
    }

    async analyzeFile(filePath, content, patternFindings = []) {
        const lines = content.split('\n');
        const areasOfInterest = this._identifyAreasOfInterest(content, patternFindings);
        const findings = [];

        if (this.verbose && areasOfInterest.length > 0) {
            console.log(`  Found ${areasOfInterest.length} areas of interest for LLM analysis`);
        }

        // Analyze each area of interest
        for (const [startLine, endLine] of areasOfInterest) {
            // Extract snippet
            const snippetLines = lines.slice(startLine - 1, endLine);
            const snippet = snippetLines.join('\n');

            // Skip very small snippets
            if (snippet.trim().length < 50) {
                continue;
            }

            try {
                // Call API with rate limiting
                const grokResponse = await this.callGrokApi(snippet, filePath, startLine);

                // Add delay to prevent rate limiting from free tier
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Process findings
                for (const vuln of grokResponse.vulnerabilities || []) {
                    const finding = {
                        file_path: filePath,
                        line_number: vuln.line_number || startLine,
                        severity: vuln.severity || 'Medium',
                        finding_type: 'Context-Based Issue',
                        description: vuln.description || 'Privacy vulnerability detected',
                        code_snippet: this._getCodeSnippet(content, vuln.line_number || startLine),
                        suggestion: vuln.suggestion || 'Review and address the identified issue.',
                        source: grokResponse.__source || 'unknown'
                    };
                    findings.push(finding);
                }

            } catch (error) {
                // Continue with other snippets if one fails
                continue;
            }
        }

        // Remove duplicates based on line number and description
        const seen = new Set();
        const uniqueFindings = [];
        for (const finding of findings) {
            const key = `${finding.line_number}:${finding.description}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueFindings.push(finding);
            }
        }

        return uniqueFindings;
    }

    _getCodeSnippet(content, lineNumber) {
        const lines = content.split('\n');
        if (lineNumber >= 1 && lineNumber <= lines.length) {
            return lines[lineNumber - 1].trim();
        }
        return 'Code snippet unavailable';
    }
}

module.exports = LLMAnalyzer;