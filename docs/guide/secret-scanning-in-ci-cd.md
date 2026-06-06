---
title: Secret Scanning in CI/CD
description: Add KafkaCode to CI/CD pipelines to detect hardcoded secrets, API keys, tokens, and PII before code is merged or deployed.
---

# Secret Scanning in CI/CD

KafkaCode can run as a lightweight secret scanner in CI/CD pipelines. It detects hardcoded credentials and privacy issues in source code, then exits non-zero when findings are present.

```bash
npx kafkacode scan .
```

## GitHub Actions

Use KafkaCode on every push and pull request:

```yaml
name: Privacy Scan
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx kafkacode scan .
```

## What Counts as a Secret?

KafkaCode flags common secret patterns, including:

- AWS access keys
- Stripe live keys
- Private keys
- Tokens and API keys in assignments
- Passwords and credentials in code
- High-entropy strings that may represent credentials

## SARIF Upload

For GitHub code scanning, generate SARIF and upload it:

```yaml
permissions:
  security-events: write
  contents: read

steps:
  - uses: actions/checkout@v4
  - run: npx kafkacode scan . --format sarif --output kafkacode.sarif --no-fail
  - uses: github/codeql-action/upload-sarif@v3
    with:
      sarif_file: kafkacode.sarif
```

`--no-fail` keeps the SARIF upload step reachable while still surfacing findings in GitHub.

## Pre-Commit Hook

```bash
#!/bin/bash
npx kafkacode scan . || {
  echo "Privacy or secret findings detected."
  exit 1
}
```

KafkaCode complements deep git-history scanners by focusing on current source code, PII, privacy grading, and developer-friendly CI feedback.
