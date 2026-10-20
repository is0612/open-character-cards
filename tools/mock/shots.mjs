import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

// puppeteer-core 装在托管 node 的 workspace 里，ESM 不认 NODE_PATH，用 createRequire 定位
const WS = 'C:/Users/Administrator/.workbuddy/binaries/node/workspace'
const require = createRequire(path.join(WS, 'noop.js'))
const puppeteer = require('puppeteer-core')

const ROOT = path.resolve(process.cwd(), 'tools/mock')
const FILE = 'file:///' + path.join(ROOT, 'design.html').replace(/\\/g, '/')
const OUT = path.join(ROOT, 'out')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`))
  return hit ? hit.split('=')[1] : d
}
const SRC = arg('src', FILE)
const ONLY = arg('only', '')

fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=2', '--hide-scrollbars', '--font-render-hinting=none'],
  defaultViewport: null,
})
const page = await browser.newPage()
await page.goto(SRC, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready.then(() => true))
await page.evaluate(() => Promise.all(
  Array.from(document.images).filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r }))
))

// 图片加载自检
const broken = await page.evaluate(() => Array.from(document.images)
  .filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')))
if (broken.length) console.log('[warn] 图片未加载:', broken.join(', '))

const frames = await page.evaluate(() => Array.from(document.querySelectorAll('[data-shot]')).map((el) => {
  const r = el.getBoundingClientRect()
  return { id: el.dataset.shot, w: Math.round(r.width), h: Math.round(r.height) }
}))

console.log('[probe] 图 | 尺寸 | ink | ink-dim | ink-mute | gold')
for (const f of frames) {
  const line = await page.evaluate((id) => {
    const hex2rgb = (h) => {
      h = String(h).trim()
      if (!h) return [0, 0, 0]
      if (h[0] === '#') {
        if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
        return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
      }
      const m = h.match(/\d+/g)
      return m ? m.slice(0, 3).map(Number) : [0, 0, 0]
    }
    const lum = (c) => {
      const [r, g, b] = c.map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4) })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const ratio = (a, b) => {
      const x = lum(hex2rgb(a)), y = lum(hex2rgb(b))
      return ((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2)
    }
    const el = document.querySelector(`[data-shot="${id}"]`)
    const cs = getComputedStyle(document.documentElement)
    const bg = getComputedStyle(el).backgroundColor
    const probe = '#' + [bg]
    return [ratio(cs.getPropertyValue('--ink'), '#050a14'),
      ratio(cs.getPropertyValue('--ink-dim'), '#050a14'),
      ratio(cs.getPropertyValue('--ink-mute'), '#050a14'),
      ratio(cs.getPropertyValue('--gold'), '#050a14')].join(' | ')
  }, f.id)
  console.log(`[probe] ${f.id.padEnd(12)} ${f.w}x${f.h} | ${line}`)
}

for (const f of frames) {
  if (ONLY && !f.id.includes(ONLY)) continue
  await page.setViewport({ width: f.w, height: f.h, deviceScaleFactor: 2 })
  const top = await page.evaluate((id) => {
    const el = document.querySelector(`[data-shot="${id}"]`)
    const y = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, y)
    return Math.round(y)
  }, f.id)
  await new Promise((r) => setTimeout(r, 260))

  const scrollY = await page.evaluate(() => Math.round(window.scrollY))
  if (Math.abs(scrollY - top) > 1) console.log(`[warn] ${f.id} 滚动落点 ${scrollY} != ${top}`)

  // 裁切自检：找最近的 overflow 祖先当边界
  const note = await page.evaluate((id) => {
    const f = document.querySelector(`[data-shot="${id}"]`)
    let worst = 0, sel = '', clip = ''
    for (const el of f.querySelectorAll('*')) {
      let a = el.parentElement, holder = f
      while (a && a !== document.body) {
        const oy = getComputedStyle(a).overflowY
        if (oy === 'hidden' || oy === 'auto' || oy === 'scroll') { holder = a; break }
        a = a.parentElement
      }
      const over = Math.round(el.getBoundingClientRect().bottom - holder.getBoundingClientRect().bottom)
      if (over > worst) {
        worst = over
        sel = typeof el.className === 'string' ? el.className : el.tagName
        clip = String(holder.className || holder.tagName)
      }
    }
    // 帧自身是否溢出视口
    const fb = Math.round(f.getBoundingClientRect().bottom - window.innerHeight)
    const fr = Math.round(f.getBoundingClientRect().right - window.innerWidth)
    return { worst, sel: String(sel).slice(0, 34), clip: String(clip).slice(0, 24), fb, fr }
  }, f.id)

  // 截当前视口（已滚到帧顶部，视口尺寸 == 帧尺寸）
  await page.screenshot({ path: path.join(OUT, f.id + '.png') })
  const bits = []
  if (note.worst > 2) bits.push(`⚠ 被裁 ${note.worst}px @ ${note.sel} ← ${note.clip}`)
  if (note.fb > 1) bits.push(`⚠ 帧底超出视口 ${note.fb}px`)
  if (note.fr > 1) bits.push(`⚠ 帧右超出视口 ${note.fr}px`)
  console.log(`[shot] ${f.id.padEnd(12)} ${f.w}x${f.h}  ${bits.length ? bits.join(' | ') : 'ok'}`)
}

await browser.close()
