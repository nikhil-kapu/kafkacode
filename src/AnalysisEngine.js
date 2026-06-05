const fs = require('fs');
const PatternScanner = require('./PatternScanner');
const LLMAnalyzer = require('./LLMAnalyzer');

class AnalysisEngine {
    constructor(verbose = false) {
        this.verbose = verbose;
        this.patternScanner = new PatternScanner();
        this.llmAnalyzer = new LLMAnalyzer();
        this.llmAnalyzer.verbose = verbose;
    }

    async analyzeFile(filePath) {
        if (this.verbose) {
            console.log(`Analyzing: ${filePath}`);
        }

        let content;
        try {
            content = fs.readFileSync(filePath, 'utf-8');
        } catch (error) {
            if (this.verbose) {
                console.log(`Error reading ${filePath}: ${error.message}`);
            }
            return [];
        }

        const findings = [];

        // Pattern-based analysis first
        const patternFindings = this.patternScanner.scanContent(filePath, content);
        findings.push(...patternFindings);

        // LLM-based analysis with pattern findings as context
        const llmFindings = await this.llmAnalyzer.analyzeFile(filePath, content, patternFindings);
        findings.push(...llmFindings);

        return findings;
    }

    async analyzeFiles(filePaths) {
        const allFindings = [];

        for (const filePath of filePaths) {
            const fileFindings = await this.analyzeFile(filePath);
            allFindings.push(...fileFindings);
        }

        return allFindings;
    }
}

module.exports = AnalysisEngine;