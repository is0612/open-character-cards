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
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractCardData, resolveName } from './parse-png.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CARDS_DIR = join(ROOT, 'cards')
const OUT_DIR = join(ROOT, 'public', 'data')
const OUT_FILE = join(OUT_DIR, 'manifest.json')

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
    const id = basename(pngFile, '.png')
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
    let hasEmbeddedData = false
    try {
      const cardData = extractCardData(pngPath)
      if (cardData) {
        hasEmbeddedData = true
        parsedName = resolveName(cardData)
      }
    } catch (e) {
      console.warn(`PNG 解析失败（忽略）：${pngPath}`, e.message)
    }

    cards.push({
      id,
      png: `cards/${pngFile}`,
      name: meta.name || parsedName || id,
      summary: meta.summary || '',
      tags: meta.tags || [],
      author: meta.author,
      world: meta.world,
      license: meta.license || 'CC BY-SA 4.0',
      issueUrl: meta.issueUrl,
      parsedName,
      hasEmbeddedData,
    })
  }

  cards.sort((a, b) => a.name.localeCompare(b.name, 'zh'))

  const manifest = {
    version: 1,
    updated: new Date().toISOString().slice(0, 10),
    cards,
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2), 'utf-8')
  console.log(`已生成 manifest：${cards.length} 张角色卡 → ${OUT_FILE}`)
}

main()
