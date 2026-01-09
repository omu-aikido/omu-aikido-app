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

## Project Structure

```
├── src/           # Vueフロントエンド
│   ├── components # UIコンポーネント
│   ├── composable # Vueコンポーザブル
│   ├── views      # ページコンポーネント
│   └── router     # ルーティング
├── server/        # Honoバックエンド
├── share/         # 共有コード
├── tests/         # テストファイル
└── migrations/    # DBマイグレーション
```

## License

[Apache License 2.0](LICENSE)
