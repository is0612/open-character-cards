<script setup lang="ts">
import { ref } from 'vue'

/* ---------------- 类型 ---------------- */

interface ChunkInfo {
  type: string
  len: number
  kw: string
  data: Uint8Array
}

interface Warn {
  level: 'ok' | 'warn' | 'bad'
  text: string
}

interface Summary {
  d: Record<string, any>
  ext: Record<string, any>
  entries: any[]
  regex: any[]
  scripts: any[]
  regexChars: number
  scriptChars: number
  frameEntries: any[]
  textChars: number
  altCount: number
  groupAltCount: number
  type: string
  name: string
  firstMes: string
  hasBook: boolean
}

interface ResultItem {
  url: string
  fileName: string
  size: number
  json: string
  name: string
  cardType: string
  source: string
  chunkLine: string
  rows: Array<[string, string]>
  warns: Warn[]
  error: string
}

/* ---------------- 常量 ---------------- */

const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const decU8 = new TextDecoder('utf-8')
const decL1 = new TextDecoder('latin1')

/* ---------------- 状态 ---------------- */

const items = ref<ResultItem[]>([])
const dragging = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const copiedIndex = ref(-1)

/* ---------------- PNG 块遍历 ---------------- */

function walkChunks(buf: ArrayBuffer): ChunkInfo[] {
  const u8 = new Uint8Array(buf)
  if (u8.length < 8) throw new Error('文件太短，不是 PNG')
  for (let i = 0; i < 8; i++) {
    if (u8[i] !== SIG[i]) throw new Error('不是 PNG 文件')
  }
  const dv = new DataView(buf)
  const out: ChunkInfo[] = []
  let off = 8
  while (off + 8 <= u8.length) {
    const len = dv.getUint32(off)
    const type = String.fromCharCode(u8[off + 4], u8[off + 5], u8[off + 6], u8[off + 7])
    const data = u8.subarray(off + 8, off + 8 + len)
    let kw = ''
    if (type === 'tEXt' || type === 'zTXt' || type === 'iTXt') {
      const z = data.indexOf(0)
      if (z > 0) kw = decL1.decode(data.subarray(0, z))
    }
    out.push({ type, len, kw, data })
    off += 12 + len
    if (type === 'IEND') break
  }
  return out
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  const DS = (globalThis as any).DecompressionStream
  if (typeof DS !== 'function') throw new Error('当前浏览器不支持解压 zTXt/iTXt')
  const stream = new Blob([bytes]).stream().pipeThrough(new DS('deflate'))
  const buf = await new Response(stream).arrayBuffer()
  return new Uint8Array(buf)
}

async function readTextChunks(chunks: ChunkInfo[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  for (const c of chunks) {
    if (c.type !== 'tEXt' && c.type !== 'zTXt' && c.type !== 'iTXt') continue
    const d = c.data
    const z = d.indexOf(0)
    if (z < 0) continue
    const key = decL1.decode(d.subarray(0, z))
    let text = ''
    try {
      if (c.type === 'tEXt') {
        text = decU8.decode(d.subarray(z + 1))
      } else if (c.type === 'zTXt') {
        text = decU8.decode(await inflate(d.subarray(z + 2)))
      } else {
        const flag = d[z + 1]
        let p = d.indexOf(0, z + 2) + 1
        p = d.indexOf(0, p) + 1
        const body = d.subarray(p)
        text = decU8.decode(flag ? await inflate(body) : body)
      }
    } catch {
      continue
    }
    if (map[key] === undefined) map[key] = text
  }
  return map
}

function b64ToText(b64: string): string {
  const clean = b64.replace(/[\s\r\n]/g, '')
  const bin = atob(clean)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return decU8.decode(bytes)
}

function tryParse(raw: string): Record<string, any> | null {
  const t = raw.trim()
  if (t.startsWith('{') || t.startsWith('[')) {
    try {
      return JSON.parse(t)
    } catch {
      /* 继续当 base64 试 */
    }
  }
  try {
    return JSON.parse(b64ToText(t))
  } catch {
    return null
  }
}

/* ---------------- 卡牌归纳 ---------------- */

function getStr(d: Record<string, any>, k: string): string {
  const v = d[k]
  return typeof v === 'string' ? v : ''
}

function summarize(card: Record<string, any>): Summary {
  const d: Record<string, any> =
    card.data && typeof card.data === 'object' ? (card.data as Record<string, any>) : card
  const ext: Record<string, any> =
    d.extensions && typeof d.extensions === 'object' ? d.extensions : {}
  const book = d.character_book || card.character_book || null
  const entries: any[] = book && Array.isArray(book.entries) ? book.entries : []
  const regex: any[] = Array.isArray(ext.regex_scripts) ? ext.regex_scripts : []
  const th: Record<string, any> =
    ext.tavern_helper && typeof ext.tavern_helper === 'object' ? ext.tavern_helper : {}
  const scripts: any[] = Array.isArray(th.scripts) ? th.scripts : []

  const regexChars = regex.reduce(
    (n, r) => n + (r && typeof r.replaceString === 'string' ? r.replaceString.length : 0),
    0,
  )
  const scriptChars = scripts.reduce(
    (n, s) => n + (s && typeof s.content === 'string' ? s.content.length : 0),
    0,
  )

  const frameEntries = entries.filter((e) => {
    const label = String((e && (e.comment || e.name)) || '')
    return /^\[(mvu_update|initvar|mvu_initvar)\]/i.test(label) || /变量列表/.test(label)
  })

  const textChars = ['description', 'personality', 'scenario', 'first_mes', 'mes_example'].reduce(
    (n, k) => n + getStr(d, k).length,
    0,
  )

  let type = '传统卡'
  if (regex.length || scripts.length) type = '应用包'
  else if (!getStr(d, 'description').trim() && entries.length) type = '世界书型'

  return {
    d,
    ext,
    entries,
    regex,
    scripts,
    regexChars,
    scriptChars,
    frameEntries,
    textChars,
    altCount: Array.isArray(d.alternate_greetings) ? d.alternate_greetings.length : 0,
    groupAltCount: Array.isArray(d.group_only_greetings) ? d.group_only_greetings.length : 0,
    type,
    name: getStr(d, 'name') || getStr(card, 'name') || '（未命名）',
    firstMes: getStr(d, 'first_mes'),
    hasBook: Boolean(book && entries.length),
  }
}

function buildWarnings(info: Summary, chunks: ChunkInfo[]): Warn[] {
  const out: Warn[] = []

  const holders: string[] = Array.from(
    info.firstMes.match(/<[A-Za-z_][\w.]*PlaceHolder[\w.]*\s*\/?>/g) ?? [],
  )
  if (holders.length) {
    const uniq = holders.filter((v, i) => holders.indexOf(v) === i)
    out.push({
      level: 'bad',
      text:
        `开场白里有占位符 ${uniq[0]}` +
        (uniq.length > 1 ? ` 等 ${uniq.length} 种` : '') +
        '，要靠正则替换才能变成界面。不执行正则的客户端会把标签原样显示出来。',
    })
  }

  if (info.regex.length) {
    out.push({
      level: 'warn',
      text: `带 ${info.regex.length} 条正则管道，替换体合计 ${info.regexChars.toLocaleString()} 字。不执行 = 占位符不渲染、变量标签不剥离。`,
    })
  }
  if (info.scripts.length) {
    const names = info.scripts
      .map((s) => (s && s.name ? String(s.name) : '?'))
      .slice(0, 6)
      .join(' / ')
    out.push({
      level: 'warn',
      text: `带 ${info.scripts.length} 段脚本（${info.scriptChars.toLocaleString()} 字）：${names}。这类内容会执行 JS，导入方需要沙箱或直接忽略。`,
    })
  }
  if (info.frameEntries.length) {
    const labels = info.frameEntries.map((e) => String((e && (e.comment || e.name)) || '?'))
    out.push({
      level: 'warn',
      text: `世界书里有 ${info.frameEntries.length} 条框架元条目（${labels.join(' / ')}），不是剧情设定，当普通条目导入会污染提示词。`,
    })
  }
  if (!getStr(info.d, 'description').trim()) {
    out.push({
      level: 'warn',
      text:
        'description 是空的' +
        (info.hasBook ? `，设定全在 character_book 的 ${info.entries.length} 条条目里` : '') +
        '。按描述字段读卡的软件会看到一个空角色。',
    })
  }

  const hasChara = chunks.some((c) => c.kw === 'chara')
  const hasCcv3 = chunks.some((c) => c.kw === 'ccv3')
  if (hasChara && hasCcv3) {
    out.push({
      level: 'ok',
      text: 'chara + ccv3 双写，老软件认 V2、新软件认 V3，兼容性最好。',
    })
  } else if (hasCcv3) {
    out.push({
      level: 'warn',
      text: '只有 ccv3 块。读卡实现必须会解 base64，直接 JSON.parse 会失败。',
    })
  } else if (hasChara) {
    out.push({
      level: 'warn',
      text: '只有 chara 块（V2），V3 的 assets、group_only_greetings 可能缺失。',
    })
  }

  if (!out.length) out.push({ level: 'ok', text: '没有发现需要特别注意的结构。' })
  return out
}

function fieldRows(info: Summary): Array<[string, string]> {
  const d = info.d
  const len = (k: string): string => {
    const v = d[k]
    return typeof v === 'string' ? `${v.length.toLocaleString()} 字` : '—'
  }
  const extKeys = Object.keys(info.ext)
  const code = info.regexChars + info.scriptChars
  const total = code + info.textChars
  const pct = total ? Math.round((code / total) * 100) : 0

  return [
    ['name', info.name],
    ['spec_version', String(d.spec_version || '—')],
    ['description', len('description')],
    ['personality', len('personality')],
    ['scenario', len('scenario')],
    ['first_mes', len('first_mes')],
    ['mes_example', len('mes_example')],
    ['system_prompt', len('system_prompt')],
    ['post_history_instructions', len('post_history_instructions')],
    [
      'alternate_greetings',
      `${info.altCount} 条` + (info.groupAltCount ? ` + 群聊 ${info.groupAltCount} 条` : ''),
    ],
    [
      'character_book',
      info.hasBook ? `${info.entries.length} 条（框架元条目 ${info.frameEntries.length} 条）` : '无',
    ],
    ['extensions', extKeys.length ? extKeys.join(', ') : '无'],
    ['tags', Array.isArray(d.tags) && d.tags.length ? d.tags.join(', ') : '无'],
    ['creator', getStr(d, 'creator') || '无'],
    ['文本 / 代码', `${info.textChars.toLocaleString()} 字 / ${code.toLocaleString()} 字（代码占 ${pct}%）`],
  ]
}

/* ---------------- 工具函数 ---------------- */

function kb(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

function chipClass(type: string): string {
  if (type === '应用包') return 'chip--warn'
  if (type === '世界书型') return 'chip--ok'
  return ''
}

function fallbackCopy(text: string): void {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
  } catch {
    /* 忽略 */
  }
  ta.remove()
}

function download(item: ResultItem): void {
  const blob = new Blob([item.json], { type: 'application/json;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = item.fileName.replace(/\.(png|json)$/i, '') + '.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1500)
}

function copy(item: ResultItem, index: number): void {
  const done = (): void => {
    copiedIndex.value = index
    setTimeout(() => {
      if (copiedIndex.value === index) copiedIndex.value = -1
    }, 1400)
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(item.json).then(done, () => {
      fallbackCopy(item.json)
      done()
    })
  } else {
    fallbackCopy(item.json)
    done()
  }
}

/* ---------------- 解析主流程 ---------------- */

async function processOne(file: File): Promise<void> {
  const base: ResultItem = {
    url: '',
    fileName: file.name,
    size: file.size,
    json: '',
    name: '',
    cardType: '',
    source: 'JSON',
    chunkLine: '',
    rows: [],
    warns: [],
    error: '',
  }

  let card: Record<string, any> | null = null
  let chunks: ChunkInfo[] = []
  let source = 'JSON'

  try {
    const buf = await file.arrayBuffer()
    if (/\.json$/i.test(file.name)) {
      card = JSON.parse(decU8.decode(new Uint8Array(buf)))
    } else {
      chunks = walkChunks(buf)
      const texts = await readTextChunks(chunks)
      const raw = texts['ccv3'] || texts['chara']
      if (!raw) throw new Error('这张 PNG 里没有 chara / ccv3 文本块')
      source = texts['ccv3'] ? 'ccv3' : 'chara'
      card = tryParse(raw)
      if (!card) throw new Error('文本块解出来不是合法 JSON')
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    items.value.push({ ...base, url: /^image\//.test(file.type) ? URL.createObjectURL(file) : '', error: msg })
    return
  }

  if (!card) {
    items.value.push({ ...base, error: '解析失败：认不出这是角色卡' })
    return
  }

  const info = summarize(card)
  const json = JSON.stringify(card, null, 2)

  items.value.push({
    ...base,
    url: /^image\//.test(file.type) ? URL.createObjectURL(file) : '',
    json,
    name: info.name,
    cardType: info.type,
    source,
    chunkLine: chunks.length
      ? chunks.map((c) => `${c.type}${c.kw ? `(${c.kw})` : ''} ${c.len.toLocaleString()}`).join('  ·  ')
      : '',
    rows: fieldRows(info),
    warns: buildWarnings(info, chunks),
  })
}

async function handleFiles(files: File[]): Promise<void> {
  for (const f of files) await processOne(f)
}

/* ---------------- 事件 ---------------- */

function pick(): void {
  inputEl.value?.click()
}

function onPick(e: Event): void {
  const el = e.target as HTMLInputElement
  const files = Array.from(el.files || [])
  el.value = ''
  if (files.length) void handleFiles(files)
}

function onDrop(e: DragEvent): void {
  dragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length) void handleFiles(files)
}

function onDragLeave(e: DragEvent): void {
  const el = e.currentTarget as HTMLElement
  if (e.relatedTarget && el.contains(e.relatedTarget as Node)) return
  dragging.value = false
}
</script>

<template>
  <div class="tool">
    <p class="tool-lead">
      把角色卡 PNG 丢进来，把内嵌的角色数据提成 JSON。全部在浏览器本地解析，文件不会上传到任何地方。
    </p>

    <div
      class="drop"
      :class="{ 'drop--over': dragging }"
      tabindex="0"
      role="button"
      aria-label="选择或拖入角色卡文件"
      @click="pick"
      @keydown.enter.prevent="pick"
      @keydown.space.prevent="pick"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <div class="drop-title">把角色卡 PNG 拖进来</div>
      <div class="drop-sub">也可以点击选择 · 支持批量 · 顺带认 .json</div>
      <input
        ref="inputEl"
        type="file"
        accept=".png,.json,image/png,application/json"
        multiple
        hidden
        @change="onPick"
      />
    </div>

    <article v-for="(item, i) in items" :key="i" class="card">
      <div v-if="item.error" class="card-error">
        <strong>{{ item.fileName }}</strong>
        <span>{{ item.error }}</span>
      </div>

      <template v-else>
        <div class="card-head">
          <img v-if="item.url" class="thumb" :src="item.url" alt="" />
          <div v-else class="thumb thumb--empty"></div>
          <div class="meta">
            <h3>{{ item.name }}</h3>
            <div class="file">{{ item.fileName }} · {{ kb(item.size) }}</div>
            <div v-if="item.chunkLine" class="chunk-line">{{ item.chunkLine }}</div>
            <div class="chips">
              <span class="chip" :class="chipClass(item.cardType)">{{ item.cardType }}</span>
              <span class="chip">来源 {{ item.source }}</span>
              <span class="chip">JSON {{ kb(item.json.length * 2) }}</span>
            </div>
          </div>
          <div class="actions">
            <button class="btn btn--primary" @click="download(item)">下载 JSON</button>
            <button class="btn" @click="copy(item, i)">{{ copiedIndex === i ? '已复制' : '复制' }}</button>
          </div>
        </div>

        <div class="block">
          <h4>字段</h4>
          <table class="fields">
            <tr v-for="row in item.rows" :key="row[0]">
              <td>{{ row[0] }}</td>
              <td>{{ row[1] }}</td>
            </tr>
          </table>
        </div>

        <div class="block">
          <h4>诊断</h4>
          <ul class="warns">
            <li v-for="(w, wi) in item.warns" :key="wi" :class="`warns--${w.level}`">{{ w.text }}</li>
          </ul>
        </div>

        <details class="raw">
          <summary>原始 JSON（{{ item.json.length.toLocaleString() }} 字符）</summary>
          <pre>{{ item.json }}</pre>
        </details>
      </template>
    </article>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.tool-lead {
  margin: 0 0 24px;
  font-size: $fs-body;
  color: $color-text-muted;
}

/* ---------- 拖放区 ---------- */
.drop {
  border: 1.5px dashed $color-border;
  border-radius: $radius-lg;
  background: $color-surface;
  padding: 44px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover,
  &:focus-visible {
    border-color: $color-accent;
    outline: none;
  }

  &--over {
    border-color: $color-accent;
    background: $color-accent-soft;
  }
}

.drop-title {
  font-size: 16px;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 6px;
}

.drop-sub {
  font-size: $fs-muted;
  color: $color-text-muted;
}

/* ---------- 结果卡 ---------- */
.card {
  margin-top: 20px;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
}

.card-error {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: $fs-muted;
  color: #ffaaa1;
  background: #3a2635;

  strong {
    font-weight: 600;
  }
}

.card-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 22px;
}

.thumb {
  flex: none;
  width: 64px;
  height: 85px;
  border-radius: $radius-sm;
  object-fit: cover;
  border: 1px solid $color-border;
  background: $color-primary-soft;

  &--empty {
    background: $color-primary-soft;
  }
}

.meta {
  flex: 1;
  min-width: 0;

  h3 {
    margin: 0 0 3px;
    font-size: $fs-card-title;
    font-weight: 600;
    color: $color-text;
    word-break: break-all;
  }
}

.file,
.chunk-line {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 11.5px;
  color: $color-text-muted;
  word-break: break-all;
  line-height: 1.6;
}

.file {
  font-size: $fs-small;
}

.chunk-line {
  margin-top: 6px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
}

.chip {
  font-size: $fs-small;
  padding: 2px 9px;
  border-radius: 999px;
  background: $color-primary-soft;
  color: #a7b9d6;
  border: 1px solid $color-border;

  &--ok {
    background: #1b382f;
    color: $color-success;
    border-color: #2c5545;
  }

  &--warn {
    background: $color-accent-soft;
    color: #e0bc79;
    border-color: #55462c;
  }
}

.actions {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn {
  font: inherit;
  font-size: $fs-muted;
  padding: 7px 14px;
  border-radius: $radius-sm;
  border: 1px solid $color-border;
  background: $color-surface;
  color: $color-text;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: $color-accent;
    color: $color-accent;
  }

  &--primary {
    background: $color-accent;
    border-color: $color-accent;
    color: #0b1225;

    &:hover {
      background: color-mix(in srgb, $color-accent 90%, black);
      color: #0b1225;
    }
  }
}

/* ---------- 字段表 ---------- */
.block {
  padding: 0 22px;

  h4 {
    margin: 16px 0 8px;
    font-size: $fs-small;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: $color-text-muted;
  }
}

.fields {
  width: 100%;
  border-collapse: collapse;

  td {
    padding: 5px 0;
    border-bottom: 1px dashed $color-border;
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 12px;
    vertical-align: top;
    word-break: break-all;

    &:first-child {
      width: 190px;
      color: $color-text-muted;
    }
  }

  tr:last-child td {
    border-bottom: none;
  }
}

/* ---------- 诊断 ---------- */
.warns {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    font-size: $fs-muted;
    line-height: 1.6;
    padding: 9px 12px;
    border-radius: $radius-sm;
    margin-bottom: 6px;
  }

  &--warn {
    background: $color-accent-soft;
    color: #f0d390;
  }

  &--bad {
    background: #3a2635;
    color: #ffaaa1;
  }

  &--ok {
    background: #1b382f;
    color: #9ce2ba;
  }
}

/* ---------- 原始 JSON ---------- */
.raw {
  border-top: 1px solid $color-border;
  margin-top: 16px;

  summary {
    padding: 12px 22px;
    font-size: $fs-muted;
    color: $color-text-muted;
    cursor: pointer;
    user-select: none;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    &:hover {
      color: $color-accent;
    }
  }

  pre {
    margin: 0;
    padding: 0 22px 18px;
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 12px;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 420px;
    overflow: auto;
    color: #dce6f7;
  }
}

/* ---------- 响应式 ---------- */
@media (max-width: 640px) {
  .card-head {
    flex-wrap: wrap;
    padding: 16px;
  }

  .actions {
    flex-direction: row;
    width: 100%;
  }

  .block {
    padding: 0 16px;
  }

  .fields td:first-child {
    width: 130px;
  }

  .raw summary {
    padding: 12px 16px;
  }

  .raw pre {
    padding: 0 16px 16px;
  }
}
</style>
