import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Vite 配置文件
// Vite configuration file
export default defineConfig({
  plugins: [vue()],
  // 使用环境变量控制 base 路径，默认为根路径（适用于 Docker、Nginx 等部署）
  // 仅在 GitHub Pages 部署时设置 VITE_BASE_PATH='/Qubist/'
  // Use environment variable to control base path, default to root path (for Docker, Nginx, etc.)
  // Only set VITE_BASE_PATH='/Qubist/' when deploying to GitHub Pages
  base: process.env.VITE_BASE_PATH || '/',
  root: resolve(__dirname),
  resolve: {
    alias: {
      '@': resolve(__dirname, '.')
    }
  },
  server: {
    port: 16333,
    host: true
  },
  build: {
    outDir: resolve(__dirname, '../dist')
  }
})
