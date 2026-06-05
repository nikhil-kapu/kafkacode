# Changelog

All notable changes to this project are documented in this file.

## [1.4.0] - 2026-06-05

### Added
- Machine-readable output: `--format json` and `--format sarif`.
- SARIF 2.1.0 integrates with GitHub code scanning (Security tab + inline PR annotations).
- `--output <file>` writes the report to a file instead of stdout.
- `--no-fail` exits `0` even when issues are found (useful when uploading SARIF).

## [1.3.0] - 2026-06-05

### Added
- Bring-your-own-key AI analysis: set `KAFKACODE_API_KEY` to call an
  OpenAI-compatible provider directly (defaults to Groq). `KAFKACODE_API_URL`
  and `KAFKACODE_MODEL` override the endpoint and model.
- `--badge` flag that prints a shareable privacy-grade badge for your README.
- `--no-ai` flag to force pattern-only scanning.

### Changed
- Open-sourced under the MIT License.
- AI analysis is now opt-in. With no key configured, scanning is pattern-only
  and fully offline — no code leaves the machine.

### Removed
- Silent "mock" analysis fallback; on an API error the snippet is now skipped
  instead of fabricating findings.

## [1.2.0] - 2025-10-05

### Added
- Pattern-based detection for hardcoded secrets, API keys, and PII.
- AI-powered contextual privacy analysis.
- Support for Python, JavaScript, TypeScript, Java, Go, Ruby, and PHP.
- Console reporting with severity levels and an A+ to F privacy grade.
- `.gitignore`-aware file scanning.
- Non-zero exit codes for CI/CD integration.
