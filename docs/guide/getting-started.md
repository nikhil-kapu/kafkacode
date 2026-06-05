# Getting Started

KafkaCode is a privacy & compliance scanner for your source code. It finds PII
leaks, hardcoded secrets, and compliance risks, then distills the result into a
single **A+ → F privacy grade**.

## Run it in one command

```bash
npx kafkacode scan .
```

No install, no signup, no config.

## Install globally

```bash
npm install -g kafkacode
kafkacode scan ./src
```

Requires Node.js 14 or newer.

## Your first scan

```bash
kafkacode scan ./src --verbose
```

KafkaCode prints findings grouped by severity, a privacy grade, and exits with a
non-zero code if any issues are found — which makes it easy to gate a CI build.

## Next steps

- [How It Works](/guide/how-it-works) — the pattern + AI layers
- [CLI Reference](/guide/cli) — every flag and exit code
- [AI Mode (BYOK)](/guide/ai-mode) — enable contextual AI analysis
- [CI/CD Integration](/guide/ci-cd) — the GitHub Action and pre-commit hook
