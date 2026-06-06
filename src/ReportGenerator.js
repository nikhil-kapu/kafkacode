const chalk = require('chalk');
const path = require('path');

let VERSION = '0.0.0';
try {
    VERSION = require('../package.json').version;
} catch (_) { /* fall back to the default */ }

class ReportGenerator {
    constructor(options = {}) {
        this.showSecrets = options.showSecrets === true;
        this.plain = options.plain === true;
        this.reportTime = new Date();
        this.severityIcons = {
            'Critical': '🚨',
            'High': '🔥',
            'Medium': '⚠️',
            'Low': '🔵'
        };
        this.severityOrder = ['Critical', 'High', 'Medium', 'Low'];
    }

    _calculateGrade(findings) {
        if (!findings.length) {
            return 'A+';
        }

        const severityCounts = {};
        this.severityOrder.forEach(severity => {
            severityCounts[severity] = 0;
        });

        for (const finding of findings) {
            const severity = finding.severity || 'Low';
            if (severityCounts.hasOwnProperty(severity)) {
                severityCounts[severity]++;
            }
        }

        // Grading logic
        if (severityCounts['Critical'] > 0) {
            return 'F';
        } else if (severityCounts['High'] > 3) {
            return 'D';
        } else if (severityCounts['High'] > 0) {
            return 'C-';
        } else if (severityCounts['Medium'] > 5) {
            return 'B-';
        } else if (severityCounts['Medium'] > 0) {
            return 'B';
        } else if (severityCounts['Low'] > 0) {
            return 'A-';
        } else {
            return 'A+';
        }
    }

    // Public: return the privacy grade (A+ .. F) for a set of findings.
    getGrade(findings) {
        return this._calculateGrade(findings);
    }

    // Public: build a shields.io privacy-grade badge for embedding in a README.
    getBadge(findings) {
        const grade = this._calculateGrade(findings);
        const colorMap = {
            'A+': 'brightgreen', 'A': 'brightgreen', 'A-': 'green',
            'B+': 'yellowgreen', 'B': 'yellowgreen', 'B-': 'yellow',
            'C+': 'yellow', 'C': 'orange', 'C-': 'orange',
            'D': 'red', 'F': 'red'
        };
        const color = colorMap[grade] || 'lightgrey';
        const url = `https://img.shields.io/badge/Privacy%20Grade-${encodeURIComponent(grade)}-${color}`;
        return { grade, url, markdown: `![Privacy Grade: ${grade}](${url})` };
    }

    _maskValue(value) {
        if (!value) return value;
        if (this.showSecrets) return value;
        if (value.length <= 6) return '[REDACTED]';
        return `${value.slice(0, 3)}...[REDACTED]...${value.slice(-3)}`;
    }

    _sanitizeSnippet(finding) {
        const snippet = finding.code_snippet || '';
        if (this.showSecrets || !snippet) return snippet;

        let sanitized = snippet;
        if (finding.matched_text) {
            sanitized = sanitized.split(finding.matched_text).join(this._maskValue(finding.matched_text));
        }

        // Defense in depth for snippets from contextual AI findings.
        sanitized = sanitized
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL_REDACTED]')
            .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]')
            .replace(/\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]')
            .replace(/\b((?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g, '[TOKEN_REDACTED]')
            .replace(/\b(sk-(?:proj-)?[A-Za-z0-9_-]{24,}|sk-ant-[A-Za-z0-9_-]{24,})\b/g, '[API_KEY_REDACTED]')
            .replace(/\b(AKIA[0-9A-Z]{16})\b/g, '[AWS_ACCESS_KEY_REDACTED]')
            .replace(/\b((?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s"']+:[^\s"']+@[^\s"']+)/gi, '[DATABASE_URL_REDACTED]');

        return sanitized;
    }

    _displayPath(filePath) {
        if (!filePath) return 'Unknown';
        const relative = path.relative(process.cwd(), filePath).split(path.sep).join('/');
        return relative && !relative.startsWith('..') ? relative : filePath;
    }

    // Public: render findings as a structured JSON report.
    generateJson(scanDir, findings, fileCount) {
        const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        for (const f of findings) {
            const s = f.severity || 'Low';
            if (Object.prototype.hasOwnProperty.call(severityCounts, s)) severityCounts[s]++;
        }
        const cwd = process.cwd();
        const rel = (p) => (p ? path.relative(cwd, p).split(path.sep).join('/') : '');
        const report = {
            tool: 'kafkacode',
            version: VERSION,
            directory: scanDir,
            timestamp: this.reportTime.toISOString(),
            summary: {
                filesScanned: fileCount,
                totalIssues: findings.length,
                grade: this._calculateGrade(findings),
                severityCounts
            },
            findings: findings.map((f) => ({
                ruleId: f.rule_id || '',
                file: rel(f.file_path),
                line: f.line_number || 0,
                severity: f.severity || 'Low',
                type: f.finding_type || 'Issue',
                description: f.description || '',
                suggestion: f.suggestion || '',
                confidence: f.confidence || 'Medium',
                source: f.source === 'llm' ? 'ai' : 'pattern',
                fingerprint: f.fingerprint || '',
                snippet: this._sanitizeSnippet(f)
            }))
        };
        return JSON.stringify(report, null, 2);
    }

    // Public: render findings as SARIF 2.1.0 (for GitHub code scanning).
    generateSarif(findings) {
        const cwd = process.cwd();
        const rel = (p) => (p ? path.relative(cwd, p).split(path.sep).join('/') : 'unknown');
        const levelFor = (sev) => {
            if (sev === 'Critical' || sev === 'High') return 'error';
            if (sev === 'Medium') return 'warning';
            return 'note';
        };
        const slug = (s) => ((s || 'issue').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'issue');

        const rules = new Map();
        for (const f of findings) {
            const id = f.rule_id || slug(f.finding_type);
            if (!rules.has(id)) {
                rules.set(id, {
                    id,
                    name: f.finding_type || 'Issue',
                    shortDescription: { text: f.description || f.finding_type || 'Issue' },
                    defaultConfiguration: { level: levelFor(f.severity) },
                    properties: {
                        confidence: f.confidence || 'Medium',
                        category: f.finding_type || 'Issue'
                    }
                });
            }
        }

        const results = findings.map((f) => ({
            ruleId: f.rule_id || slug(f.finding_type),
            level: levelFor(f.severity),
            message: { text: f.description || 'Privacy issue detected' },
            locations: [{
                physicalLocation: {
                    artifactLocation: { uri: rel(f.file_path) },
                    region: { startLine: Math.max(1, f.line_number || 1) }
                }
            }],
            partialFingerprints: f.fingerprint ? { kafkacode: f.fingerprint } : undefined,
            properties: {
                severity: f.severity || 'Low',
                confidence: f.confidence || 'Medium',
                source: f.source === 'llm' ? 'ai' : 'pattern',
                snippet: this._sanitizeSnippet(f)
            }
        }));

        const sarif = {
            $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
            version: '2.1.0',
            runs: [{
                tool: {
                    driver: {
                        name: 'KafkaCode',
                        informationUri: 'https://github.com/nikhil-kapu/kafkacode',
                        version: VERSION,
                        rules: Array.from(rules.values())
                    }
                },
                results
            }]
        };
        return JSON.stringify(sarif, null, 2);
    }

    _groupFindingsBySeverity(findings) {
        const groups = {};
        this.severityOrder.forEach(severity => {
            groups[severity] = [];
        });

        for (const finding of findings) {
            const severity = finding.severity || 'Low';
            if (groups.hasOwnProperty(severity)) {
                groups[severity].push(finding);
            }
        }

        return groups;
    }

    _getGradeColor(grade) {
        const colors = {
            'A+': '🟢', 'A': '🟢', 'A-': '🟢',
            'B+': '🟡', 'B': '🟡', 'B-': '🟡',
            'C+': '🟠', 'C': '🟠', 'C-': '🟠',
            'D': '🔴', 'F': '🔴'
        };
        return colors[grade] || '⚪';
    }

    _countSeverities(findings) {
        const severityCounts = {};
        this.severityOrder.forEach(severity => {
            severityCounts[severity] = 0;
        });

        for (const finding of findings) {
            const severity = finding.severity || 'Low';
            if (severityCounts.hasOwnProperty(severity)) {
                severityCounts[severity]++;
            }
        }

        return severityCounts;
    }

    generatePlainReport(scanDir, findings, fileCount) {
        const severityCounts = this._countSeverities(findings);
        const grade = this._calculateGrade(findings);
        const lines = [
            `KafkaCode Privacy Scan`,
            `Directory: ${scanDir}`,
            `Files scanned: ${fileCount}`,
            `Issues: ${findings.length}`,
            `Privacy grade: ${grade}`,
            `Severity: Critical ${severityCounts.Critical}, High ${severityCounts.High}, Medium ${severityCounts.Medium}, Low ${severityCounts.Low}`,
            ''
        ];

        if (!findings.length) {
            lines.push('No privacy issues detected.');
            return lines.join('\n');
        }

        const groupedFindings = this._groupFindingsBySeverity(findings);
        for (const severity of this.severityOrder) {
            const severityFindings = groupedFindings[severity];
            if (!severityFindings.length) continue;

            lines.push(`${severity.toUpperCase()}`);
            for (const finding of severityFindings) {
                lines.push(`- ${this._displayPath(finding.file_path)}:${finding.line_number || 0} ${finding.rule_id || 'N/A'} ${finding.description || 'Privacy issue detected'}`);
                lines.push(`  ${this._sanitizeSnippet(finding) || 'N/A'}`);
                if (finding.suggestion) {
                    lines.push(`  Suggestion: ${finding.suggestion}`);
                }
            }
            lines.push('');
        }

        return lines.join('\n');
    }

    generateReport(scanDir, findings, fileCount) {
        if (this.plain) {
            return this.generatePlainReport(scanDir, findings, fileCount);
        }

        const reportLines = [];

        // ASCII Art Header
        reportLines.push(
            '',
            chalk.red('╔═══════════════════════════════════════════════════════════════════════════════╗'),
            chalk.red('║                                                                               ║'),
            chalk.red('║    ██╗  ██╗ █████╗ ███████╗██╗  ██╗ █████╗  ██████╗ ██████╗ ██████╗ ███████╗ ║'),
            chalk.red('║    ██║ ██╔╝██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝ ║'),
            chalk.red('║    █████╔╝ ███████║█████╗  █████╔╝ ███████║██║     ██║   ██║██║  ██║█████╗   ║'),
            chalk.red('║    ██╔═██╗ ██╔══██║██╔══╝  ██╔═██╗ ██╔══██║██║     ██║   ██║██║  ██║██╔══╝   ║'),
            chalk.red('║    ██║  ██╗██║  ██║██║     ██║  ██╗██║  ██║╚██████╗╚██████╔╝██████╔╝███████╗ ║'),
            chalk.red('║    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝ ║'),
            chalk.red('║                                                                               ║'),
            chalk.red('║                   🔐 SHIFT-LEFT PRIVACY & COMPLIANCE SCANNER 🔐                ║'),
            chalk.red('║                        Powered by AI • Built for Developers                   ║'),
            chalk.red('║                                                                               ║'),
            chalk.red('╚═══════════════════════════════════════════════════════════════════════════════╝'),
            '',
            '🎯 PRIVACY SCAN REPORT',
            '═'.repeat(80),
            ''
        );

        // Summary box
        const severityCounts = this._countSeverities(findings);

        const grade = this._calculateGrade(findings);
        const gradeColor = this._getGradeColor(grade);

        // Count LLM vs Mock findings
        const llmCount = findings.filter(f => f.source === 'llm').length;
        const patternCount = findings.length - llmCount;

        const timestamp = this.reportTime.toISOString().slice(0, 19).replace('T', ' ');

        reportLines.push(
            '┌─────────────────────────────────────────────────────────────────────────────┐',
            '│                              📊 SCAN SUMMARY                                │',
            '├─────────────────────────────────────────────────────────────────────────────┤',
            `│ 📁 Directory: ${scanDir.padEnd(60)} │`,
            `│ ⏰ Timestamp: ${timestamp.padEnd(60)} │`,
            `│ 📄 Files Scanned: ${fileCount.toString().padEnd(57)} │`,
            `│ 🔍 Total Issues: ${findings.length.toString().padEnd(58)} │`,
            `│ 🏆 Privacy Grade: ${gradeColor}${grade.padEnd(56)} │`,
            '│                                                                             │',
            '│ 🎯 Detection Methods:                                                       │',
            `│   • Pattern-based: ${patternCount} issues                                      │`,
            `│   • AI-powered: ${llmCount} issues                                            │`,
            '│                                                                             │',
            '│ 📈 Severity Breakdown:                                                      │',
            `│   🚨 Critical: ${severityCounts['Critical'].toString().padEnd(10)} 🔥 High: ${severityCounts['High'].toString().padEnd(14)} │`,
            `│   ⚠️  Medium: ${severityCounts['Medium'].toString().padEnd(11)} 🔵 Low: ${severityCounts['Low'].toString().padEnd(15)} │`,
            '└─────────────────────────────────────────────────────────────────────────────┘',
            ''
        );

        // Findings breakdown
        if (!findings.length) {
            reportLines.push(
                '┌─────────────────────────────────────────────────────────────────────────────┐',
                '│                          🎉 CONGRATULATIONS! 🎉                            │',
                '│                                                                             │',
                '│                   ✨ No privacy issues detected! ✨                       │',
                '│                                                                             │',
                '│              Your codebase follows privacy best practices!                 │',
                '│                                                                             │',
                '└─────────────────────────────────────────────────────────────────────────────┘',
                ''
            );
        } else {
            const groupedFindings = this._groupFindingsBySeverity(findings);

            for (const severity of this.severityOrder) {
                const severityFindings = groupedFindings[severity];
                if (!severityFindings.length) {
                    continue;
                }

                const icon = this.severityIcons[severity];
                const colorBar = '█'.repeat(Math.min(severityFindings.length, 40));

                reportLines.push(
                    '',
                    `╭${'─'.repeat(77)}╮`,
                    `│ ${icon} ${severity.toUpperCase()} SEVERITY ISSUES (${severityFindings.length} found)`.padEnd(76) + '│',
                    `│ ${colorBar}`.padEnd(76) + '│',
                    `╰${'─'.repeat(77)}╯`,
                    ''
                );

                for (let i = 0; i < severityFindings.length; i++) {
                    const finding = severityFindings[i];
                    const sourceBadge = finding.source === 'llm' ? '🤖 AI' : '🔍 Pattern';

                    reportLines.push(
                        `┌── Issue #${i + 1} ──────────────────────────────────────────────────────────`,
                        `│ ${icon} ${finding.description || 'Privacy issue detected'}`,
                        '│',
                        `│ 📍 Location: ${this._displayPath(finding.file_path)}:${finding.line_number || 0}`,
                        `│ 🚨 Severity: ${finding.severity || 'Unknown'}`,
                        `│ 🎚️  Confidence: ${finding.confidence || 'Medium'}`,
                        `│ 🧩 Rule: ${finding.rule_id || 'N/A'}`,
                        `│ 🔎 Detection: ${sourceBadge}`,
                        '│',
                        '│ 💾 Code:',
                        `│    ${(finding.line_number || 0).toString().padStart(3)} │ ${this._sanitizeSnippet(finding) || 'N/A'}`
                    );

                    if (finding.suggestion) {
                        reportLines.push(
                            '│',
                            '│ 💡 Suggestion:',
                            `│    ${finding.suggestion}`
                        );
                    }

                    reportLines.push(
                        '└────────────────────────────────────────────────────────────────────────',
                        ''
                    );
                }
            }
        }

        // Footer
        reportLines.push(
            '',
            '─'.repeat(80),
            '🚀 KafkaCode · AI-powered privacy & compliance scanner',
            '📚 Docs & issues: https://github.com/nikhil-kapu/kafkacode',
            '🛡️  Keep your code secure, keep your users safe!',
            '─'.repeat(80),
            ''
        );

        return reportLines.join('\n');
    }
}

module.exports = ReportGenerator;
