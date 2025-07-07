// レコードのCRUD操作・検索・フィルタリングのE2Eテスト
import { test, expect } from "@playwright/test"
import { DashboardPage } from "./pages/DashboardPage"
import { AddRecordPage } from "./pages/AddRecordPage"
import { EditRecordPage } from "./pages/EditRecordPage"
import { RecordListPage } from "./pages/RecordListPage"

test.describe("レコード管理", () => {
  test("レコード追加", async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.goto()
    await dashboard.goToAddRecord()

    const addRecord = new AddRecordPage(page)
    await addRecord.addRecord("テストタイトル", "テスト内容")

    const recordList = new RecordListPage(page)
    await recordList.goto()
    await expect(recordList.recordRows.first()).toContainText("テストタイトル")
  })

  test("レコード編集", async ({ page }) => {
    const recordList = new RecordListPage(page)
    await recordList.goto()
    await recordList.editRecord(0)

    const editRecord = new EditRecordPage(page)
    await editRecord.editRecord("編集後タイトル", "編集後内容")

    await recordList.goto()
    await expect(recordList.recordRows.first()).toContainText("編集後タイトル")
  })

  test("レコード削除", async ({ page }) => {
    const recordList = new RecordListPage(page)
    await recordList.goto()
    await recordList.deleteRecord(0)

    await expect(recordList.recordRows.first()).not.toContainText("編集後タイトル")
  })

  test("レコード検索・フィルタリング", async ({ page }) => {
    const recordList = new RecordListPage(page)
    await recordList.goto()
    await recordList.search("テスト")
    await expect(recordList.recordRows.first()).toContainText("テスト")
    await recordList.filter("完了")
    // フィルタ結果の検証は適宜
  })
})
