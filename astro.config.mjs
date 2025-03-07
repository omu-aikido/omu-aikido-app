// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

import partytown from "@astrojs/partytown";

import clerk from "@clerk/astro";
import { jaJP } from "@clerk/localizations";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    output: "server",
    site: "https://app.omu-aikido.com",

    prefetch: {
        prefetchAll: true,
        defaultStrategy: "tap",
    },

    adapter: cloudflare({
        platformProxy: { enabled: true },
    }),

    integrations: [
        clerk({
            localization: jaJP,
        }),
        sitemap(),
        partytown(),
    ],

    redirects: {
        "/signin": "https://accounts.omu-aikido.com/sign-in",
        "/signup": "https://accounts.omu-aikido.com/sign-up",
        "/sign-in": "https://accounts.omu-aikido.com/sign-in",
        "/sign-up": "https://accounts.omu-aikido.com/sign-up",
        "/terms-of-service": "https://omu-aikido.com/terms-of-service",
        "/privacy-policy": "https://omu-aikido.com/privacy-policy",
    },
});