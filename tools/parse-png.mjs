/**
 * 从 SillyTavern 格式的角色卡 PNG 中解析内嵌数据。
 *
 * 角色卡 JSON 通常以 base64 形式保存在 PNG 的 tEXt 元数据块中，
 * 关键字常见为 chara 或 ccv3。
 */
import { readFileSync } from 'node:fs'

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/**
 * 读取 PNG 的 tEXt 元数据块。
 * 对每个块的边界进行检查，避免损坏或恶意构造的文件导致越界解析。
 */
export function readPngTextChunks(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('PNG 数据必须是 Buffer')
  }

  if (buffer.length < PNG_SIGNATURE.length || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('不是有效的 PNG 文件')
  }

  const chunks = Object.create(null)
  let offset = PNG_SIGNATURE.length
  let hasIend = false

  while (offset < buffer.length) {
    // 长度和类型头部共 8 字节；先确保可以安全读取它们。
    if (buffer.length - offset < 8) {
      throw new Error('PNG 文件损坏：数据块头部或 CRC 不完整')
    }

    const length = buffer.readUInt32BE(offset)
    offset += 4

    const type = buffer.toString('ascii', offset, offset + 4)
    offset += 4

    // 预留 4 字节 CRC，并使用减法检查避免 offset + length 溢出。
    // 先检查声明长度，可让损坏的超长块得到更明确的越界错误。
    if (length > buffer.length - offset - 4) {
      throw new Error(`PNG 文件损坏：数据块 ${type} 超出文件范围`)
    }

    const data = buffer.subarray(offset, offset + length)
    offset += length + 4 // 跳过数据和 CRC

    if (type === 'tEXt') {
      const nullIdx = data.indexOf(0)
      if (nullIdx > 0) {
        const keyword = data.toString('latin1', 0, nullIdx)
        const text = data.toString('utf8', nullIdx + 1)
        // 保留首个同名字段，避免后续重复字段静默覆盖原始数据。
        if (!(keyword in chunks)) chunks[keyword] = text
      }
    }

    if (type === 'IEND') {
      hasIend = true
      break
    }
  }

  if (!hasIend) {
    throw new Error('PNG 文件损坏：缺少 IEND 结束块')
  }

  return chunks
}

/** 解析 base64 或直接存储的 JSON 文本。 */
function parseEmbeddedJson(value) {
  if (typeof value !== 'string' || value.length === 0) return null

  // 先尝试按 SillyTavern 常用的 base64 编码解析。
  try {
    const decoded = Buffer.from(value, 'base64').toString('utf8')
    if (decoded.trim()) return JSON.parse(decoded)
  } catch {
    // 部分工具会直接将 JSON 文本写入元数据，继续尝试原文。
  }

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/**
 * 从 PNG 中提取角色卡数据。
 * 无法解析的嵌入内容返回 null，由调用方决定如何提示或跳过。
 */
export function extractCardData(pngPath) {
  const chunks = readPngTextChunks(readFileSync(pngPath))

  for (const key of ['chara', 'ccv3']) {
    if (chunks[key]) {
      const parsed = parseEmbeddedJson(chunks[key])
      if (parsed) return parsed
    }
  }

  return null
}

/** 从解析出的角色卡数据中提取角色名，兼容常见格式。 */
export function resolveName(card) {
  if (!card || typeof card !== 'object') return undefined

  const candidates = [
    card.name,
    card.character?.name,
    card.data?.name,
  ]

  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim()
}

/** 从解析出的角色卡数据中提取人设描述。 */
export function resolveDescription(card) {
  if (!card || typeof card !== 'object') return undefined

  const candidates = [
    card.description,
    card.character?.description,
    card.data?.description,
    card.personality,
  ]

  return candidates.find((value) => typeof value === 'string' && value.trim())
}
