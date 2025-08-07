# record-app

`record-app`は、部活の活動を記録・管理するためのアプリケーションです。

## 技術スタック

- **フロントエンド**: React Router, Tailwind CSS
- **バックエンド/データベース**: Cloudflare Workers, Drizzle ORM, Turso (libSQL)
- **テスト**: Vitest (ユニットテスト), Playwright (E2Eテスト)
- **その他**: TypeScript, ESLint, Prettier

## ロードマップ

- [ ] アカウント
  - [-] ユーザー登録
  - [x] ログイン
  - [x] ユーザー情報の編集

- [ ] コア機能
  - [x] 稽古の記録・閲覧・編集

- [ ] 管理者向け機能
  - [ ] 稽古の集計などの機能

## セットアップ方法

1.  **依存関係のインストール**:

```bash
pnpm install --frozen-lock
```

2.  **環境変数の設定**: `.env`ファイルに以下の環境変数を設定する必要があります。
    - `CLERK_PUBLISHABLE_KEY`
    - `CLERK_SECRET_KEY`
    - `TURSO_DATABASE_URL`
    - `TURSO_AUTH_TOKEN`

    また， `ln -s .env .dev.vars` を使用して

## スクリプト

`package.json`の`scripts`セクションには、以下の主要なスクリプトが定義されています。

- `dev`: 開発サーバーを起動します。
- `build`: プロジェクトをビルドします。
- `deploy`: Cloudflare Workersにデプロイします（dry-runを含む）。
- `typecheck`: 型チェックを実行します。
- `lint`: コードのリンティングを実行します。
- `format`: コードのフォーマットを実行します。
- `test:unit`: ユニットテストを実行します。
- `db:generate`: Drizzle ORMのマイグレーションファイルを生成します。
- `db:migrate`: データベースのマイグレーションを実行します。
- `db:studio`: Drizzle Studioを起動します。

## ディレクトリ構造

- `app/`: アプリケーションのソースコードが含まれています。
- `migrations/`: Drizzle
  ORMによって生成されたデータベースマイグレーションファイルが含まれています。
- `tests/`: ユニットテスト（Vitest）およびE2Eテスト（Playwright）のコードが含まれています。
- `workers/`: Cloudflare Workersのコードが含まれています。

## 貢献方法

貢献ガイドラインについては、[`CONTRIBUTING.md`](.github/CONTRIBUTING.md)を参照してください。
