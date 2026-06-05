# Privacy Grade

Every scan is distilled into a single grade so a whole team understands the
result at a glance.

| Grade | Meaning |
| :---: | ------- |
| 🟢 A+ / A / A- | Excellent — no or only low-severity issues |
| 🟡 B+ / B / B- | Good — a few medium-severity issues |
| 🟠 C+ / C / C- | Needs attention — high-severity issues present |
| 🔴 D / F | Critical secret or PII exposure |

## Severity levels

| Severity | Examples |
| -------- | -------- |
| 🚨 Critical | AWS keys, Stripe live keys, private keys |
| 🔥 High | `password=`, `api_key=`, `token=` in assignments |
| ⚠️ Medium | Emails, phone numbers, high-entropy strings |
| 🔵 Low | IP addresses |

## Shareable badge

Generate a badge from your latest scan:

```bash
kafkacode scan . --badge
```

It prints a Markdown snippet you can paste into your README:

```
![Privacy Grade: A+](https://img.shields.io/badge/Privacy%20Grade-A%2B-brightgreen)
```

→ ![Privacy Grade: A+](https://img.shields.io/badge/Privacy%20Grade-A%2B-brightgreen)
