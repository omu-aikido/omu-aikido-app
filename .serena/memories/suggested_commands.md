# 推奨コマンド

## 開発
- `pnpm dev` - 開発サーバー起動
- `pnpm preview` - プロダクションビルドのプレビュー

## ビルド・デプロイ
- `pnpm build` - プロジェクトビルド
- `pnpm deploy` - Cloudflare Workersにデプロイ（dry-run含む）
- `pnpm check` - ビルド + 型チェック + DB確認 + デプロイdry-run

## コード品質
- `pnpm lint` - ESLintでリンティング
- `pnpm lint:fix` - ESLintで自動修正
- `pnpm format` - Prettierでフォーマット
- `pnpm format:check` - フォーマットチェック
- `pnpm precommit` - コミット前処理（lint:fix + format）

## テスト
- `pnpm test:unit` - Vitestでユニットテスト
- `pnpm test:e2e` - PlaywrightでE2Eテスト

## データベース
- `pnpm db:generate` - Drizzleマイグレーション生成
- `pnpm db:migrate` - マイグレーション実行
- `pnpm db:push` - スキーマをDBにプッシュ
- `pnpm db:studio` - Drizzle Studio起動
- `pnpm db:check` - スキーマチェック

## Docker（開発用）
- `pnpm docker:up` - Docker環境起動
- `pnpm docker:down` - Docker環境停止
- `pnpm docker:db:reset` - DB環境リセット

## システムコマンド（macOS）
- `ls` - ファイル一覧
- `cd` - ディレクトリ移動
- `grep` - テキスト検索
- `find` - ファイル検索
- `git` - バージョン管理