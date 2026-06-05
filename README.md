# KafkaCode Privacy Scanner

<div align="center">
  <h3>by <a href="https://kafkalabs.com">KafkaLabs</a></h3>
  <p>🔐 <strong>Shift-left privacy and compliance scanner for source code</strong></p>
  <p>
    <a href="https://kafkalabs.com/kafka-code">Website</a> •
    <a href="https://github.com/nikhil-kapu/kafkacode">GitHub</a> •
    <a href="https://www.npmjs.com/package/kafkacode">npm</a>
  </p>
</div>

---

KafkaCode is an AI-powered privacy scanner by **KafkaLabs** that helps developers identify potential privacy issues, PII leaks, and compliance violations in their source code before they reach production.

## Features

- 🔍 **Pattern-based Detection**: Identifies hardcoded secrets, API keys, and sensitive data
- 🤖 **AI-powered Analysis**: Uses advanced LLM analysis for contextual privacy issues
- ⚡ **Fast & Efficient**: Scans entire codebases in seconds
- 🎯 **Multiple File Types**: Supports Python, JavaScript, TypeScript, Java, Go, Ruby, PHP
- 📊 **Detailed Reports**: Beautiful console reports with severity levels
- 🚀 **CI/CD Ready**: Easy integration with build pipelines

## Installation

```bash
npm install -g kafkacode
```

Or using npx (no installation required):
```bash
npx kafkacode scan /path/to/your/project
```

## Usage

**Basic Scan:**
```bash
kafkacode scan /path/to/your/project
```

**Verbose Output:**
```bash
kafkacode scan /path/to/your/project --verbose
```

## What it detects

- **Critical Issues**: AWS keys, Stripe keys, Private keys
- **High Severity**: Sensitive keywords in assignment context
- **Medium Severity**: Email addresses, Phone numbers, High entropy strings
- **Low Severity**: IP addresses, URLs

## Privacy Grade

KafkaCode assigns a privacy grade (A+ to F) based on the severity and number of issues found:

- **A+/A/A-**: Excellent privacy practices
- **B+/B/B-**: Good privacy practices with minor issues
- **C+/C/C-**: Moderate privacy issues that should be addressed
- **D**: Multiple high-severity privacy issues
- **F**: Critical privacy vulnerabilities detected

## Example Output

```
🎯 PRIVACY SCAN REPORT
═══════════════════════════════════════

📊 SCAN SUMMARY
📁 Directory: ./src
⏰ Timestamp: 2024-01-15 10:30:45
📄 Files Scanned: 25
🔍 Total Issues: 3
🏆 Privacy Grade: 🟡B-
```

## License

MIT License - Copyright (c) 2025 KafkaLabs

See [LICENSE](LICENSE) file for details.

## About KafkaLabs

KafkaCode is built by [KafkaLabs](https://kafkalabs.com), helping developers build privacy-first applications.

- 🌐 **Website**: [kafkalabs.com/kafka-code](https://kafkalabs.com/kafka-code)
- 📧 **Contact**: contact@kafkalabs.com
- 💬 **Issues**: [GitHub Issues](https://github.com/nikhil-kapu/kafkacode/issues)

---

<div align="center">
  Made with ❤️ by <a href="https://kafkalabs.com">KafkaLabs</a>
</div>