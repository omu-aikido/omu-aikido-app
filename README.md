# 活動記録アプリ Beta

[![Commit: a1a2ae3](https://img.shields.io/badge/Commit-a1a2ae3-blue)](https://github.com/omu-aikido/omu-aikido-app/commit/a1a2ae3b2b77112762632581e64010e11ee6358d)以降、Cloudflare PagesからWorkerに移行しました。

[![Preview Build on Cloudflare Worker](https://github.com/omu-aikido/omu-aikido-app/actions/workflows/preview.yml/badge.svg)](https://github.com/omu-aikido/omu-aikido-app/actions/workflows/preview.yml)
[![Deploy to Cloudflare Worker](https://github.com/omu-aikido/omu-aikido-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/omu-aikido/omu-aikido-app/actions/workflows/deploy.yml)

## 概要

活動記録アプリ Betaは、部活動の稽古を記録するためのフルスタックWebアプリです。
Astro.jsを使用して開発されています。

## ロードマップ

- [x] ユーザー登録
- [x] ログイン
- [x] 稽古の記録・閲覧・編集
- [ ] 役職別機能
    - [ ] 管理者
        - [x] 稽古の集計などの機能
    - [ ] 会計:精算機能 ……?
- [ ] 稽古の記録を元にしたグラフの表示

## 主な使用技術
- **[npm](https://www.npmjs.com)**  
    パッケージ管理

- **[Astro.js](https://astro.build)**  
    フレームワーク

- **[GitHub](https://github.com)**  
    ソースコード管理

- **[Catppuccin](https://catppuccin.com)**  
    カラーパレット

- **[Clerk](https://clerk.com)**  
    認証

- **[Turso](https://turso.tech)**  
    libSQLデータベース

- **[Drizzle](https://orm.drizzle.team)**  
    ORM

- **[ts-ics](https://github.com/Neuvernetzung/ts-ics)**  
    iCalendar生成

- **[CloudFlare Pages](https://pages.cloudflare.com)**  
    ホスティング

その他、使用しているパッケージ等は`package.json`に記載されています。

### ローカルでの開発方法

#### Requirements

- \*.db // データベースファイル (SQLite3)
    - `turso dev --db *.db` で`http://127.0.0.1:8080`にlibSqlサーバを起動します
- .env.development
- .env.production
- .dev.vars.development
- .dev.vars.production

環境変数に必要な情報は

- PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN

です。


```bash
$ npx astro dev # ローカルサーバを起動します
$ npx astro build # ビルドします
$ npx astro preview # プレビューします
```

## 注意

- Cloudflare上でのビルドは、libSQL関連のパッケージで実行時エラーが発生する可能性があるため、ローカルでビルドしてからのアップロードを推奨します。

その他、各種ツールのガイドを参考にしてください。

## ライセンス
Copyright 2025 [omu-aikido](https://github.com/omu-aikido)

Apache License Version 2.0（「本ライセンス」）に基づいてライセンスされます。あなたがこのファイルを使用するためには、本ライセンスに従わなければなりません。本ライセンスのコピーは下記の場所から入手できます。

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

適用される法律または書面での同意によって命じられない限り、本ライセンスに基づいて頒布されるソフトウェアは、明示黙示を問わず、いかなる保証も条件もなしに「現状のまま」頒布されます。本ライセンスでの権利と制限を規定した文言については、本ライセンスを参照してください。 