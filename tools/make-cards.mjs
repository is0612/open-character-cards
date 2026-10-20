/**
 * 把角色卡数据写进 PNG 的 tEXt 块（SillyTavern V2 格式），生成可直接导入酒馆的角色卡。
 *
 * 用法: node tools/make-cards.mjs
 *   --only=艾莉丝   只生成指定角色
 *   --dry           只打印将写入的内容，不落盘
 *
 * 写入格式：tEXt 关键字 chara，值为 base64(cardV2 JSON)，同时在 IHDR 后写入 ccv3 的兼容副本。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { SEED } from './seed-cards.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const CARDS_DIR = path.join(ROOT, 'cards')

/* ---------- CRC32 ---------- */
const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

/** 构造一个 tEXt 数据块：length + type + keyword\0text + crc */
function makeTextChunk(keyword, text) {
  const body = Buffer.concat([
    Buffer.from(keyword, 'latin1'),
    Buffer.from([0]),
    Buffer.from(text, 'latin1'), // base64 全是 ASCII，latin1 与 utf8 等价
  ])
  const len = Buffer.alloc(4)
  len.writeUInt32BE(body.length)
  const type = Buffer.from('tEXt', 'latin1')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([type, body])))
  return Buffer.concat([len, type, body, crc])
}

/** 在 IHDR 之后插入 tEXt 块（PNG 规范允许 tEXt 出现在 IDAT 之前） */
function embedText(pngBuffer, entries) {
  const SIG = 8
  const ihdrLen = pngBuffer.readUInt32BE(SIG)
  const insertAt = SIG + 4 + 4 + ihdrLen + 4 // signature + len + type + data + crc
  const chunks = entries.map(([k, v]) => makeTextChunk(k, v))
  return Buffer.concat([
    pngBuffer.subarray(0, insertAt),
    ...chunks,
    pngBuffer.subarray(insertAt),
  ])
}

/* ---------- 角色卡 JSON ---------- */
function buildCard(entry) {
  const v2 = {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: entry.name,
      description: entry.description,
      personality: entry.personality,
      scenario: entry.scenario,
      first_mes: entry.first_mes,
      mes_example: entry.mes_example,
      creator_notes: entry.creator_notes,
      system_prompt: entry.system_prompt ?? '',
      post_history_instructions: entry.post_history_instructions ?? '',
      alternate_greetings: entry.alternate_greetings ?? [],
      character_book: entry.character_book ?? null,
      tags: entry.tags,
      creator: entry.author,
      character_version: entry.version ?? '1.0',
      extensions: {},
    },
  }
  return v2
}

function buildMeta(entry) {
  return {
    name: entry.name,
    summary: entry.summary,
    tags: entry.tags,
    category: entry.category,
    author: entry.author,
    world: entry.world,
    license: entry.license ?? 'CC BY-SA 4.0',
  }
}

/* ---------- main ---------- */
const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1]
const dry = process.argv.includes('--dry')

mkdirSync(CARDS_DIR, { recursive: true })

let done = 0
for (const entry of SEED) {
  if (only && entry.name !== only) continue

  const src = path.join(ROOT, entry.img)
  if (!existsSync(src)) {
    console.log(`[skip] ${entry.name}: 找不到立绘 ${entry.img}`)
    continue
  }

  const card = buildCard(entry)
  const b64 = Buffer.from(JSON.stringify(card), 'utf8').toString('base64')
  const pngPath = path.join(CARDS_DIR, `${entry.name}.png`)
  const metaPath = path.join(CARDS_DIR, `${entry.name}.meta.json`)

  if (dry) {
    console.log(`[dry] ${entry.name}  card ${b64.length}B  json ${JSON.stringify(card).length}B`)
    continue
  }

  const out = embedText(readFileSync(src), [
    ['chara', b64],
    ['ccv3', b64],
  ])
  writeFileSync(pngPath, out)
  writeFileSync(metaPath, JSON.stringify(buildMeta(entry), null, 2) + '\n')

  const kb = (out.length / 1024).toFixed(0)
  console.log(`[card] ${entry.name.padEnd(4)} ${kb}KB  ${entry.tags.join(' / ')}`)
  done += 1
}

console.log(`\n完成 ${done} 张。下一步：npm run build:manifest`)
