import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'KafkaCode',
  description:
    'AI-powered privacy & compliance scanner — find PII leaks, hardcoded secrets, and compliance risks in your source code.',
  base: '/kafkacode/',
  lastUpdated: true,
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: '/kafkacode/logo4.png' }],
    ['meta', { property: 'og:title', content: 'KafkaCode' }],
    ['meta', { property: 'og:description', content: 'AI-powered privacy & compliance scanner for your source code.' }]
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
