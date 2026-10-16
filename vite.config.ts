import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// base 需与 GitHub Pages 的仓库路径一致，保证子路径部署下资源引用正确
// 若部署到自定义域名/根路径，改为 '/' 或 './'
export default defineConfig({
  plugins: [vue()],
  base: '/open-character-cards/',
})
