/// <reference path="../.astro/types.d.ts" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type ENV = {
    // replace `MY_KV` with your KV namespace
    KV: KVNamespace;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
    interface Locals extends Runtime {}
}

interface ImportMetaEnv {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
    NODE_ENV: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
