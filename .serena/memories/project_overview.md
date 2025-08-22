# プロジェクト概要

## プロジェクトの目的

部活の活動を記録・管理するためのWebアプリケーション（record-app）

## 技術スタック

- **フロントエンド**: React 19, React Router 7, Tailwind CSS 4
- **バックエンド**: Cloudflare Workers
- **データベース**: Turso (libSQL), Drizzle ORM
- **認証**: Clerk
- **テスト**: Vitest (ユニット), Playwright (E2E)
- **開発ツール**: TypeScript, ESLint, Prettier
- **ビルド**: Vite 7

## 主要機能

- ユーザー登録・ログイン
- 稽古の記録・閲覧・編集
- ユーザー情報の編集
- 管理者向け機能（予定）

## デプロイメント

Cloudflare Workersにデプロイされる
