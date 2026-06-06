class PatternScanner {
    constructor() {
        this.patterns = this._initPatterns();
    }

    _initPatterns() {
        return {
            'aws_access_key': {
                id: 'KC_SECRET_AWS_ACCESS_KEY',
                pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'AWS Access Key ID detected',
                confidence: 'High',
                secret: true
            },
            'aws_secret_key': {
                id: 'KC_SECRET_AWS_SECRET_KEY',
                pattern: /\b(?:aws_?secret_?access_?key|AWS_SECRET_ACCESS_KEY)\b\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})/gi,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'AWS Secret Access Key detected',
                confidence: 'High',
                secret: true,
                secretGroup: 1
            },
            'stripe_key': {
                id: 'KC_SECRET_STRIPE_KEY',
                pattern: /\b((?:sk|pk|rk)_live_[0-9a-zA-Z]{24,})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'Stripe live API key detected',
                confidence: 'High',
                secret: true
            },
            'private_key': {
                id: 'KC_SECRET_PRIVATE_KEY',
                pattern: /-----BEGIN\s+(?:RSA\s+|DSA\s+|EC\s+|OPENSSH\s+)?PRIVATE\s+KEY-----/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'Private key detected',
                confidence: 'High',
                secret: true
            },
            'github_token': {
                id: 'KC_SECRET_GITHUB_TOKEN',
                pattern: /\b((?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{22,}_[A-Za-z0-9_]{59,})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'GitHub token detected',
                confidence: 'High',
                secret: true
            },
            'openai_key': {
                id: 'KC_SECRET_OPENAI_KEY',
                pattern: /\b(sk-(?:proj-)?[A-Za-z0-9_-]{32,})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'OpenAI API key detected',
                confidence: 'High',
                secret: true
            },
            'anthropic_key': {
                id: 'KC_SECRET_ANTHROPIC_KEY',
                pattern: /\b(sk-ant-[A-Za-z0-9_-]{32,})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'Anthropic API key detected',
                confidence: 'High',
                secret: true
            },
            'google_api_key': {
                id: 'KC_SECRET_GOOGLE_API_KEY',
                pattern: /\b(AIza[0-9A-Za-z_-]{35})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'Google API key detected',
                confidence: 'High',
                secret: true
            },
            'slack_token': {
                id: 'KC_SECRET_SLACK_TOKEN',
                pattern: /\b(xox[baprs]-[A-Za-z0-9-]{20,})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'Slack token detected',
                confidence: 'High',
                secret: true
            },
            'slack_webhook': {
                id: 'KC_SECRET_SLACK_WEBHOOK',
                pattern: /\b(https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+)\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'Slack webhook URL detected',
                confidence: 'High',
                secret: true
            },
            'sendgrid_key': {
                id: 'KC_SECRET_SENDGRID_KEY',
                pattern: /\b(SG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'SendGrid API key detected',
                confidence: 'High',
                secret: true
            },
            'npm_token': {
                id: 'KC_SECRET_NPM_TOKEN',
                pattern: /\b(npm_[A-Za-z0-9]{36,})\b/g,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'npm token detected',
                confidence: 'High',
                secret: true
            },
            'jwt': {
                id: 'KC_SECRET_JWT',
                pattern: /\b(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g,
                severity: 'High',
                type: 'Hardcoded Secret',
                description: 'JSON Web Token detected',
                confidence: 'Medium',
                secret: true
            },
            'database_url': {
                id: 'KC_SECRET_DATABASE_URL',
                pattern: /\b((?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s"']+:[^\s"']+@[^\s"']+)/gi,
                severity: 'Critical',
                type: 'Hardcoded Secret',
                description: 'Database connection URL with credentials detected',
                confidence: 'High',
                secret: true
            },
            'high_entropy': {
                id: 'KC_SECRET_HIGH_ENTROPY',
                pattern: /\b[A-Za-z0-9+/=]{32,}\b/g,
                severity: 'Medium',
                type: 'Hardcoded Secret',
                description: 'High entropy string (potential secret)',
                confidence: 'Low',
                secret: true
            },
            'email': {
                id: 'KC_PII_EMAIL',
                pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
                severity: 'Medium',
                type: 'PII Detected',
                description: 'Email address detected',
                confidence: 'High',
                secret: false
            },
            'phone': {
                id: 'KC_PII_PHONE',
                pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g,
                severity: 'Medium',
                type: 'PII Detected',
                description: 'Phone number detected',
                confidence: 'Medium',
                secret: false
            },
            'ip_address': {
                id: 'KC_PII_IP_ADDRESS',
                pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g,
                severity: 'Low',
                type: 'PII Detected',
                description: 'IP address detected',
                confidence: 'Medium',
                secret: false
            },
            'sensitive_keywords': {
                id: 'KC_SECRET_SENSITIVE_ASSIGNMENT',
                pattern: /\b(password|passwd|secret|api[_-]?key|token|ssn|credit[_-]?card|credentials?)\b\s*[:=]\s*["']?([^"'\s,;]+)/gi,
                severity: 'High',
                type: 'Hardcoded Secret',
                description: 'Sensitive keyword in assignment context',
                confidence: 'Medium',
                secret: true,
                secretGroup: 2
            }
        };
    }

    _isLikelyPlaceholder(data) {
        const value = (data || '').toLowerCase();
        return [
            'example', 'sample', 'dummy', 'test', 'fake', 'placeholder',
            'changeme', 'your_', 'your-', '<', 'xxxx', '****'
        ].some(token => value.includes(token));
    }

    _defaultSuggestion(patternInfo) {
        if (patternInfo.type === 'PII Detected') {
            return 'Avoid hardcoding personal data; load it from approved runtime sources and redact it from logs.';
        }
        if (patternInfo.id === 'KC_SECRET_HIGH_ENTROPY') {
            return 'Review this value and move secrets to environment variables or a secrets manager.';
        }
        return 'Move credentials to environment variables or a secrets manager, then rotate the exposed value.';
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
                        if (this._isLikelyPlaceholder(matchedText)) {
                            continue;
                        }
                    }

                    const matchedText = patternInfo.secretGroup ? match[patternInfo.secretGroup] : match[0];
                    if (patternInfo.secret && this._isLikelyPlaceholder(matchedText)) {
                        continue;
                    }

                    const finding = {
                        file_path: filePath,
                        line_number: lineNum + 1,
                        rule_id: patternInfo.id,
                        severity: patternInfo.severity,
                        finding_type: patternInfo.type,
                        description: patternInfo.description,
                        suggestion: patternInfo.suggestion || this._defaultSuggestion(patternInfo),
                        confidence: patternInfo.confidence || 'Medium',
                        code_snippet: line.trim(),
                        matched_text: matchedText,
                        secret: patternInfo.secret === true
                    };

                    findings.push(finding);
                }
            }
        }

        return findings;
    }
}

module.exports = PatternScanner;
