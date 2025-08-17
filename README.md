# record-app

`record-app`は、部活の活動を記録・管理するためのWebアプリケーションです。
活動記録・集計・ユーザー管理などを安全かつ効率的に行えます。

---

## プロジェクト概要

- **目的**: 部活の活動記録・管理・集計をWeb上で一元化
- **主な機能**:
  - ユーザー登録・ログイン・情報編集
  - 稽古の記録・閲覧・編集

## 技術スタック

- **フロントエンド**: React 19, React Router 7, Tailwind CSS 4
- **バックエンド**: Cloudflare Workers
- **データベース**: Turso (libSQL), Drizzle ORM
- **認証**: Clerk
- **テスト**: Vitest (ユニットテスト), Playwright (E2Eテスト)
- **開発ツール**: TypeScript (strict), ESLint, Prettier, Vite 7

---

## ロードマップ・主な機能

- [x] アカウント
  - [x] ユーザー登録
  - [x] ログイン
  - [x] ユーザー情報の編集
    - メールアドレス変更などはClerkの提供する機能を利用

- [x] コア機能
  - [x] 稽古の記録・閲覧・編集

- [ ] 管理者向け機能
  - [x] 稽古の集計
  - [ ] ユーザー管理

---

## セットアップ方法

1. **依存関係のインストール**
   ```bash
   pnpm install --frozen-lock
   ```

2. **環境変数の設定**
   `.env`ファイルに以下を設定してください。
   - `CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_FRONTEND_API_URL`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`

   テスト実行には以下の値が必要です。ClerkのDevelopment環境で設定したものを使用してください。
   - `E2E_CLERK_USER_PASSWORD`
   - `E2E_CLERK_USER_USERNAME`
   - `E2E_CLERK_USER_ID`

   開発環境用:
   ```bash
   ln -s .env .dev.vars
   ```

---

## 主要コマンド一覧

### 開発
- `pnpm dev` - 開発サーバー起動
- `pnpm preview` - プロダクションビルドのプレビュー

### ビルド・デプロイ
- `pnpm build` - プロジェクトビルド
- `pnpm deploy` - Cloudflare Workersへデプロイ（dry-run含む）
- `pnpm check` - ビルド＋型チェック＋DB確認＋デプロイdry-run

### コード品質
- `pnpm lint` - ESLintでリンティング
- `pnpm lint:fix` - ESLint自動修正
- `pnpm format` - Prettierでフォーマット
- `pnpm format:check` - フォーマットチェック
- `pnpm precommit` - コミット前処理（lint:fix＋format）

### テスト
- `pnpm test:unit` - Vitestでユニットテスト
- `pnpm test:e2e` - PlaywrightでE2Eテスト

### データベース
- `pnpm db:generate` - Drizzleマイグレーション生成
- `pnpm db:migrate` - マイグレーション実行
- `pnpm db:push` - スキーマをDBにプッシュ
- `pnpm db:studio` - Drizzle Studio起動
- `pnpm db:check` - スキーマチェック

### Docker（開発用）
- `pnpm docker:up` - Docker環境起動
- `pnpm docker:down` - Docker環境停止
- `pnpm docker:db:reset` - DB環境リセット

---

## コードスタイル・命名規約

- **TypeScript**: strictモード、明示的な型注釈
- **ESLint**: TypeScript/React推奨ルール、import/export規約
- **Prettier**: セミコロンなし、2スペースインデント、trailing commas
- **ファイル名**: kebab-case
- **コンポーネント名**: PascalCase
- **関数・変数名**: camelCase
- **定数名**: UPPER_SNAKE_CASE
- **インポート**: 相対パス推奨（app内）、`@/`はルート参照
- **型注釈**: すべてのpropsや関数引数に型を明示

---

## ディレクトリ構造

- `app/`
  - `routes/`: ルート定義
  - `components/`: UIコンポーネント
  - `lib/`: ユーティリティ・フック
  - `db/`: DBスキーマ・関連処理
- `tests/`: ユニット/E2Eテスト
- `workers/`: Cloudflare Workers
- `migrations/`: DBマイグレーションファイル

---

## 開発・テスト・デプロイ手順

### コード変更後の必須チェックリスト
1. **リンティング・フォーマット**
   ```bash
   pnpm lint:fix
   pnpm format
   ```
2. **型チェック・ビルド**
   ```bash
   pnpm build
   ```
3. **テスト実行**
   ```bash
   pnpm test:unit
   pnpm test:e2e # 必要に応じて
   ```
4. **DB関連変更時**
   ```bash
   pnpm db:check
   pnpm db:generate # 必要時
   ```
5. **総合チェック**
   ```bash
   pnpm check
   ```
6. **コミット前**
   ```bash
   pnpm precommit
   ```
7. **デプロイ前確認**
   ```bash
   pnpm deploy # dry-runで確認
   ```

### 推奨ワークフロー
1. 開発: `pnpm dev`
2. コード変更
3. 保存時: 自動フォーマット（エディタ設定推奨）
4. コミット前: `pnpm precommit`
5. プッシュ前: `pnpm check`
6. PR提出（デプロイはマージが完了し、mainブランチに変更がプッシュされると自動で実行されます。）

---

## 貢献方法

貢献ガイドラインについては、[`CONTRIBUTING.md`](.github/CONTRIBUTING.md)を参照してください。
