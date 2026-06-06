import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'KafkaCode',
  description:
    'Open-source, local-first privacy code scanner for PII leaks, hardcoded secrets, GDPR/CCPA compliance, SARIF, and CI/CD.',
  base: '/kafkacode/',
  lastUpdated: true,
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: '/kafkacode/logo4.png' }],
    ['meta', { property: 'og:title', content: 'KafkaCode - Open-Source Privacy Code Scanner' }],
    ['meta', { property: 'og:description', content: 'Local-first PII scanner and secret detection CLI for source code, CI/CD, GDPR, CCPA, and SARIF workflows.' }]
  ],
  themeConfig: {
    logo: '/logo4.png',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'npm', link: 'https://www.npmjs.com/package/kafkacode' },
      { text: 'Marketplace', link: 'https://github.com/marketplace/actions/kafkacode-privacy-scan' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'How It Works', link: '/guide/how-it-works' },
          { text: 'CLI Reference', link: '/guide/cli' },
          { text: 'AI Mode (BYOK)', link: '/guide/ai-mode' },
          { text: 'CI/CD Integration', link: '/guide/ci-cd' },
          { text: 'Privacy Grade', link: '/guide/privacy-grading' }
        ]
      },
      {
        text: 'Use Cases',
        items: [
          { text: 'PII Scanner for Source Code', link: '/guide/pii-scanner-for-source-code' },
          { text: 'Secret Scanning in CI/CD', link: '/guide/secret-scanning-in-ci-cd' },
          { text: 'GDPR Code Scanning', link: '/guide/gdpr-code-scanning' },
          { text: 'SARIF Privacy Scanner', link: '/guide/sarif-privacy-scanner' },
          { text: 'Local-First Privacy Scanner', link: '/guide/local-first-privacy-scanner' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nikhil-kapu/kafkacode' }
    ],
    search: { provider: 'local' },
    editLink: {
      pattern: 'https://github.com/nikhil-kapu/kafkacode/edit/main/docs/:path'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: '© 2026 KafkaLabs'
    }
  }
})
