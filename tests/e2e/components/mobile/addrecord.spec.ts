import { expect, test } from "@playwright/test"

test.describe("記録操作", () => {
  test("記録の追加から削除まで", async ({ page }) => {
    await page.goto("/record")
    await page.goto('http://localhost:4173/');
     await page.getByRole('link', { name: '記録 活動の記録をつけよう 詳細を見る' }).click();
     await expect(page.locator('h1')).toContainText('記録一覧');
     await expect(page.getByRole('list')).toContainText('1日');
     await expect(page.getByRole('list')).toContainText('記録なし');
     await page.getByRole('listitem').filter({ hasText: '記録なし' }).locator('div').nth(1).click();
     await expect(page.getByRole('main')).toContainText('この日の活動記録がありません。');
     await page.getByRole('button', { name: '記録を追加' }).click();
     await expect(page.getByRole('main')).toContainText('時間');
     await page.getByRole('button', { name: '一時保存' }).click();
     await expect(page.getByRole('main')).toContainText('登録');
     await page.getByRole('button', { name: '登録' }).click();
     await page.goto('http://localhost:4173/record?month=2025-07');
     await expect(page.getByRole('list')).toContainText('合計 1.5h');
     await page.getByText('日 (火)合計 1.5h').click();
     await page.getByRole('button', { name: '削除' }).click();
     await expect(page.getByRole('main')).toContainText('この日の活動記録がありません。');
     await page.getByRole('button', { name: '一時保存' }).click();
     await page.getByRole('button', { name: '登録' }).click();
     await expect(page.getByRole('list')).toContainText('記録なし');
  })
})
