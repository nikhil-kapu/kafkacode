# How It Works

KafkaCode runs two layers of analysis over your source files:

```
 your code ─▶ FileScanner ─▶ ┌─ PatternScanner  (regex, fully offline)
                             └─ LLMAnalyzer     (optional AI, opt-in)
                                      │
                                      ▼
                          ReportGenerator ─▶ grade + findings + exit code
```

## Pattern scanning (always on, offline)

A set of focused rules detects hardcoded secrets and PII directly on your
machine — **no network calls**. This covers common cloud/API tokens, AWS and
Stripe keys, private keys, database URLs, JWTs, high-entropy strings, emails,
phone numbers, and IP addresses.

Findings include stable rule IDs, confidence metadata, and fingerprints for
baseline workflows. Snippets are redacted by default so secrets and PII do not
leak into CI logs.

## AI analysis (optional, bring-your-own-key)

When you provide an API key, KafkaCode also sends *areas of interest* to an
OpenAI-compatible model for contextual findings that a regex can't catch — for
example, "user email is written to a log file." This layer is **opt-in**; see
[AI Mode](/guide/ai-mode).

::: tip Privacy first
With no API key configured, KafkaCode is 100% local — your code never leaves
your machine.
:::

## Scope

KafkaCode scans source files plus common configuration formats where secrets
often live: `.env`, JSON, YAML, TOML, INI, properties, XML, Terraform,
Dockerfiles, Markdown, and shell scripts. It automatically respects your
`.gitignore`, supports `.kafkacodeignore`, and skips common build/dependency
directories (`node_modules`, `dist`, `venv`, and more).
