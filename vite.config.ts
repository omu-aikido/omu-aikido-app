import { cloudflare } from '@cloudflare/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), cloudflare()],
  resolve: { alias: { '@/': fileURLToPath(new URL('./', import.meta.url)) } },
  server: {
    host: true, // Listen on all interfaces (localhost, 127.0.0.1, etc.)
    allowedHosts: ['localhost', '127.0.0.1', 'macbook-pro-m4.woodpecker-royal.ts.net'],
  },
})
