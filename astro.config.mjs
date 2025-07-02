// @ts-check
import { defineConfig } from "astro/config"

import cloudflare from "@astrojs/cloudflare"

import clerk from "@clerk/astro"
import { jaJP } from "@clerk/localizations"
import sitemap from "@astrojs/sitemap"

import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://app.omu-aikido.com",

  build: {
    inlineStylesheets: "always",
  },

  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: "passthrough",
  }),

  integrations: [
    clerk({
      localization: jaJP,
    }),
    sitemap(),
    react(),
  ],

  redirects: {
    "/signin": "https://accounts.omu-aikido.com/sign-in",
    "/signup": "https://accounts.omu-aikido.com/sign-up",
    "/sign-in": "https://accounts.omu-aikido.com/sign-in",
    "/sign-up": "https://accounts.omu-aikido.com/sign-up",
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD
        ? {
            "react-dom/server": "react-dom/server.edge",
          }
        : undefined,
    },
  },
})
