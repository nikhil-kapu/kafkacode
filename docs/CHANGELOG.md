# Documentation Changelog

## 2025-01-05

### Removed
- Removed inaccurate privacy claims about "local-only" analysis
- Removed statements that "code never leaves your machine"
- Removed claims about "local or self-hosted LLM models"

### Changed
- Updated "Privacy-First Design" to "Security-First Design" in introduction
- Revised security messaging to focus on:
  - Pattern scanning happens locally
  - No telemetry or tracking
  - Open source and auditable
  - Respects .gitignore automatically
  - MIT licensed

### Security
- Documentation now accurately reflects that the tool uses cloud-based AI analysis
- No backend endpoints or infrastructure details exposed
- All example secrets are clearly fake/placeholder values
