---
title: GDPR Code Scanning
description: Use KafkaCode to scan source code for PII leaks, hardcoded personal data, and GDPR/CCPA privacy compliance risks.
---

# GDPR Code Scanning

KafkaCode helps developers find privacy risks in source code before they become production issues. It is not a legal compliance certification tool, but it can support GDPR and CCPA engineering workflows by identifying code that exposes or mishandles personal data.

```bash
npx kafkacode scan ./src
```

## Privacy Risks KafkaCode Helps Catch

- Hardcoded personal data in source files
- Test fixtures containing emails or phone numbers
- Logs that include user identifiers or sensitive fields
- Insecure transmission patterns found by optional AI analysis
- Secrets and tokens that could expose systems containing personal data

## Local Pattern Scanning

KafkaCode's default pattern scanner runs on your machine. This makes it useful for regulated teams that need privacy checks without sending source code to a hosted service.

```bash
kafkacode scan ./src --no-ai
```

## Optional Contextual AI Analysis

Some privacy issues require context, such as a user email being written to a log or sent over an insecure channel. KafkaCode can perform optional AI analysis when you bring your own OpenAI-compatible API key.

```bash
export KAFKACODE_API_KEY=your_key_here
kafkacode scan ./src
```

Without an API key or backend endpoint, AI analysis is skipped.

## Privacy Grade

KafkaCode converts findings into an A+ to F privacy grade. This makes it easy to track risk across repositories and pull requests.

See [Privacy Grade](/guide/privacy-grading) for the scoring model.
