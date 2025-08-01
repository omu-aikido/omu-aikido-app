import { expect, test } from "@playwright/test"

test.describe("記録操作", () => {
  test("記録の追加から削除まで", async ({ page }) => {
    await page.goto("/record")
    await expect(page.getByRole('heading', { name: '記録一覧' })).toBeVisible();
    await expect(page.getByText('日', { exact: true })).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^1$/ }).first()).toBeVisible();
    await page.locator('div').filter({ hasText: /^1$/ }).first().click();
    await expect(page.getByRole('button', { name: '記録を追加' })).toBeVisible();
    await page.getByRole('button', { name: '記録を追加' }).click();
    await expect(page.getByRole('main')).toContainText('時間');
    await page.getByRole('button', { name: '一時保存' }).click();
    await expect(page.getByText('合計 1.5h').first()).toBeVisible();
    await expect(page.getByRole('button', { name: '登録' })).toBeVisible();
    await page.getByRole('button', { name: '登録' }).click();
    await page.goto('http://localhost:4173/record');
    await expect(page.getByText('合計 1.5h').first()).toBeVisible();
    await page.getByText('1合計 1.5h').click();
    await expect(page.getByText('時間')).toBeVisible();
    await page.getByRole('button', { name: '削除' }).click();
    await expect(page.getByRole('main')).toContainText('この日の活動記録がありません。');
    await page.getByRole('button', { name: '一時保存' }).click();
    await page.getByRole('button', { name: '登録' }).click();
  })
})
