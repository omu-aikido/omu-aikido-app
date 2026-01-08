import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), cloudflare(), tailwindcss()],
  resolve: { alias: { '@/': fileURLToPath(new URL('./', import.meta.url)) } },
  server: {
    host: true, // Listen on all interfaces (localhost, 127.0.0.1, etc.)
  },
})
