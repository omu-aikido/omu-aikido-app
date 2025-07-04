import ".astro/types.d.ts"
interface ImportMetaEnv {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
  NODE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import type { Profile, PagePath } from "@/src/type"
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>

declare global {
  namespace App {
    interface Locals extends Runtime {
      profile: Profile | null
      paths: PagePath[]
    }
  }
}
