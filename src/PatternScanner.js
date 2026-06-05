class PatternScanner {
    constructor() {
        this.patterns = this._initPatterns();
    }

    _initPatterns() {
        return {
            'aws_access_key': {
                pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'AWS Access Key ID detected'
            },
            'aws_secret_key': {
                pattern: /\b[A-Za-z0-9/+=]{40}\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'Potential AWS Secret Access Key detected'
            },
            'stripe_key': {
                pattern: /\b(sk_live_[0-9a-zA-Z]{24}|pk_live_[0-9a-zA-Z]{24})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'Stripe API key detected'
            },
            'private_key': {
                pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'Private key detected'
            },
            'high_entropy': {
                pattern: /\b[A-Za-z0-9+/=]{32,}\b/g,
                severity: 'Medium',
                type: 'Hardcoded Secret',
                description: 'High entropy string (potential secret)'
            },
            'email': {
                pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
                severity: 'Medium',
                type: 'PII Detected',
                description: 'Email address detected'
            },
            'phone': {
                pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g,
                severity: 'Medium',
                type: 'PII Detected',
                description: 'Phone number detected'
            },
            'ip_address': {
                pattern: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
                severity: 'Low',
                type: 'PII Detected',
                description: 'IP address detected'
            },
            'sensitive_keywords': {
                pattern: /\b(password|secret|api_key|token|ssn|credit_card|credentials)\s*[=:]\s*["']?[^"'\s]+/gi,
                severity: 'High',
                type: 'Hardcoded Secret',
                description: 'Sensitive keyword in assignment context'
            }
        };
    }

    _calculateEntropy(data) {
        if (!data) return 0;

        const counts = {};
        for (const char of data) {
            counts[char] = (counts[char] || 0) + 1;
        }

        let entropy = 0;
        const length = data.length;

        for (const count of Object.values(counts)) {
            const probability = count / length;
            entropy -= probability * Math.log2(probability);
        }

        return entropy;
    }

    scanContent(filePath, content) {
        const findings = [];
        const lines = content.split('\n');

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];

            for (const [patternName, patternInfo] of Object.entries(this.patterns)) {
                // Reset regex lastIndex for global patterns
                patternInfo.pattern.lastIndex = 0;

                let match;
                while ((match = patternInfo.pattern.exec(line)) !== null) {
                    // Additional filtering for high entropy strings
                    if (patternName === 'high_entropy') {
                        const matchedText = match[0];
                        if (this._calculateEntropy(matchedText) < 4.0) {
                            continue;
                        }
                        if (matchedText.length < 20) {
                            continue;
                        }
                    }

                    // Skip common false positives for AWS secret pattern
                    if (patternName === 'aws_secret_key') {
                        const matchedText = match[0];
                        const falsePositives = ['example', 'dummy', 'test', 'fake'];
                        if (falsePositives.some(fp => matchedText.toLowerCase().includes(fp))) {
                            continue;
                        }
                    }

                    const finding = {
                        file_path: filePath,
                        line_number: lineNum + 1,
                        severity: patternInfo.severity,
                        finding_type: patternInfo.type,
                        description: patternInfo.description,
                        code_snippet: line.trim()
                    };

                    findings.push(finding);
                }
            }
        }

        return findings;
    }
}

module.exports = PatternScanner;