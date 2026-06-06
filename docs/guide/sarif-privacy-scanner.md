---
title: SARIF Privacy Scanner
description: Generate SARIF from KafkaCode so PII, secret, and privacy findings appear in GitHub code scanning and security dashboards.
---

# SARIF Privacy Scanner

KafkaCode can output SARIF so privacy findings appear in tools that understand the Static Analysis Results Interchange Format, including GitHub code scanning.

```bash
npx kafkacode scan ./src --format sarif --output kafkacode.sarif --no-fail
```

## Why SARIF?

SARIF makes privacy and security findings machine-readable. Instead of only reading console output, teams can route findings into code scanning dashboards, pull request annotations, and security workflows.

KafkaCode SARIF output can include:

- PII findings
- Hardcoded secret findings
- Context-based privacy issues from optional AI analysis
- File paths and line numbers
- Severity levels and remediation guidance

## GitHub Code Scanning Workflow

```yaml
name: KafkaCode SARIF
on: [push, pull_request]

permissions:
  security-events: write
  contents: read

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx kafkacode scan . --format sarif --output kafkacode.sarif --no-fail
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: kafkacode.sarif
```

Use `--no-fail` when uploading SARIF so the upload runs even when findings exist.

## Local JSON Alternative

If your tooling does not support SARIF, use JSON:

```bash
npx kafkacode scan ./src --format json --output kafkacode.json --no-fail
```

See [CLI Reference](/guide/cli) for output options.
