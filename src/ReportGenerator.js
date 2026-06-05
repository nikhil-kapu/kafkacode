const chalk = require('chalk');

class ReportGenerator {
    constructor() {
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

    generateReport(scanDir, findings, fileCount) {
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
                        `│ 📍 Location: ${finding.file_path || 'Unknown'}:${finding.line_number || 0}`,
                        `│ 🚨 Severity: ${finding.severity || 'Unknown'}`,
                        `│ 🔎 Detection: ${sourceBadge}`,
                        '│',
                        '│ 💾 Code:',
                        `│    ${(finding.line_number || 0).toString().padStart(3)} │ ${finding.code_snippet || 'N/A'}`
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