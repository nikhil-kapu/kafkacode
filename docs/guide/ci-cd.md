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
          fail-on: high
          plain: true
```

Common inputs:

| Input | Default | Description |
| --- | --- | --- |
| `path` | `.` | Directory to scan |
| `version` | `latest` | npm package version to run |
| `format` | `console` | `console`, `json`, or `sarif` |
| `output` | _(empty)_ | Output file path |
| `fail-on` | `low` | Fail when findings are at least this severity |
| `min-severity` | `low` | Hide findings below this severity |
| `no-fail` | `false` | Exit `0` even when findings exist |
| `no-ai` | `false` | Force pattern-only scanning |
| `plain` | `false` | Compact console output |
| `show-secrets` | `false` | Print unredacted snippets |
| `exclude` | _(empty)_ | Newline-separated glob patterns |

## GitHub code scanning (SARIF)

Emit SARIF and upload it so findings appear in the **Security** tab and inline
on pull requests:

```yaml
# .github/workflows/privacy.yml
name: Privacy Scan
on: [push, pull_request]
permissions:
  security-events: write
  contents: read
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nikhil-kapu/kafkacode@v1
        with:
          path: ./src
          format: sarif
          output: kafkacode.sarif
          no-fail: true
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: kafkacode.sarif
```

`--no-fail` keeps the scan step green so the upload always runs; the findings
still surface as code-scanning alerts.

## Any CI

A non-zero exit fails the step, so a bare command is enough:

```bash
npx kafkacode scan ./src
```

For existing codebases, create a baseline and fail only on new findings:

```bash
npx kafkacode scan ./src --update-baseline .kafkacode-baseline.json
npx kafkacode scan ./src --baseline .kafkacode-baseline.json
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
