#!/usr/bin/env node

const { execSync } = require('child_process');
const PatternScanner = require('../src/PatternScanner');

console.log('🧪 Running KafkaCode tests...\n');

// Test 1: CLI help command works
try {
    const output = execSync('node src/cli.js --help', { encoding: 'utf8' });
    if (output.includes('Privacy and Compliance Scanner')) {
        console.log('✅ Test 1: CLI help command works');
    } else {
        console.log('❌ Test 1: unexpected help output');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Test 1: CLI help command failed:', error.message);
    process.exit(1);
}

// Test 2: PatternScanner detects a hardcoded secret and PII (offline, deterministic)
try {
    const scanner = new PatternScanner();
    const sample = 'const awsKey = "AKIAIOSFODNN7EXAMPLE";\nconst email = "jane.doe@example.com";';
    const findings = scanner.scanContent('sample.js', sample);
    const foundAws = findings.some(f => f.description.includes('AWS Access Key'));
    const foundEmail = findings.some(f => f.description.includes('Email'));
    if (foundAws && foundEmail) {
        console.log('✅ Test 2: PatternScanner detects secrets and PII');
    } else {
        console.log('❌ Test 2: expected AWS key and email findings, got:', findings.map(f => f.description));
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Test 2: PatternScanner test failed:', error.message);
    process.exit(1);
}

// Test 3: end-to-end scan produces a report
try {
    const output = execSync('node src/cli.js scan test/fixtures 2>&1', { encoding: 'utf8' });
    if (output.includes('PRIVACY SCAN REPORT')) {
        console.log('✅ Test 3: Scan command produces a report');
    } else {
        console.log('❌ Test 3: no report produced');
        process.exit(1);
    }
} catch (error) {
    // The scan command exits non-zero when findings are present — that is expected.
    if (error.stdout && error.stdout.includes('PRIVACY SCAN REPORT')) {
        console.log('✅ Test 3: Scan command produces a report (findings reported)');
    } else {
        console.log('❌ Test 3: Scan command failed:', error.message);
        process.exit(1);
    }
}

// Test 4: privacy-grade badge generation
try {
    const ReportGenerator = require('../src/ReportGenerator');
    const rg = new ReportGenerator();
    const badge = rg.getBadge([{ severity: 'Critical' }]);
    if (badge.grade === 'F' && badge.url.includes('img.shields.io') && badge.markdown.includes('Privacy Grade')) {
        console.log('✅ Test 4: Privacy-grade badge generation works');
    } else {
        console.log('❌ Test 4: unexpected badge output:', badge);
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Test 4: badge test failed:', error.message);
    process.exit(1);
}

// Test 5: AI analysis is opt-in — disabled when no key/backend is configured
try {
    delete process.env.KAFKACODE_API_KEY;
    delete process.env.KAFKACODE_BACKEND_ENDPOINT;
    const LLMAnalyzer = require('../src/LLMAnalyzer');
    const analyzer = new LLMAnalyzer();
    if (analyzer.isEnabled() === false) {
        console.log('✅ Test 5: AI is disabled without an API key');
    } else {
        console.log('❌ Test 5: AI should be disabled without a key');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Test 5: AI gating test failed:', error.message);
    process.exit(1);
}

console.log('\n🎉 All tests passed!');
