# 活動記録アプリ Beta

## 概要

活動記録アプリ Betaは、部活動の稽古を記録するためのフルスタックWebアプリです。
Astro.jsを使用して開発されています。

## ロードマップ

- [x] ユーザー登録
- [x] ログイン
- [x] 稽古の記録・閲覧・編集
- [ ] 管理者による稽古の集計などの機能
- [ ] 稽古の記録を元にしたグラフの表示
- [ ] 役職別機能
    - [ ] 会計:精算機能 ……?

## 開発環境

### 依存 （2025-02-09時点）

#### Dependencies

- @astrojs/check: ^0.9.4
- @astrojs/cloudflare: ^12.2.1
- @catppuccin/palette: ^1.7.1
- @clerk/astro: ^2.1.19
- @clerk/localizations: ^3.10.4
- @clerk/themes: ^2.2.16
- @libsql/client: ^0.14.0
- apexcharts: ^4.3.0
- astro: ^5.2.5
- drizzle-orm: ^0.39.1
- drizzle-zod: ^0.7.0
- svix: ^1.45.1
- ts-ics: ^1.6.6
- uuid: ^11.0.5

#### DevDependencies

- @cloudflare/workers-types: ^4.20250204.0
- drizzle-kit: ^0.30.4
- wrangler: ^3.107.3

#### その他

- Turso version v0.97.2

### ローカルでの開発方法

#### Requirements

- \*.db // データベースファイル (SQLite3)
    - `turso dev --db *.db` で`http://127.0.0.1:8080`にlibSqlサーバを起動します
- .env
- .env.local
- .env.production
- .dev.vars // cloudflare pages用の環境変数

```bash
$ npx astro dev # ローカルサーバを起動します
$ npx astro build # ビルドします
$ npx astro preview # プレビューします
```

`preview`されるのは本番環境と同じ環境です。環境変数の設定に注意してください。

各種ツールのガイドを参考にしてください。
