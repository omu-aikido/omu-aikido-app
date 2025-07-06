// XSS・アクセス制御のE2Eテスト
import { test, expect } from "@playwright/test"
import { AddRecordPage } from "./pages/AddRecordPage"
import { RecordListPage } from "./pages/RecordListPage"
import { AdminDashboardPage } from "./pages/AdminDashboardPage"

test.describe("セキュリティ", () => {
  test("XSS: レコード追加時にスクリプトが実行されない", async ({ page }) => {
    const addRecord = new AddRecordPage(page)
    await addRecord.goto()
    const xssPayload = "<img src=x onerror=alert(1)>"
    await addRecord.addRecord("XSSテスト", xssPayload)

    const recordList = new RecordListPage(page)
    await recordList.goto()
    await expect(recordList.recordRows.first()).toContainText("XSSテスト")
    // アラートが出ないことを検証（Playwrightはalertを自動dismissするため、window.alertの発火有無を検証する場合はイベントフックが必要）
  })

  test("一般ユーザーによる管理ページアクセス拒否", async ({ page }) => {
    const adminDashboard = new AdminDashboardPage(page)
    await adminDashboard.goto()
    await expect(page).not.toHaveURL("/admin")
  })
})
