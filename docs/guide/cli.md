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
| `-c, --config <file>` | Load a KafkaCode JSON config file |
| `--exclude <pattern>` | Exclude a glob pattern from scanning. Repeatable |
| `--baseline <file>` | Ignore findings already present in a baseline file |
| `--update-baseline <file>` | Write current findings to a baseline file and exit `0` |
| `--min-severity <severity>` | Minimum severity to report: `low`, `medium`, `high`, `critical` |
| `--fail-on <severity>` | Fail only when findings are at least this severity |
| `--plain` | Use compact console output without the ASCII banner |
| `--show-secrets` | Show full snippets instead of redacting sensitive values |
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

By default KafkaCode prints a human-readable report and redacts matched secrets
and PII in snippets. Use `--plain` for compact CI output, `--format` for
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

## Configuration

KafkaCode automatically loads the first config file it finds in the scan root:

- `kafkacode.config.json`
- `.kafkacoderc`
- `.kafkacoderc.json`

Example:

```json
{
  "exclude": ["test/fixtures/**", "docs/**"],
  "minSeverity": "medium",
  "failOn": "high",
  "ai": false,
  "plain": true
}
```

Use `.kafkacodeignore` for scan-specific ignore patterns. It accepts the same
glob style as `--exclude`.

## Baselines

Baselines help teams adopt KafkaCode in existing repositories without failing
every build on known findings.

```bash
# Capture current findings
kafkacode scan . --update-baseline .kafkacode-baseline.json

# Ignore those findings in future scans
kafkacode scan . --baseline .kafkacode-baseline.json
```

New findings still appear and can fail CI.

## Redaction

KafkaCode masks secrets and PII by default in console, JSON, and SARIF output.
Use `--show-secrets` only when you explicitly need full snippets locally:

```bash
kafkacode scan . --show-secrets
```

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

# Fail only on high or critical findings
kafkacode scan ./src --fail-on high

# Compact CI output, hide low-severity findings
kafkacode scan ./src --plain --min-severity medium
```
