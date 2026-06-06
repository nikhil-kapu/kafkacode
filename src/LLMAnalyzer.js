const https = require('https');

/**
 * LLMAnalyzer performs optional AI-powered contextual analysis.
 *
 * It is "bring your own key": the user supplies an API key and KafkaCode calls
 * an OpenAI-compatible chat-completions endpoint directly (defaulting to Groq).
 * When no key (and no self-hosted backend) is configured, AI analysis is simply
 * skipped — pattern-based scanning still runs, and no code leaves the machine.
 */
class LLMAnalyzer {
    constructor() {
        // Bring-your-own-key: direct, OpenAI-compatible provider call.
        this.apiKey = process.env.KAFKACODE_API_KEY || '';
        this.apiUrl = process.env.KAFKACODE_API_URL || 'https://api.groq.com/openai/v1';
        this.model = process.env.KAFKACODE_MODEL || 'llama-3.1-8b-instant';

        // Advanced: a self-hosted backend exposing POST /api/analyze. If set,
        // it takes precedence over a direct provider call.
        this.backendEndpoint = process.env.KAFKACODE_BACKEND_ENDPOINT || '';

        // Delay between snippet requests, to stay within free-tier rate limits.
        this.rateLimitMs = parseInt(process.env.KAFKACODE_RATE_LIMIT_MS || '250', 10);

        this.disabled = false;
        this.verbose = false;
        this.interestKeywords = new Set([
            'api', 'db', 'database', 'user', 'password', 'save', 'fetch', 'send', 'log',
            'auth', 'token', 'key', 'secret', 'credential', 'email', 'phone', 'address',
            'personal', 'sensitive', 'private', 'encrypt', 'decrypt', 'hash'
        ]);
    }

    /** AI analysis is available only when a key or a backend endpoint is configured. */
    isEnabled() {
        return !this.disabled && Boolean(this.apiKey || this.backendEndpoint);
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
                const lastRange = mergedRanges[mergedRanges.length - 1];
                mergedRanges[mergedRanges.length - 1] = [lastRange[0], Math.max(lastRange[1], end)];
            } else {
                mergedRanges.push([start, end]);
            }
        }

        return mergedRanges;
    }

    /** Route a snippet to either the self-hosted backend or the direct provider. */
    async _analyzeSnippet(codeSnippet, filePath, startLine) {
        if (this.backendEndpoint) {
            return this._callBackendApi(codeSnippet, filePath, startLine);
        }
        return this._callProviderApi(codeSnippet, filePath, startLine);
    }

    /** Call an OpenAI-compatible chat-completions endpoint directly (BYOK). */
    async _callProviderApi(codeSnippet, filePath, startLine) {
        const prompt = this._createSnippetPrompt(codeSnippet, filePath, startLine);
        const payload = JSON.stringify({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
            max_tokens: 800
        });

        const base = this.apiUrl.replace(/\/+$/, '');
        const url = new URL(`${base}/chat/completions`);
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 20000
        };

        const raw = await this._request(options, payload);
        const result = JSON.parse(raw);
        const content = result.choices && result.choices[0] && result.choices[0].message.content;
        return this._parseVulnerabilities(content || '');
    }

    /** Call a self-hosted KafkaCode backend (POST /api/analyze). */
    async _callBackendApi(codeSnippet, filePath, startLine) {
        const payload = JSON.stringify({ codeSnippet, filePath, startLine });
        const base = this.backendEndpoint.replace(/\/+$/, '');
        const url = new URL(`${base}/api/analyze`);
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 20000
        };

        const raw = await this._request(options, payload);
        const result = JSON.parse(raw);
        const content = result.data && result.data.choices && result.data.choices[0].message.content;
        return this._parseVulnerabilities(content || '');
    }

    /** Parse the model's text response into a vulnerabilities array, defensively. */
    _parseVulnerabilities(content) {
        try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed.vulnerabilities) ? parsed.vulnerabilities : [];
        } catch (err) {
            // Some models wrap JSON in prose or fences — extract the JSON object.
            const start = content.indexOf('{');
            const end = content.lastIndexOf('}') + 1;
            if (start !== -1 && end > start) {
                try {
                    const parsed = JSON.parse(content.substring(start, end));
                    return Array.isArray(parsed.vulnerabilities) ? parsed.vulnerabilities : [];
                } catch (_) {
                    return [];
                }
            }
            return [];
        }
    }

    /** Promise wrapper around https.request with status + timeout handling. */
    _request(options, payload) {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    if (res.statusCode === 429) {
                        return reject(new Error('Rate limit exceeded (HTTP 429)'));
                    }
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
                    }
                    resolve(data);
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('LLM request timed out'));
            });

            req.write(payload);
            req.end();
        });
    }

    async analyzeFile(filePath, content, patternFindings = []) {
        // AI analysis is opt-in: with no key/backend configured, skip entirely.
        if (!this.isEnabled()) {
            return [];
        }

        const lines = content.split('\n');
        const areasOfInterest = this._identifyAreasOfInterest(content, patternFindings);
        const findings = [];

        if (this.verbose && areasOfInterest.length > 0) {
            console.log(`  Found ${areasOfInterest.length} areas of interest for AI analysis`);
        }

        for (const [startLine, endLine] of areasOfInterest) {
            const snippet = lines.slice(startLine - 1, endLine).join('\n');

            // Skip very small snippets
            if (snippet.trim().length < 50) {
                continue;
            }

            let vulnerabilities;
            try {
                vulnerabilities = await this._analyzeSnippet(snippet, filePath, startLine);
            } catch (error) {
                // Skip this snippet on error — never fabricate findings.
                if (this.verbose) {
                    console.log(`    ⚠️  AI analysis skipped for ${filePath}:${startLine} — ${error.message}`);
                }
                continue;
            }

            for (const vuln of vulnerabilities) {
                findings.push({
                    file_path: filePath,
                    line_number: vuln.line_number || startLine,
                    rule_id: 'KC_AI_CONTEXT',
                    severity: vuln.severity || 'Medium',
                    finding_type: 'Context-Based Issue',
                    description: vuln.description || 'Privacy vulnerability detected',
                    confidence: vuln.confidence || 'Medium',
                    code_snippet: this._getCodeSnippet(content, vuln.line_number || startLine),
                    suggestion: vuln.suggestion || 'Review and address the identified issue.',
                    source: 'llm',
                    secret: false
                });
            }

            // Gentle pacing to respect provider rate limits.
            if (this.rateLimitMs > 0) {
                await new Promise(resolve => setTimeout(resolve, this.rateLimitMs));
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
