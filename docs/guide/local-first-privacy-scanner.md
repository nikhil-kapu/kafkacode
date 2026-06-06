---
title: Local-First Privacy Scanner
description: KafkaCode runs pattern-based privacy and secret scanning locally by default, with optional BYO-key AI analysis for contextual findings.
---

# Local-First Privacy Scanner

KafkaCode is designed to give developers useful privacy scanning without requiring a hosted KafkaCode service. Pattern scanning runs locally and works with no signup, no API key, and no network calls.

```bash
npx kafkacode scan .
```

## What Runs Locally?

The default scanner checks supported source files for:

- Hardcoded secrets
- API keys and tokens
- Private keys
- PII such as email addresses, phone numbers, and IP addresses
- Sensitive assignments and high-entropy strings

These pattern-based checks run on your machine.

## Enforcing Pattern-Only Mode

Use `--no-ai` to disable AI analysis even if an API key is configured:

```bash
kafkacode scan . --no-ai
```

This is useful for privacy-sensitive repos, regulated development workflows, and local pre-commit checks.

## Optional AI Is Bring-Your-Own-Key

KafkaCode can add contextual AI findings, but only when configured:

```bash
export KAFKACODE_API_KEY=your_key_here
kafkacode scan ./src
```

You control the provider through `KAFKACODE_API_URL` and `KAFKACODE_MODEL`, or you can route analysis to your own backend with `KAFKACODE_BACKEND_ENDPOINT`.

## Recommended Workflow

For most teams:

1. Run pattern-only scans locally and in pre-commit hooks.
2. Use SARIF output in CI for code scanning visibility.
3. Enable BYO-key AI analysis only where source-code sharing policy allows it.

See [AI Mode](/guide/ai-mode) for configuration details.
