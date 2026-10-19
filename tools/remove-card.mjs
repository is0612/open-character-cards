/**
 * 本地快捷删除一张角色卡
 *
 * 用法：
 *   node tools/remove-card.mjs 林可
 *   node tools/remove-card.mjs 林可 --dry-run
 *
 * 做的事：删掉 cards/<名字>.png 和 cards/<名字>.meta.json，并重建清单。
 * 只改工作区，不替你 commit；删完会打印接下来该敲的 git 命令。
 */
import { existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CARDS_DIR = join(ROOT, 'cards')

function fail(msg) {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const name = argv.find((a) => !a.startsWith('--'))

if (!name) fail('用法：node tools/remove-card.mjs <卡片名>（cards/ 下的文件名，不含 .png）')
if (/[/\\]/.test(name) || name.includes('..')) fail(`卡片名不合法：${name}`)

const targets = [join(CARDS_DIR, `${name}.png`), join(CARDS_DIR, `${name}.meta.json`)]
const hits = targets.filter((p) => existsSync(p))

if (hits.length === 0) {
  fail(`cards/ 下没有「${name}」这张卡。可用 ls cards 看看现有文件名`)
}

for (const p of hits) {
  console.log(`${dryRun ? '将删除' : '已删除'}：${p.replace(ROOT + '\\', '').replace(/\\/g, '/')}`)
  if (!dryRun) rmSync(p, { force: true })
}

if (dryRun) {
  console.log('\n（dry-run，没有真的删）')
  process.exit(0)
}

execFileSync(process.execPath, [join(ROOT, 'tools', 'build-manifest.mjs')], { cwd: ROOT, stdio: 'inherit' })

console.log('\n下一步（提交后网站才会下架）：')
console.log(`  git add -A cards`)
console.log(`  git commit -m "下架角色卡：${name}"`)
console.log(`  git push origin main`)
