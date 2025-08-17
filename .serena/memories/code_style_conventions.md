# コードスタイルと規約

## TypeScript設定
- 厳格な型チェック有効
- ES2022ターゲット
- モジュール解決: bundler

## ESLint設定
- TypeScript ESLint推奨ルール
- React関連ルール（hooks, refresh）
- Import/Export規約

## Prettier設定
- セミコロンなし（推定）
- シングルクォート使用（推定）
- 自動フォーマット

## ファイル構成規約
- `app/` - アプリケーションコード
  - `routes/` - ルート定義
  - `components/` - UIコンポーネント
  - `lib/` - ユーティリティ・フック
  - `db/` - データベーススキーマ
- `tests/` - テストコード
- `workers/` - Cloudflare Workers
- `migrations/` - DBマイグレーション

## 命名規約
- ファイル名: kebab-case
- コンポーネント: PascalCase
- 関数・変数: camelCase
- 定数: UPPER_SNAKE_CASE

## インポート規約
- 相対パス使用
- 型インポートは明示的に分離