# KafkaCode Documentation

This directory contains the Mintlify documentation for KafkaCode.

## Preview Locally

To preview the documentation locally:

```bash
cd docs
mintlify dev
```

The documentation will be available at http://localhost:3000 (or the next available port).

## Documentation Structure

```
docs/
├── mint.json                 # Mintlify configuration
├── introduction.mdx          # Home page
├── quickstart.mdx           # Quick start guide
├── installation.mdx         # Installation instructions
│
├── concepts/                # Core concepts
│   ├── how-it-works.mdx
│   ├── detection-methods.mdx
│   ├── privacy-grading.mdx
│   └── supported-languages.mdx
│
├── usage/                   # Usage guides
│   ├── basic-scanning.mdx
│   ├── cli-options.mdx
│   ├── interpreting-results.mdx
│   └── ci-cd-integration.mdx
│
├── api-reference/          # API documentation
│   ├── overview.mdx
│   ├── file-scanner.mdx
│   ├── analysis-engine.mdx
│   ├── pattern-scanner.mdx
│   ├── llm-analyzer.mdx
│   └── report-generator.mdx
│
├── examples/               # Practical examples
│   ├── basic-scan.mdx
│   ├── github-actions.mdx
│   ├── gitlab-ci.mdx
│   └── pre-commit-hook.mdx
│
└── advanced/               # Advanced topics
    ├── custom-patterns.mdx
    ├── configuration.mdx
    └── troubleshooting.mdx
```

## Deploy to Mintlify

To deploy the documentation to Mintlify:

1. Create a Mintlify account at https://mintlify.com
2. Connect your GitHub repository
3. Configure the documentation path to `/docs`
4. Deploy

## Making Changes

1. Edit the `.mdx` files in the appropriate directory
2. Preview changes locally with `mintlify dev`
3. Commit and push changes to deploy

## Requirements

- Node.js 14+
- Mintlify CLI: `npm install -g mintlify`

## Resources

- [Mintlify Documentation](https://mintlify.com/docs)
- [MDX Documentation](https://mdxjs.com/)
- [KafkaCode GitHub](https://github.com/nikhil-kapu/kafkacode)
