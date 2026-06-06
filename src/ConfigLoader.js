const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SEVERITY_ORDER = ['Low', 'Medium', 'High', 'Critical'];

function normalizeSeverity(severity, fallback = 'Low') {
    if (!severity) return fallback;
    const normalized = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
    return SEVERITY_ORDER.includes(normalized) ? normalized : fallback;
}

function severityRank(severity) {
    return SEVERITY_ORDER.indexOf(normalizeSeverity(severity));
}

function isAtLeastSeverity(severity, threshold) {
    return severityRank(severity) >= severityRank(threshold);
}

function normalizeArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return [value].filter(Boolean);
}

function loadJsonFile(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

function findDefaultConfig(rootDir) {
    const names = [
        'kafkacode.config.json',
        '.kafkacoderc',
        '.kafkacoderc.json'
    ];
    return names
        .map(name => path.join(rootDir, name))
        .find(filePath => fs.existsSync(filePath));
}

function loadConfig(rootDir, configPath) {
    const resolvedRoot = path.resolve(rootDir);
    const resolvedConfig = configPath
        ? path.resolve(configPath)
        : findDefaultConfig(resolvedRoot);

    const config = resolvedConfig ? loadJsonFile(resolvedConfig) : {};
    config.__path = resolvedConfig || null;
    return config;
}

function getFindingFingerprint(finding, cwd = process.cwd()) {
    const filePath = finding.file_path || finding.file || '';
    const relativeFile = filePath
        ? path.relative(cwd, filePath).split(path.sep).join('/')
        : '';
    const source = [
        finding.rule_id || finding.finding_type || 'unknown-rule',
        relativeFile,
        (finding.code_snippet || '').trim()
    ].join('\n');
    return crypto.createHash('sha256').update(source).digest('hex');
}

function loadBaseline(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
        return new Set();
    }

    const parsed = loadJsonFile(filePath);
    const findings = Array.isArray(parsed) ? parsed : normalizeArray(parsed.findings);
    return new Set(findings.map(item => {
        if (typeof item === 'string') return item;
        return item && item.fingerprint;
    }).filter(Boolean));
}

function writeBaseline(filePath, findings, cwd = process.cwd()) {
    const entries = findings.map(finding => {
        const filePathValue = finding.file_path || '';
        return {
            fingerprint: getFindingFingerprint(finding, cwd),
            ruleId: finding.rule_id || '',
            file: filePathValue ? path.relative(cwd, filePathValue).split(path.sep).join('/') : '',
            line: finding.line_number || 0,
            severity: finding.severity || 'Low',
            description: finding.description || ''
        };
    });

    const payload = {
        version: 1,
        generatedAt: new Date().toISOString(),
        findings: entries
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n');
}

module.exports = {
    SEVERITY_ORDER,
    normalizeSeverity,
    severityRank,
    isAtLeastSeverity,
    normalizeArray,
    loadConfig,
    loadBaseline,
    writeBaseline,
    getFindingFingerprint
};
