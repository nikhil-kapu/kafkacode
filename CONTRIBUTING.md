# Contributing to KafkaCode

Thanks for your interest in improving KafkaCode! Contributions of all kinds are
welcome — bug reports, feature ideas, new detection patterns, and docs.

## Getting started

```bash
git clone https://github.com/nikhil-kapu/kafkacode.git
cd kafkacode
npm install
npm test
```

Run the scanner locally against any directory:

```bash
node src/cli.js scan /path/to/project --verbose
```

## Project layout

| Path | Purpose |
| ---- | ------- |
| `src/cli.js` | Command-line entrypoint |
| `src/FileScanner.js` | Discovers source files to scan |
| `src/PatternScanner.js` | Regex-based secret / PII detection (runs offline) |
| `src/LLMAnalyzer.js` | Optional AI-powered contextual analysis |
| `src/AnalysisEngine.js` | Orchestrates pattern + AI analysis |
| `src/ReportGenerator.js` | Formats the console report and privacy grade |

## Adding a detection pattern

Detection rules live in `PatternScanner._initPatterns()`. Each rule has a
`pattern` (regex), a `severity`, a `type`, and a `description`. When adding one:

1. Keep the regex focused to limit false positives.
2. Pick the appropriate severity (`Critical` / `High` / `Medium` / `Low`).
3. Add a fixture in `test/` that the rule should — and should not — match.

## Pull requests

1. Fork the repo and create a feature branch.
2. Keep changes focused; add or adjust tests where it makes sense.
3. Run `npm test` before pushing.
4. Open a PR describing the change and its motivation.

By contributing, you agree that your contributions are licensed under the
project's [MIT License](LICENSE).
