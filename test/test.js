#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const PatternScanner = require('../src/PatternScanner');

// Keep tests hermetic: never call a real AI provider, even if a key is set locally.
delete process.env.KAFKACODE_API_KEY;
delete process.env.KAFKACODE_BACKEND_ENDPOINT;

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
    const sample = 'const awsKey = "AKIA1234567890ABCDEF";\nconst email = "jane.doe@example.com";';
    const findings = scanner.scanContent('sample.js', sample);
    const foundAws = findings.some(f => f.rule_id === 'KC_SECRET_AWS_ACCESS_KEY' && f.confidence === 'High');
    const foundEmail = findings.some(f => f.rule_id === 'KC_PII_EMAIL' && f.confidence === 'High');
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

// Test 6: JSON output is valid and structured
try {
    const out = execSync('node src/cli.js scan test/fixtures --format json --no-fail', { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    const hasRuleIds = parsed.findings.every(f => f.ruleId);
    const hasFingerprints = parsed.findings.every(f => f.fingerprint);
    const redacted = JSON.stringify(parsed).includes('[REDACTED]') &&
        !JSON.stringify(parsed).includes('jane.doe@example.com') &&
        !JSON.stringify(parsed).includes('AKIA1234567890ABCDEF');
    if (parsed.tool === 'kafkacode' && parsed.summary && parsed.summary.grade && Array.isArray(parsed.findings) && hasRuleIds && hasFingerprints && redacted) {
        console.log('✅ Test 6: JSON output is valid');
    } else {
        console.log('❌ Test 6: unexpected JSON shape or redaction failure');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Test 6: JSON output failed:', error.message);
    process.exit(1);
}

// Test 7: SARIF output is valid 2.1.0
try {
    const out = execSync('node src/cli.js scan test/fixtures --format sarif --no-fail', { encoding: 'utf8' });
    const sarif = JSON.parse(out);
    const driver = sarif.runs && sarif.runs[0] && sarif.runs[0].tool.driver;
    const hasFingerprints = sarif.runs[0].results.every(result => result.partialFingerprints && result.partialFingerprints.kafkacode);
    if (sarif.version === '2.1.0' && driver && driver.name === 'KafkaCode' && Array.isArray(sarif.runs[0].results) && hasFingerprints) {
        console.log('✅ Test 7: SARIF output is valid');
    } else {
        console.log('❌ Test 7: unexpected SARIF shape');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Test 7: SARIF output failed:', error.message);
    process.exit(1);
}

// Test 8: --show-secrets opt-in exposes full snippets
try {
    const out = execSync('node src/cli.js scan test/fixtures --format json --show-secrets --no-fail', { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    if (JSON.stringify(parsed).includes('jane.doe@example.com') && JSON.stringify(parsed).includes('AKIA1234567890ABCDEF')) {
        console.log('✅ Test 8: --show-secrets exposes full snippets');
    } else {
        console.log('❌ Test 8: expected unredacted snippets with --show-secrets');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Test 8: --show-secrets failed:', error.message);
    process.exit(1);
}

// Test 9: config exclude suppresses matching files
try {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kafkacode-config-'));
    fs.writeFileSync(path.join(tmp, 'secret.js'), 'const awsKey = "AKIA1234567890ABCDEF";\n');
    fs.writeFileSync(path.join(tmp, 'safe.js'), 'const ok = true;\n');
    const configPath = path.join(tmp, 'kafkacode.config.json');
    fs.writeFileSync(configPath, JSON.stringify({ exclude: ['secret.js'] }));
    const out = execSync(`node src/cli.js scan ${tmp} --format json --config ${configPath} --no-fail`, { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    if (parsed.summary.totalIssues === 0) {
        console.log('✅ Test 9: config exclude suppresses files');
    } else {
        console.log('❌ Test 9: expected excluded fixture to produce no findings');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Test 9: config exclude failed:', error.message);
    process.exit(1);
}

// Test 10: baseline update and filtering suppress existing findings
try {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kafkacode-baseline-'));
    const baselinePath = path.join(tmp, 'baseline.json');
    execSync(`node src/cli.js scan test/fixtures --update-baseline ${baselinePath}`, { encoding: 'utf8' });
    const out = execSync(`node src/cli.js scan test/fixtures --format json --baseline ${baselinePath} --no-fail`, { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    if (parsed.summary.totalIssues === 0) {
        console.log('✅ Test 10: baseline filters existing findings');
    } else {
        console.log('❌ Test 10: expected baseline to filter fixture findings');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Test 10: baseline failed:', error.message);
    process.exit(1);
}

// Test 11: severity gates control reporting and failure behavior
try {
    const out = execSync('node src/cli.js scan test/fixtures --format json --min-severity critical --fail-on critical', { encoding: 'utf8' });
    console.log('❌ Test 11: expected critical finding to fail the scan');
    process.exit(1);
} catch (error) {
    const stdout = error.stdout || '';
    const parsed = JSON.parse(stdout);
    if (parsed.summary.totalIssues === 1 && parsed.findings[0].severity === 'Critical') {
        const noFail = execSync('node src/cli.js scan test/fixtures --format json --min-severity critical --fail-on high --no-fail', { encoding: 'utf8' });
        const noFailParsed = JSON.parse(noFail);
        if (noFailParsed.summary.totalIssues === 1) {
            console.log('✅ Test 11: severity gates control output and failure');
        } else {
            console.log('❌ Test 11: unexpected --no-fail severity output');
            process.exit(1);
        }
    } else {
        console.log('❌ Test 11: unexpected severity gate output');
        process.exit(1);
    }
}

// Test 12: scanner includes config-style files where secrets often live
try {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kafkacode-files-'));
    fs.writeFileSync(path.join(tmp, '.env'), 'SENDGRID_API_KEY=SG.abcdefghijklmnop.qrstuvwxyz1234567890\n');
    fs.writeFileSync(path.join(tmp, 'deployment.yaml'), 'DATABASE_URL: postgres://user:pass@db.internal:5432/app\n');
    const out = execSync(`node src/cli.js scan ${tmp} --format json --no-fail`, { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    const ruleIds = parsed.findings.map(f => f.ruleId);
    if (ruleIds.includes('KC_SECRET_SENDGRID_KEY') && ruleIds.includes('KC_SECRET_DATABASE_URL')) {
        console.log('✅ Test 12: config-style files are scanned');
    } else {
        console.log('❌ Test 12: expected .env and YAML findings, got:', ruleIds);
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Test 12: config-style file scanning failed:', error.message);
    process.exit(1);
}

console.log('\n🎉 All tests passed!');
