# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Changed
- Open-sourced under the MIT License.
- AI backend is now configured purely via the `KAFKACODE_BACKEND_ENDPOINT`
  environment variable (removed legacy build-time key handling).

## [1.2.0] - 2025-10-05

### Added
- Pattern-based detection for hardcoded secrets, API keys, and PII.
- AI-powered contextual privacy analysis.
- Support for Python, JavaScript, TypeScript, Java, Go, Ruby, and PHP.
- Console reporting with severity levels and an A+ to F privacy grade.
- `.gitignore`-aware file scanning.
- Non-zero exit codes for CI/CD integration.
