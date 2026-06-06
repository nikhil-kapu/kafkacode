<div align="center">

<img src="docs/logo4.png" width="104" alt="KafkaCode logo" />

# KafkaCode - Open-Source Privacy Code Scanner

**Local-first PII scanner and secret detection CLI for source code, CI/CD, GDPR, CCPA, and SARIF workflows.**

KafkaCode catches PII leaks, hardcoded secrets, and privacy compliance risks before they ship. One command gives you a clear **A+ → F privacy grade**, CI-ready exit codes, JSON/SARIF output, and optional BYO-key AI analysis.

[![npm version](https://img.shields.io/npm/v/kafkacode.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/kafkacode)
[![npm downloads](https://img.shields.io/npm/dm/kafkacode.svg?color=cb3837)](https://www.npmjs.com/package/kafkacode)
[![CI](https://img.shields.io/github/actions/workflow/status/nikhil-kapu/kafkacode/ci.yml?branch=main&label=CI&logo=github)](https://github.com/nikhil-kapu/kafkacode/actions)
[![license](https://img.shields.io/npm/l/kafkacode.svg?color=blue)](LICENSE)
[![node](https://img.shields.io/node/v/kafkacode.svg?color=339933&logo=node.js)](package.json)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[📖 Documentation](https://nikhil-kapu.github.io/kafkacode/) · [Quickstart](#-quickstart) · [Features](#-features) · [CI/CD](#-cicd-integration) · [Contributing](#-contributing)

</div>

---

## Why KafkaCode?

Most scanners stop at *"you leaked an AWS key."* KafkaCode goes further — it grades how
your code handles **personal data**, flags **GDPR/CCPA** risks, and catches hardcoded
secrets with a local-first pattern scanner and an optional **AI pass** for the context
that regex alone can't see.

You get one number a whole team understands — a **privacy grade from A+ to F** — plus a
non-zero exit code that fails the build when something sensitive slips in.

```bash
npx kafkacode scan .
```

No install. No signup. No config.

## ⚡ Quickstart

```bash
# Run it once, anywhere (no install)
npx kafkacode scan .

# Or install globally
npm install -g kafkacode
kafkacode scan ./src --verbose
```

## ✨ Features

- 🔑 **Secret detection** — AWS & Stripe keys, private keys, high-entropy strings
- 🕵️ **PII detection** — emails, phone numbers, IP addresses
- 🛡️ **Privacy compliance scanning** — source-code checks for GDPR, CCPA, and data privacy risks
- 🤖 **AI-powered analysis** — contextual privacy issues a regex would miss
- 🎓 **Privacy grade** — a single, shareable **A+ → F** score
- 🏷️ **Grade badge** — drop your score into your README (`--badge`)
- ⚡ **Fast & offline** — pattern scanning needs no network
- 📄 **SARIF & JSON output** — integrate with GitHub code scanning and security dashboards
- 🧰 **Config, ignores & baselines** — adopt safely in existing repositories
- 🔒 **Redacted output by default** — prevent secrets from leaking into logs
- 🌐 **7 languages** — Python, JavaScript, TypeScript, Java, Go, Ruby, PHP
- 🚀 **CI/CD ready** — clean exit codes + a one-line GitHub Action

## 📊 Example output

```text
🎯 PRIVACY SCAN REPORT
════════════════════════════════════════════════════════════════

📊 SCAN SUMMARY
   📁 Directory:      ./src
   📄 Files Scanned:  18
   🔍 Total Issues:   4
   🏆 Privacy Grade:  🔴 F

   🚨 Critical: 1    🔥 High: 1    ⚠️  Medium: 2    🔵 Low: 0

🚨 CRITICAL
  ┌─ AWS Access Key ID detected
  │  📍 src/config.js:12
  │  💡 Move credentials to environment variables or a secrets manager.
  └─

⚠️  MEDIUM
  ┌─ Email address detected (PII)
  │  📍 src/users.js:47
  │  💡 Avoid hardcoding personal data; load it at runtime.
  └─
```

## 🏷️ Privacy grade & badge

KafkaCode distills every scan into one grade:

| Grade | Meaning |
| :---: | ------- |
| 🟢 **A+ / A / A-** | Excellent — no or only low-severity issues |
| 🟡 **B+ / B / B-** | Good — a few medium-severity issues |
| 🟠 **C+ / C / C-** | Needs attention — high-severity issues present |
| 🔴 **D / F** | Critical privacy/secret exposure |

Show it off in your own README:

```bash
kafkacode scan . --badge
```

```text
🏷️  Privacy Grade Badge — paste into your README:

    ![Privacy Grade: A+](https://img.shields.io/badge/Privacy%20Grade-A%2B-brightgreen)
```

→ ![Privacy Grade: A+](https://img.shields.io/badge/Privacy%20Grade-A%2B-brightgreen)

## 🚀 CI/CD integration

### GitHub Action

```yaml
# .github/workflows/privacy.yml
name: Privacy Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nikhil-kapu/kafkacode@v1
        with:
          path: ./src
```

### Any CI / pre-commit

```bash
# Exits non-zero when issues are found, failing the build
npx kafkacode scan ./src

# Fail only on high or critical findings
npx kafkacode scan ./src --fail-on high

# Generate SARIF for GitHub code scanning
npx kafkacode scan ./src --format sarif --output kafkacode.sarif --no-fail
```

## 🔍 What it detects

| Severity | Examples |
| -------- | -------- |
| 🚨 **Critical** | AWS keys, Stripe live keys, private keys |
| 🔥 **High** | JWTs, `password=`, `api_key=`, `token=` and other secrets in assignments |
| ⚠️ **Medium** | Emails, phone numbers, high-entropy strings |
| 🔵 **Low** | IP addresses |

## 🧠 How it works

```
 your code ─▶ FileScanner ─▶ ┌─ PatternScanner  (regex, fully offline)
                             └─ LLMAnalyzer     (optional AI context)
                                      │
                                      ▼
                          ReportGenerator ─▶ grade + findings + exit code
```

Pattern-based detection runs entirely on your machine with no network calls. The
optional AI layer adds contextual findings for the cases static rules can't catch.

## 🤖 AI mode (optional, bring-your-own-key)

Pattern scanning works out of the box with **no setup and no network calls**. To add
AI-powered contextual findings, bring your own API key — KafkaCode calls an
OpenAI-compatible chat API directly, defaulting to [Groq](https://console.groq.com/keys)
(which has a free tier):

```bash
export KAFKACODE_API_KEY=your_key_here
kafkacode scan ./src
```

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `KAFKACODE_API_KEY` | _(unset)_ | Your provider API key — **enables AI mode** |
| `KAFKACODE_API_URL` | `https://api.groq.com/openai/v1` | OpenAI-compatible base URL (Groq, OpenAI, OpenRouter, local models…) |
| `KAFKACODE_MODEL`   | `llama-3.1-8b-instant` | Model name |

Without a key, KafkaCode runs **pattern-only and never sends your code anywhere**.
Pass `--no-ai` to force pattern-only even when a key is set.

## 🆚 How it compares

|                              | KafkaCode | gitleaks / trufflehog | semgrep |
| ---------------------------- | :-------: | :-------------------: | :-----: |
| Hardcoded secrets            |     ✅    |   ✅ (deep, git log)  |   ➖    |
| PII / personal-data findings |     ✅    |          ➖           |   ➖    |
| Privacy grade (A+ → F)       |     ✅    |          ➖           |   ➖    |
| AI contextual analysis       |     ✅    |          ➖           |   ➖    |
| SARIF output                 |     ✅    |          ➖           |   ✅    |
| Zero-config, one command     |     ✅    |          ✅           |   ➖    |

KafkaCode focuses on **privacy and developer-friendly grading** — it complements
deep secret scanners rather than replacing them.

## 📚 Guides

- [PII scanner for source code](https://nikhil-kapu.github.io/kafkacode/guide/pii-scanner-for-source-code)
- [Secret scanning in CI/CD](https://nikhil-kapu.github.io/kafkacode/guide/secret-scanning-in-ci-cd)
- [GDPR code scanning](https://nikhil-kapu.github.io/kafkacode/guide/gdpr-code-scanning)
- [SARIF privacy scanner](https://nikhil-kapu.github.io/kafkacode/guide/sarif-privacy-scanner)
- [Local-first privacy scanner](https://nikhil-kapu.github.io/kafkacode/guide/local-first-privacy-scanner)

## 🗺️ Roadmap

- [x] **Bring-your-own-key AI** — call Groq / OpenAI-compatible providers directly
- [x] **`--json` & SARIF output** — SARIF integrates with the GitHub Security tab
- [x] Config file &amp; `.kafkacodeignore`
- [x] Baseline file to adopt on existing codebases
- [x] More file types (`.env`, YAML, Terraform, Dockerfiles)
- [x] Redacted snippets by default, with `--show-secrets` opt-in
- [ ] Provider validation for selected secret types
- [ ] More language-aware privacy rules

Ideas and PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## 🤝 Contributing

Contributions of all kinds are welcome — bug reports, new detection patterns, and docs.
Start with [CONTRIBUTING.md](CONTRIBUTING.md), and please report security issues per our
[Security Policy](SECURITY.md).

## 📄 License

[MIT](LICENSE) © KafkaLabs

<div align="center">
<sub>🛡️ Keep your code secure, keep your users safe.</sub>
</div>
