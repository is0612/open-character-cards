/**
 * 把一条「角色卡投稿」Issue 转成 cards/ 下的角色卡文件
 *
 * 用法：
 *   node tools/ingest-issue.mjs 1                     # 读取仓库 Issue #1 并下载附件
 *   node tools/ingest-issue.mjs 1 --image 林可.png     # 网络受限时用本地图片代替下载
 *   node tools/ingest-issue.mjs 1 --dry-run           # 只解析，不写文件
 *
 * 说明：
 *  - 公开仓库读 Issue 不需要 token；设置 GITHUB_TOKEN 可提高限流额度、支持私有仓库。
 *  - 仓库默认取环境变量 GITHUB_REPOSITORY，其次取 git remote origin。
 *  - 处理完成后会自动跑一遍 build-manifest.mjs。
 *
 * 退出码：0 成功；1 失败（issue 不存在 / 没有附件 / 不是 PNG 等）
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { join, dirname, basename, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { extractCardData } from './parse-png.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CARDS_DIR = join(ROOT, 'cards')

/** Issue 表单里「角色卡 PNG」一栏，用于判断这是不是一张投稿 */
const PNG_FIELD = '角色卡 PNG'

/** 单张角色卡体积上限（超过就转人工审核） */
const MAX_PNG_BYTES = 8 * 1024 * 1024

function fail(msg) {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

function parseArgs(argv) {
  const args = { issue: '', image: '', dryRun: false, repo: '', result: '' }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--image') args.image = argv[++i] || ''
    else if (a === '--repo') args.repo = argv[++i] || ''
    else if (a === '--result') args.result = argv[++i] || ''
    else if (!args.issue) args.issue = a
  }
  return args
}

/** 从 git remote 里推断 owner/name，失败返回空字符串 */
function detectRepo() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY
  try {
    const url = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ROOT, encoding: 'utf-8' }).trim()
    const m = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/)
    if (m) return `${m[1]}/${m[2]}`
  } catch {
    /* 无 git 环境，忽略 */
  }
  return ''
}

/** 把 Issue 表单正文按 `### 标题` 切成 { 标题: 内容 } */
function splitSections(body) {
  const sections = {}
  const lines = body.split(/\r?\n/)
  let current = null
  for (const line of lines) {
    const heading = line.match(/^###\s+(.+?)\s*$/)
    if (heading) {
      current = heading[1]
      sections[current] = []
      continue
    }
    if (current) sections[current].push(line)
  }
  const out = {}
  for (const [k, v] of Object.entries(sections)) out[k] = cleanValue(v.join('\n'))
  return out
}

/** 去掉 `_No response_`、纯 HTML 标签换行等噪音 */
function cleanValue(raw) {
  const text = raw.trim()
  if (!text || /^_No response_$/i.test(text)) return ''
  return text
}

/** 表单里的纯文本字段（可能带 HTML / 多余空白） */
function plain(sections, label) {
  const raw = sections[label] || ''
  if (!raw) return ''
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 表单里的标签字段：逗号分隔 */
function tags(sections, label) {
  const raw = plain(sections, label)
  if (!raw) return []
  return raw
    .split(/[,，、]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 取正文里第一个 GitHub 附件链接（图片拖进 Issue 会变成 user-attachments 链接） */
function attachmentUrl(sections) {
  const raw = sections[PNG_FIELD] || ''
  const m = raw.match(/https:\/\/github\.com\/user-attachments\/(?:assets|files)\/[\w./-]+/)
  if (m) return m[0]
  // 兜底：有些用户会贴 raw / 直链
  const fallback = raw.match(/https:\/\/[^\s"'<>)]+\.png/i)
  return fallback ? fallback[0] : ''
}

function sanitizeId(name) {
  return name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
}

async function fetchIssue(repo, number) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
  const res = await fetch(`https://api.github.com/repos/${repo}/issues/${number}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'open-character-cards-ingest',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) fail(`读取 Issue 失败：HTTP ${res.status}（${repo}#${number}）`)
  return res.json()
}

async function downloadPng(url) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'open-character-cards-ingest' } })
  if (!res.ok) fail(`下载附件失败：HTTP ${res.status}，链接可能需要登录或网络受限（可改用 --image 指定本地文件）`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) fail('下回来的不是 PNG 文件')
  return buf
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const repo = args.repo || detectRepo()
  if (!repo) fail('无法确定仓库，可用 --repo owner/name 指定')
  if (!args.issue) fail('缺少 Issue 编号，例如：node tools/ingest-issue.mjs 1')

  const issue = await fetchIssue(repo, args.issue)
  const body = issue.body || ''
  const sections = splitSections(body)
  if (!(PNG_FIELD in sections)) {
    fail(`Issue #${args.issue} 不是「角色卡投稿」模板（缺少「${PNG_FIELD}」字段）`)
  }

  const name = sanitizeId(plain(sections, '角色名')) || `card-${args.issue}`
  const url = attachmentUrl(sections)
  if (!url && !args.image) fail('没有在正文里找到 PNG 附件链接，可用 --image 指定本地图片')

  const meta = {
    name,
    summary: plain(sections, '一句话简介'),
    tags: tags(sections, '标签（可选）'),
    author: plain(sections, '投稿者 / 作者') || issue.user?.login || '',
    world: plain(sections, '所属世界观（可选）'),
    license: plain(sections, '授权协议（可选）') || 'CC BY-SA 4.0',
    issueUrl: issue.html_url,
  }

  console.log(`Issue #${args.issue} → 角色卡「${name}」`)
  console.log(`  附件：${args.image ? `本地 ${args.image}` : url}`)
  console.log(`  简介：${meta.summary || '（空）'}`)
  console.log(`  标签：${meta.tags.join(', ') || '（空）'}`)
  console.log(`  作者：${meta.author || '（空）'}  协议：${meta.license}`)

  if (args.dryRun) return

  let buf
  if (args.image) {
    const src = isAbsolute(args.image) ? args.image : join(ROOT, args.image)
    if (!existsSync(src)) fail(`找不到本地图片：${src}`)
    buf = readFileSync(src)
    if (buf.readUInt32BE(0) !== 0x89504e47) fail(`${args.image} 不是 PNG 文件`)
  } else {
    buf = await downloadPng(url)
  }

  mkdirSync(CARDS_DIR, { recursive: true })
  const pngPath = join(CARDS_DIR, `${name}.png`)
  const metaPath = join(CARDS_DIR, `${name}.meta.json`)
  const existed = existsSync(pngPath)
  writeFileSync(pngPath, buf)
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8')
  console.log(`${existed ? '已覆盖' : '已写入'}：cards/${name}.png（${(buf.length / 1024).toFixed(0)} KB）`)
  console.log(`已写入：cards/${basename(metaPath)}`)

  // ---- 机器校验：通过才允许直接上线，不通过就转人工审核 ----
  const problems = []
  if (buf.length > MAX_PNG_BYTES) {
    problems.push(`图片 ${(buf.length / 1024 / 1024).toFixed(1)}MB，超过 8MB 上限`)
  }
  let embedded = false
  try {
    embedded = !!extractCardData(pngPath)
  } catch (e) {
    problems.push(`PNG 解析失败：${e?.message || e}`)
  }
  if (!embedded) problems.push('PNG 里没有 SillyTavern 角色卡数据（可能是普通图片或截图）')

  const ok = problems.length === 0
  const reason = problems.join('；')
  const source = args.image ? '' : url

  if (ok) {
    console.log('✓ 机器校验通过：可以直接上线')
  } else {
    console.warn(`! 机器校验未通过：${reason}\n  → 需要人工审核后才能上线`)
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `name=${name}\nmeta=${basename(metaPath)}\nsource=${source}\n`)
  }
  if (args.result) {
    writeFileSync(args.result, JSON.stringify({ ok, reason, name, source }, null, 2) + '\n', 'utf-8')
  }

  execFileSync(process.execPath, [join(__dirname, 'build-manifest.mjs')], { cwd: ROOT, stdio: 'inherit' })
}

main().catch((e) => fail(e?.message || String(e)))
