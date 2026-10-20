/**
 * 对真实运行的 dev server 截图，用来和设计稿逐帧对照。
 * 用法: node tools/mock/shots-live.mjs
 */
import path from 'node:path'
import fs from 'node:fs'
import { createRequire } from 'node:module'

const WS = 'C:/Users/Administrator/.workbuddy/binaries/node/workspace'
const require = createRequire(path.join(WS, 'noop.js'))
const puppeteer = require('puppeteer-core')

const BASE = process.env.LIVE_BASE ?? 'http://[::1]:5177/open-character-cards/'
const OUT = path.resolve('tools/mock/out/live')
fs.mkdirSync(OUT, { recursive: true })

const TARGETS = [
  { id: '01-home', w: 1440, h: 900, hash: '#/' },
  { id: '02-gallery', w: 1440, h: 900, hash: '#/cards' },
  { id: '03-detail', w: 1440, h: 900, hash: `#/cards/${encodeURIComponent('艾莉丝')}` },
  { id: '04-about', w: 1440, h: 900, hash: '#/about' },
  { id: '05-guide', w: 1440, h: 900, hash: '#/', scrollTo: '#guide' },
  { id: '06-mobile', w: 390, h: 844, hash: '#/' },
  { id: '07-mobile-detail', w: 390, h: 844, hash: `#/cards/${encodeURIComponent('艾莉丝')}` },
]

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=2', '--hide-scrollbars', '--font-render-hinting=none'],
  defaultViewport: null,
})

for (const t of TARGETS) {
  const page = await browser.newPage()
  await page.setViewport({ width: t.w, height: t.h, deviceScaleFactor: 2 })
  await page.goto(BASE + t.hash, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.evaluate(() => document.fonts.ready.then(() => true))
  await page.evaluate(() => Promise.all(
    Array.from(document.images).filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r }))
  ))
  await new Promise((r) => setTimeout(r, 520))

  if (t.scrollTo) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel)
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
    }, t.scrollTo)
    await new Promise((r) => setTimeout(r, 400))
  }

  const info = await page.evaluate(() => ({
    broken: Array.from(document.images).filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')),
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    vScroll: document.documentElement.scrollHeight,
  }))

  await page.screenshot({ path: path.join(OUT, `${t.id}.png`) })
  const warn = []
  if (info.broken.length) warn.push(`图片未加载 ${info.broken.join(',')}`)
  if (info.scrollW > info.innerW + 1) warn.push(`横向溢出 ${info.scrollW - info.innerW}px`)
  console.log(`[live] ${t.id.padEnd(11)} ${t.w}x${t.h}  页面高 ${info.vScroll}  ${warn.length ? '⚠ ' + warn.join(' | ') : 'ok'}`)
  await page.close()
}

await browser.close()
