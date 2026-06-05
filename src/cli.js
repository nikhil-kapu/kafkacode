#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const FileScanner = require('./FileScanner');
const AnalysisEngine = require('./AnalysisEngine');
const ReportGenerator = require('./ReportGenerator');

const program = new Command();

program
    .name('kafkacode')
    .description('KafkaCode - Privacy and Compliance Scanner')
    .version('1.2.0');

program
    .command('scan')
    .description('Scan a directory for privacy issues')
    .argument('<directory>', 'Path to the source code directory to scan')
    .option('-v, --verbose', 'Print verbose progress updates during the scan')
    .action(async (directory, options) => {
        await runScan(directory, options);
    });

async function runScan(directory, options = {}) {
    const verbose = options.verbose || false;

    // Validate directory
    if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
        console.error(`Error: Directory '${directory}' does not exist or is not a directory.`);
        process.exit(1);
    }

    if (verbose) {
        console.log('🚀 Starting KafkaCode privacy scan...');
    }

    try {
        // Initialize components
        const fileScanner = new FileScanner(directory);
        const analysisEngine = new AnalysisEngine(verbose);
        const reportGenerator = new ReportGenerator();

        // Scan for files
        if (verbose) {
            console.log('📁 Discovering source code files...');
        }
        const files = fileScanner.scanFiles();

        if (!files.length) {
            console.log('No source code files found to analyze.');
            process.exit(0);
        }

        if (verbose) {
            console.log(`Found ${files.length} files to analyze`);
        }

        // Analyze files
        if (verbose) {
            console.log('🔍 Performing privacy analysis...');
        }
        const findings = await analysisEngine.analyzeFiles(files);

        // Generate and display report
        const report = reportGenerator.generateReport(directory, findings, files.length);
        console.log(report);

        // Return appropriate exit code
        process.exit(findings.length > 0 ? 1 : 0);

    } catch (error) {
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
            console.log('\n⚠️  Scan interrupted by user.');
            process.exit(1);
        } else {
            console.error(`❌ Error during scan: ${error.message}`);
            if (verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }
}

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\n⚠️  Scan interrupted by user.');
    process.exit(1);
});

program.parse();