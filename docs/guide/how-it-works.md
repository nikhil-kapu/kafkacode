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
machine — **no network calls**. This covers AWS and Stripe keys, private keys,
high-entropy strings, emails, phone numbers, and IP addresses.

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

KafkaCode scans these file types: Python, JavaScript, TypeScript, Java, Go,
Ruby, and PHP. It automatically respects your `.gitignore` and skips common
build/dependency directories (`node_modules`, `dist`, `venv`, and more).
