#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const FileScanner = require('./FileScanner');
const AnalysisEngine = require('./AnalysisEngine');
const ReportGenerator = require('./ReportGenerator');
const {
    loadConfig,
    loadBaseline,
    writeBaseline,
    getFindingFingerprint,
    isAtLeastSeverity,
    normalizeSeverity,
    normalizeArray
} = require('./ConfigLoader');

const program = new Command();
const VERSION = require('../package.json').version;

function collect(value, previous) {
    previous.push(value);
    return previous;
}

program
    .name('kafkacode')
    .description('KafkaCode - Privacy and Compliance Scanner')
    .version(VERSION);

program
    .command('scan')
    .description('Scan a directory for privacy issues')
    .argument('<directory>', 'Path to the source code directory to scan')
    .option('-v, --verbose', 'Print verbose progress updates during the scan')
    .option('-b, --badge', 'Print a copy-paste privacy-grade badge for your README')
    .option('-f, --format <format>', 'Output format: console, json, or sarif', 'console')
    .option('-o, --output <file>', 'Write output to a file instead of stdout')
    .option('-c, --config <file>', 'Path to a KafkaCode JSON config file')
    .option('--exclude <pattern>', 'Exclude a glob pattern from scanning (repeatable)', collect, [])
    .option('--baseline <file>', 'Ignore findings already present in a baseline file')
    .option('--update-baseline <file>', 'Write current findings to a baseline file and exit 0')
    .option('--min-severity <severity>', 'Minimum severity to report: low, medium, high, critical')
    .option('--fail-on <severity>', 'Fail only when findings are at least this severity', 'low')
    .option('--show-secrets', 'Show full matched snippets instead of redacting sensitive values')
    .option('--plain', 'Use compact console output without the ASCII banner')
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

    let config = {};
    try {
        config = loadConfig(directory, options.config);
    } catch (error) {
        console.error(`Error loading config: ${error.message}`);
        process.exit(1);
    }

    const minSeverity = normalizeSeverity(options.minSeverity || config.minSeverity || 'Low');
    const failOn = normalizeSeverity(options.failOn || config.failOn || 'Low');
    const excludes = [
        ...normalizeArray(config.exclude),
        ...normalizeArray(options.exclude)
    ];
    const baselinePath = options.baseline || config.baseline || '';
    const updateBaselinePath = options.updateBaseline || '';
    const showSecrets = options.showSecrets === true || config.showSecrets === true;
    const plain = options.plain === true || config.plain === true;
    const aiDisabled = options.ai === false || config.ai === false;

    if (verbose) {
        console.log('🚀 Starting KafkaCode privacy scan...');
        if (config.__path) {
            console.log(`⚙️  Loaded config: ${config.__path}`);
        }
    }

    try {
        // Initialize components
        const fileScanner = new FileScanner(directory, { exclude: excludes });
        const analysisEngine = new AnalysisEngine(verbose);
        if (aiDisabled) {
            analysisEngine.disableAi();
        }
        const reportGenerator = new ReportGenerator({ showSecrets, plain });

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
        let findings = await analysisEngine.analyzeFiles(files);
        const scanRoot = path.resolve(directory);
        findings = findings.map(finding => ({
            ...finding,
            fingerprint: getFindingFingerprint(finding, scanRoot)
        }));

        if (updateBaselinePath) {
            const resolvedBaseline = path.resolve(updateBaselinePath);
            writeBaseline(resolvedBaseline, findings, scanRoot);
            console.error(`✅ Wrote baseline with ${findings.length} findings to ${resolvedBaseline}`);
            process.exit(0);
        }

        if (baselinePath) {
            const resolvedBaseline = path.resolve(baselinePath);
            const baseline = loadBaseline(resolvedBaseline);
            findings = findings.filter(finding => !baseline.has(finding.fingerprint));
        }

        findings = findings.filter(finding => isAtLeastSeverity(finding.severity, minSeverity));

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
            if (!aiDisabled && !analysisEngine.aiEnabled()) {
                console.log('💡 Tip: set KAFKACODE_API_KEY to enable AI-powered contextual analysis. See the README.\n');
            }
            if (options.badge) {
                const badge = reportGenerator.getBadge(findings);
                console.log('🏷️  Privacy Grade Badge — paste into your README:\n');
                console.log(`    ${badge.markdown}\n`);
            }
        }

        // Exit non-zero when findings meet the failure threshold, unless --no-fail was passed
        const shouldFail = options.fail !== false && findings.some(finding => isAtLeastSeverity(finding.severity, failOn));
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
