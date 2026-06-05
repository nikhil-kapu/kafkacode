---
layout: home

hero:
  name: KafkaCode
  text: Privacy & compliance scanner
  tagline: Catch PII leaks, hardcoded secrets, and compliance risks before they ship.
  image:
    src: /logo4.png
    alt: KafkaCode
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/nikhil-kapu/kafkacode

features:
  - icon: 🔑
    title: Secret detection
    details: AWS & Stripe keys, private keys, and high-entropy strings.
  - icon: 🕵️
    title: PII detection
    details: Emails, phone numbers, and IP addresses.
  - icon: 🤖
    title: AI analysis (BYOK)
    details: Optional contextual analysis with your own API key — defaults to Groq.
  - icon: 🎓
    title: Privacy grade
    details: A single A+ to F score, with a shareable README badge.
  - icon: ⚡
    title: Fast & offline
    details: Pattern scanning runs entirely on your machine — no network.
  - icon: 🚀
    title: CI/CD ready
    details: Clean exit codes and a one-line GitHub Action.
---

## Try it in one command

```bash
npx kafkacode scan .
```

No install, no signup, no config. Want the AI layer? [Bring your own key.](/guide/ai-mode)
