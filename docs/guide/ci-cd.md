# CI/CD Integration

## GitHub Action

KafkaCode ships an official [Action on the Marketplace](https://github.com/marketplace/actions/kafkacode-privacy-scan) —
add it in one step:

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

**Inputs:** `path` (directory to scan, default `.`) and `verbose` (`true` / `false`).

## Any CI

A non-zero exit fails the step, so a bare command is enough:

```bash
npx kafkacode scan ./src
```

## Pre-commit hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
npx kafkacode scan ./src || {
  echo "❌ Privacy issues found — commit aborted."
  exit 1
}
```

Make it executable with `chmod +x .git/hooks/pre-commit`.
