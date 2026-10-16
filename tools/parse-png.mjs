/**
 * 从 SillyTavern 格式的角色卡 PNG 中解析内嵌数据
 *
 * 原理：SillyTavern 导出角色卡时，会把完整角色卡数据（JSON）base64 编码后
 * 写入 PNG 的 tEXt 元数据块（关键字通常是 "chara" 或 "ccv3"）。
 * 本模块读取 PNG 的 tEXt 块，解码出角色卡 JSON。
 */
import { readFileSync } from 'node:fs'

/**
 * 解析 PNG 文件，提取所有 tEXt 块的 {关键字: 文本值}
 * 纯手写 PNG 块遍历，零依赖。
 */
export function readPngTextChunks(buffer) {
  // PNG 签名：8 字节
  const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (buffer.length < 8 || !buffer.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error('不是有效的 PNG 文件')
  }

  const chunks = {}
  let offset = 8 // 跳过签名

  while (offset + 8 <= buffer.length) {
    // 块长度（4 字节大端）
    const length = buffer.readUInt32BE(offset)
    offset += 4
    // 块类型（4 字节 ASCII）
    const type = buffer.toString('ascii', offset, offset + 4)
    offset += 4
    // 块数据
    const data = buffer.subarray(offset, offset + length)
    offset += length
    // CRC（4 字节，跳过）
    offset += 4

    if (type === 'tEXt') {
      // tEXt 块结构：关键字\0文本
      const nullIdx = data.indexOf(0)
      if (nullIdx !== -1) {
        const keyword = data.toString('latin1', 0, nullIdx)
        const text = data.toString('utf8', nullIdx + 1)
        chunks[keyword] = text
      }
    }

    if (type === 'IEND') break
  }

  return chunks
}

/**
 * 从 tEXt 块中提取角色卡数据。
 * SillyTavern 的角色卡 JSON 通常放在关键字 "chara" 下（base64 编码）。
 */
export function extractCardData(pngPath) {
  const buffer = readFileSync(pngPath)
  const chunks = readPngTextChunks(buffer)

  // 优先找 "chara"（新版 SillyTavern 的 base64 编码卡数据）
  if (chunks['chara']) {
    try {
      const decoded = Buffer.from(chunks['chara'], 'base64').toString('utf8')
      const card = JSON.parse(decoded)
      return card
    } catch (e) {
      // base64 解码失败，可能不是 base64，尝试直接当 JSON 读
      try {
        return JSON.parse(chunks['chara'])
      } catch {
        return { raw: chunks['chara'] }
      }
    }
  }

  // 兼容其他关键字
  if (chunks['ccv3']) {
    try {
      return JSON.parse(chunks['ccv3'])
    } catch {
      return { raw: chunks['ccv3'] }
    }
  }

  // 没有任何内嵌数据
  return null
}

/** 从解析出的角色卡数据中取角色名（兼容多种字段名） */
export function resolveName(card) {
  if (!card) return undefined
  return card.name || card.character?.name || card.data?.name || card.raw
}

/** 从解析出的角色卡数据中取人设描述 */
export function resolveDescription(card) {
  if (!card) return undefined
  return (
    card.description ||
    card.character?.description ||
    card.data?.description ||
    card.personality
  )
}
