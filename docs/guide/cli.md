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
| `--no-ai`       | Disable AI analysis (run pattern scan only) |
| `-V, --version` | Print the installed version |
| `-h, --help`    | Show help |

## Exit codes

| Code | Meaning |
| ---- | ------- |
| `0`  | No issues found |
| `1`  | Issues found, or the scan errored |

Because a non-zero exit fails a CI step, you can gate a build with a plain
command:

```bash
npx kafkacode scan ./src
```

## Examples

```bash
# Verbose scan of a folder
kafkacode scan ./src --verbose

# Pattern-only (skip AI even if a key is set)
kafkacode scan . --no-ai

# Print a badge for your README
kafkacode scan . --badge
```
