import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

/**
 * dev 期间自动维护 public/data/manifest.json：
 * 新建/修改/删除 cards/ 下的文件时重新生成清单并刷新页面，
 * 避免「加载角色卡失败」——manifest 是构建产物，不入库。
 */
function cardManifestPlugin(): Plugin {
  const build = () => {
    const res = spawnSync(process.execPath, [join(root, 'tools/build-manifest.mjs')], {
      cwd: root,
      encoding: 'utf-8',
    })
    if (res.status !== 0) {
      console.warn('[manifest] 生成失败\n' + (res.stderr || res.stdout || ''))
    }
  }

  return {
    name: 'card-manifest',
    apply: 'serve',
    configureServer(server) {
      let timer: ReturnType<typeof setTimeout> | undefined
      const onChange = (file: string) => {
        const normalized = file.replace(/\\/g, '/')
        if (!normalized.includes('/cards/')) return
        if (!/\.(png|jpe?g|webp|json)$/i.test(normalized)) return
        clearTimeout(timer)
        timer = setTimeout(() => {
          build()
          server.ws.send({ type: 'full-reload' })
          server.config.logger.info('[manifest] 角色卡清单已更新', { timestamp: true })
        }, 200)
      }
      server.watcher.on('add', onChange)
      server.watcher.on('change', onChange)
      server.watcher.on('unlink', onChange)
    },
  }
}

// https://vite.dev/config/
// base 需与 GitHub Pages 的仓库路径一致，保证子路径部署下资源引用正确
// 若部署到自定义域名/根路径，改为 '/' 或 './'
export default defineConfig({
  plugins: [vue(), cardManifestPlugin()],
  base: '/open-character-cards/',
  server: {
    // 启动后自动用默认浏览器打开页面（会带上 base 路径）
    open: true,
  },
})

