# CLI Reference

## Usage

```bash
kafkacode scan <directory> [options]
```

## Options

| Option | Description |
| ------ | ----------- |
| `-v, --verbose` | Print progress updates during the scan |
| `-b, --badge`   | Print a copy-paste privacy-grade badge for your README |
| `-f, --format <fmt>` | Output format: `console` (default), `json`, or `sarif` |
| `-o, --output <file>` | Write output to a file instead of stdout |
| `--no-ai`       | Disable AI analysis (run pattern scan only) |
| `--no-fail`     | Exit `0` even when issues are found |
| `-V, --version` | Print the installed version |
| `-h, --help`    | Show help |

## Exit codes

| Code | Meaning |
| ---- | ------- |
| `0`  | No issues found (or `--no-fail` was passed) |
| `1`  | Issues found, or the scan errored |

Because a non-zero exit fails a CI step, you can gate a build with a plain
command:

```bash
npx kafkacode scan ./src
```

## Output formats

By default KafkaCode prints a human-readable report. Use `--format` for
machine-readable output, and `--output` to write it to a file.

```bash
# Structured JSON to stdout
kafkacode scan ./src --format json

# SARIF to a file, for GitHub code scanning
kafkacode scan ./src --format sarif --output kafkacode.sarif --no-fail
```

- **`json`** — a structured report (summary, privacy grade, and findings) for
  scripts, custom gates, and dashboards.
- **`sarif`** — SARIF 2.1.0, consumed by the GitHub Security tab and other
  tools. See [CI/CD Integration](/guide/ci-cd).

## Examples

```bash
# Verbose scan of a folder
kafkacode scan ./src --verbose

# Pattern-only (skip AI even if a key is set)
kafkacode scan . --no-ai

# Print a badge for your README
kafkacode scan . --badge

# JSON output for a custom gate
kafkacode scan ./src --format json --no-fail
```
