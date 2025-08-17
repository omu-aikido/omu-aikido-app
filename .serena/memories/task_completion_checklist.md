# タスク完了時の手順

## コード変更後の必須チェック

1. **リンティング・フォーマット**

   ```bash
   pnpm lint:fix
   pnpm format
   ```

2. **型チェック**

   ```bash
   pnpm build  # TypeScript型チェック含む
   ```

3. **テスト実行**

   ```bash
   pnpm test:unit     # ユニットテスト
   pnpm test:e2e      # E2Eテスト（必要に応じて）
   ```

4. **データベース関連変更時**

   ```bash
   pnpm db:check      # スキーマ確認
   pnpm db:generate   # マイグレーション生成（必要時）
   ```

5. **総合チェック**
   ```bash
   pnpm check  # ビルド + 型チェック + DB確認 + デプロイdry-run
   ```

## コミット前

```bash
pnpm precommit  # lint:fix + format の自動実行
```

## デプロイ前確認

```bash
pnpm deploy  # dry-runでデプロイ確認
```

## 推奨ワークフロー

1. 開発: `pnpm dev`
2. コード変更
3. 保存時: 自動フォーマット（エディタ設定推奨）
4. コミット前: `pnpm precommit`
5. プッシュ前: `pnpm check`
