import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Vite 配置文件
// Vite configuration file
export default defineConfig({
  plugins: [vue()],
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
