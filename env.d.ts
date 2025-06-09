/// <reference path="../.astro/types.d.ts" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type ENV = {
    // replace `MY_KV` with your KV namespace
    USERID_CACHE: KVNamespace;
};

interface ImportMetaEnv {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
    NODE_ENV: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

import type { Profile } from "@/src/type";
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

declare global {
    namespace App {
        interface Locals extends Runtime {
            profile: Profile | null;
        }
    }
}