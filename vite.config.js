import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    allowedHosts: ['shomli.in', 'www.shomli.in'],
    port: 7174,
    proxy: {
      '/gateway/': {
        target: 'http://localhost:7101',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gateway/, ''), // Optional: remove '/gateway' from the path
      },
    },
  },
})
