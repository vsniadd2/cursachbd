import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const base = 'https://64b268c75f9a6acb0007b032c0c16967.magicpatterns.sh'
const ref = 'https://www.magicpatterns.com/'
const frame = 'src/cEBuG6TMhD5SBfUYCeVFJf.frame'

const files = [
  `${frame}/index.tsx`,
  `${frame}/components/Sidebar.tsx`,
  `${frame}/components/StatCards.tsx`,
  `${frame}/components/RevenueChart.tsx`,
  `${frame}/components/ScoreGauge.tsx`,
  `${frame}/components/Touchpoints.tsx`,
  `${frame}/components/LeadActivity.tsx`,
]

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { Referer: ref } }, (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => resolve(d))
      })
      .on('error', reject)
  })
}

function decode(raw) {
  const trimmed = raw.trim()
  if (trimmed.startsWith('export default ')) {
    const jsonPart = trimmed.slice('export default '.length).replace(/;$/, '')
    try {
      return JSON.parse(jsonPart)
    } catch {
      /* fall through */
    }
  }
  return raw
}

function cleanAppSource(code) {
  let cleaned = code
  cleaned = cleaned.replace(/^export const viewport =[^\n]+\n/m, '')
  cleaned = cleaned.replace(/^export const args =[\s\S]*?^}\n/m, '')
  cleaned = cleaned.replace(/^export const argTypes =[\s\S]*?^}\n/m, '')
  cleaned = cleaned.replace(/^type Props =[^\n]+\n/m, '')
  cleaned = cleaned.replace(
    /const \{ tab, score, userName, userRole \} = \{ \.\.\.args, \.\.\.props \}/,
    'const { tab = "Overview", score = 82, userName = "John Doe", userRole = "Admin" } = props',
  )
  cleaned = cleaned.replace(
    /export default function FlexoraDashboard\(props: Props\)/,
    'export default function FlexoraDashboard(props: { tab?: string; score?: number; userName?: string; userRole?: string } = {})',
  )
  return cleaned
}

const cssContent = `/* Flexora Dashboard — from Magic Patterns */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
@import 'tailwindcss';

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --color-canvas: #efefef;
  --color-shell: #f7f7f7;
  --color-surface: #ffffff;
  --color-line: #e9e9eb;
  --color-ink: #17171a;
  --color-ink-2: #4b4b52;
  --color-ink-3: #8a8a92;
  --color-brand: #ff6b2c;
  --color-brand-2: #ff9a6b;
  --color-brand-3: #ffc2a3;
  --color-brand-4: #ffe2d4;
  --color-brand-soft: #fff1ea;
  --color-pos: #22b45e;
  --color-pos-soft: #e8f8ee;
  --color-cell: #f2f2f3;
}

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

.tabular {
  font-variant-numeric: tabular-nums;
}
`

for (const f of files) {
  const url = `${base}/${f}?import=default&raw`
  const raw = await fetch(url)
  const code = decode(raw)
  if (f.endsWith('index.tsx')) {
    fs.mkdirSync(path.join(root, 'src'), { recursive: true })
    fs.writeFileSync(path.join(root, 'src/App.tsx'), cleanAppSource(code))
  } else if (f.includes('/components/')) {
    fs.mkdirSync(path.join(root, 'src/components'), { recursive: true })
    fs.writeFileSync(path.join(root, 'src/components', path.basename(f)), code)
  }
}

const pkg = await fetch(`${base}/package.json`)
fs.writeFileSync(path.join(root, 'package.json'), pkg)
fs.writeFileSync(path.join(root, 'src/index.css'), cssContent)

console.log('Downloaded Magic Patterns sources into', root)
