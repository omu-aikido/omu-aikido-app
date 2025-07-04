// 入力バリデーション・エラー状態のE2Eテスト
import { test, expect } from "@playwright/test"
import { AddRecordPage } from "./pages/AddRecordPage"
import { RecordListPage } from "./pages/RecordListPage"

test.describe("エッジケース・バリデーション", () => {
  test("必須フィールド未入力時のエラー表示", async ({ page }) => {
    const addRecord = new AddRecordPage(page)
    await addRecord.goto()
    await addRecord.addRecord("", "")
    await expect(page.locator(".error-message")).toHaveText(/必須/)
  })

  test("不正なデータ形式でのエラー表示", async ({ page }) => {
    const addRecord = new AddRecordPage(page)
    await addRecord.goto()
    await addRecord.addRecord("a", "b") // 例えば最小文字数未満
    await expect(page.locator(".error-message")).toHaveText(/形式/)
  })

  test.skip("エラー時のリダイレクトやガード", async ({ page }) => {
    await page.goto("/apps/record/edit/invalid-id")
    await expect(page).toHaveURL(/error|not-found/)
  })
})
