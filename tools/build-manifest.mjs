/**
 * 扫描 cards/ 目录，聚合生成 public/data/manifest.json
 *
 * 数据模型（PNG 自包含方案）：
 *  - cards/ 目录下，每张角色卡由两个文件组成：
 *    1. xxx.png        —— SillyTavern 格式角色卡（数据内嵌在 PNG tEXt 块）
 *    2. xxx.meta.json  —— 轻量展示元数据 { name, summary, tags, author, ... }
 *  - 本脚本：读 meta.json + 解析 PNG 内嵌数据（自动提取名字），聚合为 manifest
 *
 * 运行：npm run build:manifest
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { extractCardData, resolveName, resolveTags } from './parse-png.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CARDS_DIR = join(ROOT, 'cards')
const OUT_DIR = join(ROOT, 'public', 'data')
const OUT_FILE = join(OUT_DIR, 'manifest.json')
// 卡片 PNG 需要被站点直接访问，复制一份到 public/cards（构建时进 dist）
const PUBLIC_CARDS_DIR = join(ROOT, 'public', 'cards')

function getFirstAddedAt(pngFile) {
  try {
    const history = execFileSync('git', ['log', '--diff-filter=A', '--follow', '--format=%cI', '--', 'cards/' + pngFile],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    return history.split(/\r?\n/).filter(Boolean)[0] || ''
  } catch {
    // In shallow archives or source exports there may be no Git history.
    return ''
  }
}

function main() {
  if (!existsSync(CARDS_DIR)) {
    console.warn(`未找到 cards/ 目录：${CARDS_DIR}`)
    return
  }

  const files = readdirSync(CARDS_DIR)
  // 收集所有 PNG（角色卡本体）
  const pngFiles = files.filter((f) => f.toLowerCase().endsWith('.png'))
  const cards = []

  for (const pngFile of pngFiles) {
    const id = basename(pngFile).replace(/\.png$/i, '')
    const pngPath = join(CARDS_DIR, pngFile)
    const metaPath = join(CARDS_DIR, `${id}.meta.json`)

    // 1. 读轻量 meta（若有）
    let meta = {}
    if (existsSync(metaPath)) {
      try {
        meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
      } catch (e) {
        console.warn(`meta.json 解析失败（忽略）：${metaPath}`, e.message)
      }
    }

    // 2. 解析 PNG 内嵌数据
    let parsedName
    let parsedTags = []
    let hasEmbeddedData = false
    try {
      const cardData = extractCardData(pngPath)
      if (cardData) {
        hasEmbeddedData = true
        parsedName = resolveName(cardData)
        parsedTags = resolveTags(cardData)
      }
    } catch (e) {
      console.warn(`PNG 解析失败（忽略）：${pngPath}`, e.message)
    }

    const metaTags = resolveTags({ tags: meta.tags })
    // 展示标签（meta）优先，PNG 内嵌标签补充；两边都没有时为空。
    const tags = [...new Set([...metaTags, ...parsedTags])]
    const category = (typeof meta.category === 'string' && meta.category.trim()) || tags[0] || ''

    cards.push({
      id,
      png: `cards/${pngFile}`,
      addedAt: getFirstAddedAt(pngFile),
      name: meta.name || parsedName || id,
      summary: meta.summary || '',
      tags,
      category,
      author: meta.author,
      world: meta.world,
      license: meta.license || 'CC BY-SA 4.0',
      issueUrl: meta.issueUrl,
      parsedName,
      hasEmbeddedData,
    })
  }

  cards.sort((a, b) => {
    if (a.addedAt && b.addedAt && a.addedAt !== b.addedAt) return b.addedAt.localeCompare(a.addedAt)
    if (a.addedAt && !b.addedAt) return -1
    if (!a.addedAt && b.addedAt) return 1
    return a.name.localeCompare(b.name, 'zh')
  })

  const manifest = {
    version: 1,
    updated: new Date().toISOString().slice(0, 10),
    cards,
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2), 'utf-8')

  // 同步 PNG 到 public/cards/，让 ${BASE_URL}cards/xxx.png 能被站点直接访问
  mkdirSync(PUBLIC_CARDS_DIR, { recursive: true })
  for (const pngFile of pngFiles) {
    copyFileSync(join(CARDS_DIR, pngFile), join(PUBLIC_CARDS_DIR, pngFile))
  }
  // 清掉原文件已删除的残留副本
  const wanted = new Set(pngFiles)
  for (const f of readdirSync(PUBLIC_CARDS_DIR)) {
    if (!wanted.has(f)) rmSync(join(PUBLIC_CARDS_DIR, f), { force: true })
  }

  console.log(`已生成 manifest：${cards.length} 张角色卡 → ${OUT_FILE}`)
}

main()
