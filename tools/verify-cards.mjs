/**
 * 校验 cards/ 下每张 PNG 的角色卡内嵌数据是否能被站点解析器正确读出。
 *
 * 用法:
 *   node tools/verify-cards.mjs            # 逐张报告
 *   node tools/verify-cards.mjs --strict   # 有问题时以退出码 1 结束（可挂 CI）
 *
 * 检查项：内嵌数据存在、角色名与简介可解析、开场白非空、chara 与 ccv3 两个块都在。
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { extractCardData, readPngTextChunks, resolveDescription, resolveName, resolveTags } from './parse-png.mjs'

const CARDS_DIR = path.join(import.meta.dirname, '..', 'cards')
const strict = process.argv.includes('--strict')

const files = readdirSync(CARDS_DIR).filter((f) => f.toLowerCase().endsWith('.png')).sort()
if (files.length === 0) {
  console.log('cards/ 下没有 PNG')
  process.exit(0)
}

let failed = 0

for (const file of files) {
  const full = path.join(CARDS_DIR, file)
  const problems = []

  try {
    const chunks = readPngTextChunks(readFileSync(full))
    const card = extractCardData(full)

    if (!card) {
      problems.push('没有可解析的内嵌数据')
    } else {
      const data = card.data ?? {}
      const name = resolveName(card)
      const desc = resolveDescription(card) ?? ''
      const greeting = data.first_mes ?? ''

      if (!name) problems.push('解析不出角色名')
      if (desc.length < 60) problems.push(`简介过短（${desc.length} 字）`)
      if (!greeting) problems.push('缺开场白 first_mes')
      if (!chunks.chara) problems.push('缺 chara 块')
      if (!chunks.ccv3) problems.push('缺 ccv3 副本（部分前端只读这个键）')

      const tags = resolveTags(card)
      const alts = Array.isArray(data.alternate_greetings) ? data.alternate_greetings.length : 0
      const status = problems.length ? '✗' : '✓'
      console.log(
        `${status} ${file.padEnd(9)} ${String(name ?? '?').padEnd(4)} ` +
        `spec=${card.spec ?? '-'}  desc=${desc.length}字  first_mes=${greeting.length}字  ` +
        `alt=${alts}  tags=${tags.join('/') || '-'}`,
      )
    }
  } catch (error) {
    problems.push(error.message)
  }

  if (problems.length) {
    failed += 1
    for (const p of problems) console.log(`    · ${p}`)
  }
}

console.log(`\n共 ${files.length} 张，通过 ${files.length - failed} 张${failed ? `，失败 ${failed} 张` : ''}`)
if (strict && failed) process.exit(1)
