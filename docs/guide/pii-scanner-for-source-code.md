---
title: PII Scanner for Source Code
description: Use KafkaCode as a local-first PII scanner for source code to find emails, phone numbers, IP addresses, and privacy risks before release.
---

# PII Scanner for Source Code

KafkaCode scans application source code for personally identifiable information (PII) before it reaches production. It is designed for developers who want a fast local CLI that fits into pull requests, pre-commit hooks, and CI/CD.

```bash
npx kafkacode scan ./src
```

## What KafkaCode Flags

KafkaCode detects common PII and privacy-risk indicators in supported source files:

- Email addresses
- Phone numbers
- IP addresses
- High-entropy strings that may be secrets
- Sensitive assignments such as `password=`, `token=`, `api_key=`, and `secret=`
- Optional AI-context findings, such as logging or transmitting personal data unsafely

## Why Scan Source Code for PII?

PII often appears in code through fixtures, tests, logs, seed data, examples, and temporary debugging. Even when the data is not production data, hardcoded personal information can create privacy review, compliance, and trust issues.

KafkaCode helps catch those issues early and assigns a privacy grade from A+ to F so teams can quickly understand risk.

## Local-First by Default

Pattern-based PII scanning runs locally and requires no network calls. AI analysis is optional and only runs when you configure a provider key or self-hosted backend.

```bash
kafkacode scan ./src --no-ai
```

Use `--no-ai` when you want to enforce pattern-only scanning in regulated or sensitive environments.

## CI/CD Use

Run KafkaCode in CI to fail builds when PII or secrets are found:

```bash
npx kafkacode scan ./src
```

For GitHub code scanning, emit SARIF:

```bash
npx kafkacode scan ./src --format sarif --output kafkacode.sarif --no-fail
```

See [CI/CD Integration](/guide/ci-cd) for full workflows.
