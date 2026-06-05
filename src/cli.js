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
    .version('1.4.0');

program
    .command('scan')
    .description('Scan a directory for privacy issues')
    .argument('<directory>', 'Path to the source code directory to scan')
    .option('-v, --verbose', 'Print verbose progress updates during the scan')
    .option('-b, --badge', 'Print a copy-paste privacy-grade badge for your README')
    .option('-f, --format <format>', 'Output format: console, json, or sarif', 'console')
    .option('-o, --output <file>', 'Write output to a file instead of stdout')
    .option('--no-ai', 'Disable AI-powered analysis (run pattern scan only)')
    .option('--no-fail', 'Exit 0 even when issues are found')
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

    // Validate the output format before doing any work
    const format = (options.format || 'console').toLowerCase();
    if (!['console', 'json', 'sarif'].includes(format)) {
        console.error(`Error: unknown --format '${options.format}'. Use 'console', 'json', or 'sarif'.`);
        process.exit(1);
    }

    if (verbose) {
        console.log('🚀 Starting KafkaCode privacy scan...');
    }

    try {
        // Initialize components
        const fileScanner = new FileScanner(directory);
        const analysisEngine = new AnalysisEngine(verbose);
        if (options.ai === false) {
            analysisEngine.disableAi();
        }
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

        // Render the findings in the requested format (validated above)
        let output;
        if (format === 'json') {
            output = reportGenerator.generateJson(directory, findings, files.length);
        } else if (format === 'sarif') {
            output = reportGenerator.generateSarif(findings);
        } else {
            output = reportGenerator.generateReport(directory, findings, files.length);
        }

        // Write to a file, or print to stdout
        if (options.output) {
            fs.writeFileSync(options.output, output);
            console.error(`✅ Wrote ${format} output to ${options.output}`);
        } else {
            console.log(output);
        }

        // Console-only extras — kept out of machine-readable output
        if (format === 'console' && !options.output) {
            if (options.ai !== false && !analysisEngine.aiEnabled()) {
                console.log('💡 Tip: set KAFKACODE_API_KEY to enable AI-powered contextual analysis. See the README.\n');
            }
            if (options.badge) {
                const badge = reportGenerator.getBadge(findings);
                console.log('🏷️  Privacy Grade Badge — paste into your README:\n');
                console.log(`    ${badge.markdown}\n`);
            }
        }

        // Exit non-zero when issues are found, unless --no-fail was passed
        const shouldFail = options.fail !== false && findings.length > 0;
        process.exit(shouldFail ? 1 : 0);

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