import { cloudflare } from '@cloudflare/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

import { checkCssVarsPlugin } from './scripts/cssVarsChecker';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    cloudflare(),
    checkCssVarsPlugin({
      style: 'src/assets/main.css',
    }),
    UnoCSS(),
  ],
  resolve: { alias: { '@/': fileURLToPath(new URL('./', import.meta.url)) } },
  server: {
    host: true, // Listen on all interfaces (localhost, 127.0.0.1, etc.)
  },
});
