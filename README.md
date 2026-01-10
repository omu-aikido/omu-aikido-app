# OMU Aikido App

大阪公立大学合気道部の稽古管理アプリ

## Tech Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS
- **Backend**: Hono (Cloudflare Workers)
- **Database**: Drizzle ORM + libSQL (Turso)
- **Authentication**: Clerk
- **Validation**: Arktype

## Prerequisites

- Node.js v20.19.0+ または v22.12.0+
- pnpm 10.27.0

## Quick Start

### ホスト開発（推奨）

```sh
# 依存関係のインストール
pnpm install --frozen-lockfile

# libSQLサーバーを起動
docker-compose up -d libsql-server

# DBスキーマをプッシュ
pnpm db:push

#
# または
mise dev # dbの起動・マイグレーション・アプリ起動までやります

# 開発サーバーを起動
pnpm dev
```

### CI/CD用Docker Compose開発

```sh
# 全サービスを起動（libSQL + アプリ）
docker-compose up

# Wranglerを使用してアプリサービスを起動（libSQL + アプリ）
MODE=preview docker-compose up
```

## Scripts

### Development

| Command        | Description          |
| -------------- | -------------------- |
| `pnpm dev`     | 開発サーバーを起動   |
| `pnpm build`   | プロダクションビルド |
| `pnpm preview` | ビルドをプレビュー   |

### Code Quality

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `pnpm check`      | format, lint, type-check, knipを一括実行 |
| `pnpm lint`       | oxlintでコード品質チェック               |
| `pnpm lint:fix`   | lint問題を自動修正                       |
| `pnpm format`     | oxfmtでコードをフォーマット              |
| `pnpm type-check` | TypeScriptの型チェック                   |

### Testing

| Command              | Description              |
| -------------------- | ------------------------ |
| `pnpm test`          | Vitestでテストを実行     |
| `pnpm test:ui`       | テストUIを起動           |
| `pnpm test:coverage` | カバレッジレポートを生成 |

### Database

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `pnpm db:push`     | スキーマをDBにプッシュ         |
| `pnpm db:migrate`  | マイグレーションを実行         |
| `pnpm db:generate` | マイグレーションファイルを生成 |
| `pnpm db:studio`   | Drizzle Studioを起動           |

### Deployment

| Command       | Description                             |
| ------------- | --------------------------------------- |
| `pnpm deploy` | Cloudflare Workersにデプロイ（dry-run） |

## Environment Variables

プロジェクトのルートに `.env` ファイルを作成し、以下の変数を設定してください（`.env.example` 参照）。

```ini
# Client (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Server (Clerk)
CLERK_SECRET_KEY=sk_test_...
CLERK_FRONTEND_API_URL=https://...
CLERK_WEBHOOK_SECRET=whsec_...

# Server (Database)
TURSO_AUTH_TOKEN=...
TURSO_DATABASE_URL=http://localhost:8080
```

## CI/CD Workflow

GitHub Actions を使用して、CI/CDを管理しています。

### CI: Validation (`ci.yml`)

- **Trigger**: `main` 以外のブランチへのプッシュ、またはプルリクエストの作成
- **Jobs**:
  - 依存関係のインストール
  - ビルド確認
  - 静的解析 (`format`, `lint`, `type-check`, `knip`)
  - テスト実行 (`vitest`)

### CD: Deployment (`deploy.yml`)

- **Trigger**: `main` ブランチへのプッシュ（※以下のファイルに変更があった場合のみ）
  - プロダクションコード (`src/`, `server/`, `share/`, `public/`, `index.html`)
  - 設定ファイル (`package.json`, `vite.config.ts`, `wrangler.jsonc` など)
- **Jobs**:
  - ビルド (`pnpm build --minify`)
  - Cloudflare Workers へのデプロイ

## Project Structure

```
├── src/                  # Vueフロントエンド (tsconfig.app.json)
│   ├── components        # UIコンポーネント
│   ├── composable        # Vueコンポーザブル
│   ├── views             # ページコンポーネント
│   └── router            # ルーティング
├── server/               # Honoバックエンド (tsconfig.worker.json)
├── share/                # 共有型定義・ユーティリティ
├── tests/                # テストファイル (tsconfig.test.json)
├── migrations/           # DBマイグレーション
├── .github/workflows/    # CI/CD設定
├── tsconfig.json         # TypeScript構成のエントリポイント
├── tsconfig.app.json     # フロントエンド用TS設定
├── tsconfig.worker.json  # Cloudflare Workers用TS設定
└── tsconfig.node.json    # ビルドツール用TS設定
```

## License

[Apache License 2.0](LICENSE)
