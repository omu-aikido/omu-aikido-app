import { expect, type Page } from "@playwright/test"

/**
 * 共通テストヘルパー関数
 * デスクトップ（グリッド）とモバイル（リスト）の両方の表示モードに対応
 */

export interface RecordTestHelpers {
  /**
   * レコードページへ遷移する
   * @returns {Promise<void>}
   */
  navigateToRecord: () => Promise<void>
  /**
   * ページのロード完了を待機する
   * @returns {Promise<void>}
   */
  waitForPageLoad: () => Promise<void>
  /**
   * 指定した日をクリックする
   * @param {number} day - 日付（1〜31など）
   * @returns {Promise<void>}
   */
  clickDay: (day: number) => Promise<void>
  /**
   * レコードを追加する
   * @returns {Promise<void>}
   */
  addRecord: () => Promise<void>
  /**
   * レコードを削除する
   * @param {number} [index] - 削除するレコードのインデックス（省略時は0）
   * @returns {Promise<void>}
   */
  deleteRecord: (index?: number) => Promise<void>
  /**
   * レコードを保存する
   * @returns {Promise<void>}
   */
  saveRecord: () => Promise<void>
  /**
   * レコードを登録（submit）する
   * @returns {Promise<void>}
   */
  submitRecords: () => Promise<void>
  /**
   * レコードをリセットする
   * @param {boolean} [acceptDialog] - ダイアログを受け入れるか（デフォルトtrue）
   * @returns {Promise<void>}
   */
  resetRecords: (acceptDialog?: boolean) => Promise<void>
  /**
   * 指定した日にレコードがあることを検証する
   * @param {number} day - 日付
   * @returns {Promise<void>}
   */
  verifyDayHasRecord: (day: number) => Promise<void>
  /**
   * 指定した日にレコードがないことを検証する
   * @param {number} day - 日付
   * @returns {Promise<void>}
   */
  verifyDayHasNoRecord: (day: number) => Promise<void>
  /**
   * 登録ボタンの状態を検証する
   * @param {boolean} enabled - 有効かどうか
   * @param {string} [text] - ボタンのテキスト
   * @returns {Promise<void>}
   */
  verifySubmitButtonState: (enabled: boolean, text?: string) => Promise<void>
  /**
   * リセットボタンの状態を検証する
   * @param {boolean} enabled - 有効かどうか
   * @returns {Promise<void>}
   */
  verifyResetButtonState: (enabled: boolean) => Promise<void>
  /**
   * 日毎の活動が空であることを検証する
   * @returns {Promise<void>}
   */
  verifyDailyActivityEmpty: () => Promise<void>
  /**
   * 指定したインデックスの日毎の活動アイテムが表示されていることを検証する
   * @param {number} index - アイテムのインデックス
   * @returns {Promise<void>}
   */
  verifyDailyActivityItem: (index: number) => Promise<void>
  /**
   * 表示モードに応じたコンテナのテストIDを取得する
   * @returns {string}
   */
  getContainerTestId: () => string
  /**
   * 指定した日のテストIDを取得する
   * @param {number} day - 日付
   * @returns {string}
   */
  getDayTestId: (day: number) => string
}

/**
 * デスクトップ用（グリッド表示）のテストヘルパー
 */
export class DesktopRecordHelpers implements RecordTestHelpers {
  constructor(private page: Page) {}

  async navigateToRecord(): Promise<void> {
    await this.page.goto("/record")
  }

  async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByTestId("record-page-container")).toBeVisible()
    await expect(this.page.getByTestId("monthly-activity-grid")).toBeVisible()
  }

  async clickDay(day: number): Promise<void> {
    await this.page.getByTestId("monthly-activity-grid").getByTestId(`day-${day}`).click()
  }

  async addRecord(): Promise<void> {
    await expect(this.page.getByTestId("daily-activity-card")).toBeVisible()
    await this.page.getByTestId("add-record").click()
  }

  async deleteRecord(index = 0): Promise<void> {
    await expect(this.page.getByTestId("daily-activity-card")).toBeVisible()
    await expect(
      this.page.getByTestId("daily-activity-item-" + index).getByTestId("delete-record"),
    ).toBeVisible()
    await this.page
      .getByTestId(`daily-activity-item-${index}`)
      .getByTestId("delete-record")
      .click()
  }

  async saveRecord(): Promise<void> {
    await expect(this.page.getByTestId("daily-activity-card")).toBeVisible()
    await this.page.getByTestId("save-record").click()
  }

  async submitRecords(): Promise<void> {
    await this.verifySubmitButtonState(true, "登録")
    await this.page.getByTestId("record-button-submit").click()
    await this.verifySubmitButtonState(false, "登録")
  }

  async resetRecords(acceptDialog = true): Promise<void> {
    if (acceptDialog) {
      this.page.once("dialog", dialog => {
        dialog.accept()
      })
    } else {
      this.page.once("dialog", dialog => {
        dialog.dismiss()
      })
    }
    await this.page.getByTestId("record-button-reset").click()
  }

  async verifyDayHasRecord(day: number): Promise<void> {
    await expect(
      this.page.getByTestId("monthly-activity-grid").getByTestId(`day-${day}-has-record`),
    ).toBeVisible()
  }

  async verifyDayHasNoRecord(day: number): Promise<void> {
    await expect(
      this.page.getByTestId("monthly-activity-grid").getByTestId(`day-${day}-no-record`),
    ).toBeVisible()
  }

  async verifySubmitButtonState(enabled: boolean, text?: string): Promise<void> {
    if (text) {
      await expect(this.page.getByTestId("record-button-submit")).toHaveText(text)
    }
    if (enabled) {
      await expect(this.page.getByTestId("record-button-submit")).toBeEnabled()
    } else {
      await expect(this.page.getByTestId("record-button-submit")).toBeDisabled()
    }
  }

  async verifyResetButtonState(enabled: boolean): Promise<void> {
    const resetButton = this.page.getByTestId("record-button-reset")
    if (enabled) {
      await expect(resetButton).toBeEnabled()
    } else {
      await expect(resetButton).toBeDisabled()
    }
  }

  async verifyDailyActivityEmpty(): Promise<void> {
    await expect(this.page.getByTestId("daily-activity-empty")).toBeVisible()
  }

  async verifyDailyActivityItem(index: number): Promise<void> {
    await expect(this.page.getByTestId(`daily-activity-item-${index}`)).toBeVisible()
  }

  getContainerTestId(): string {
    return "monthly-activity-grid"
  }

  getDayTestId(day: number): string {
    return `day-${day}`
  }
}

/**
 * モバイル用（リスト表示）のテストヘルパー
 */
export class MobileRecordHelpers implements RecordTestHelpers {
  constructor(private page: Page) {}

  async navigateToRecord(): Promise<void> {
    await this.page.goto("/record")
  }

  async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByTestId("record-page-container")).toBeVisible()
    await expect(this.page.getByTestId("monthly-activity-list")).toBeVisible()
  }

  async clickDay(day: number): Promise<void> {
    await this.page.getByTestId("monthly-activity-list").getByTestId(`day-${day}`).click()
  }

  async addRecord(): Promise<void> {
    await expect(this.page.getByTestId("daily-activity-card")).toBeVisible()
    await this.page.getByTestId("add-record").click()
  }

  async deleteRecord(index = 0): Promise<void> {
    await expect(this.page.getByTestId("daily-activity-card")).toBeVisible()
    await expect(
      this.page.getByTestId("daily-activity-item-" + index).getByTestId("delete-record"),
    ).toBeVisible()
    await this.page
      .getByTestId(`daily-activity-item-${index}`)
      .getByTestId("delete-record")
      .click()
  }

  async saveRecord(): Promise<void> {
    await expect(this.page.getByTestId("daily-activity-card")).toBeVisible()
    await this.page.getByTestId("save-record").click()
  }

  async submitRecords(): Promise<void> {
    await this.verifySubmitButtonState(true, "登録")
    await this.page.getByTestId("record-button-submit-mobile").click()
    await this.verifySubmitButtonState(false, "登録")
  }

  async resetRecords(acceptDialog = true): Promise<void> {
    if (acceptDialog) {
      this.page.once("dialog", dialog => {
        dialog.accept()
      })
    } else {
      this.page.once("dialog", dialog => {
        dialog.dismiss()
      })
    }
    await this.page.getByTestId("record-button-reset-mobile").click()
  }

  async verifyDayHasRecord(day: number): Promise<void> {
    await expect(
      this.page.getByTestId("monthly-activity-list").getByTestId(`day-${day}-has-record`),
    ).toBeVisible()
  }

  async verifyDayHasNoRecord(day: number): Promise<void> {
    await expect(
      this.page.getByTestId("monthly-activity-list").getByTestId(`day-${day}-no-record`),
    ).toBeVisible()
  }

  async verifySubmitButtonState(enabled: boolean, text?: string): Promise<void> {
    if (text) {
      await expect(this.page.getByTestId("record-button-submit-mobile")).toHaveText(text)
    }
    if (enabled) {
      await expect(this.page.getByTestId("record-button-submit-mobile")).toBeEnabled()
    } else {
      await expect(this.page.getByTestId("record-button-submit-mobile")).toBeDisabled()
    }
  }

  async verifyResetButtonState(enabled: boolean): Promise<void> {
    const resetButton = this.page.getByTestId("record-button-reset-mobile")
    if (enabled) {
      await expect(resetButton).toBeEnabled()
    } else {
      await expect(resetButton).toBeDisabled()
    }
  }

  async verifyDailyActivityEmpty(): Promise<void> {
    await expect(this.page.getByTestId("daily-activity-empty")).toBeVisible()
  }

  async verifyDailyActivityItem(index: number): Promise<void> {
    await expect(this.page.getByTestId(`daily-activity-item-${index}`)).toBeVisible()
  }

  getContainerTestId(): string {
    return "monthly-activity-list"
  }

  getDayTestId(day: number): string {
    return `day-${day}`
  }
}

/**
 * 共通のアサーション関数
 */
export class CommonAssertions {
  constructor(private page: Page) {}

  /**
   * ボタンの状態とテキストを確認
   */
  async verifyButtonState(
    testId: string,
    enabled: boolean,
    text?: string,
    timeout = 5000,
  ): Promise<void> {
    const button = this.page.getByTestId(testId)

    if (enabled) {
      await expect(button).toBeEnabled({ timeout })
    } else {
      await expect(button).toBeDisabled({ timeout })
    }

    if (text) {
      await expect(button).toHaveText(text, { timeout })
    }
  }

  /**
   * エラーメッセージが表示されていることを確認
   */
  async verifyErrorMessage(message?: string): Promise<void> {
    const errorElement = this.page.getByTestId("error-message")
    await expect(errorElement).toBeVisible()

    if (message) {
      await expect(errorElement).toContainText(message)
    }
  }

  /**
   * 成功メッセージが表示されていることを確認
   */
  async verifySuccessMessage(message?: string): Promise<void> {
    const successElement = this.page.getByTestId("success-message")
    await expect(successElement).toBeVisible()

    if (message) {
      await expect(successElement).toContainText(message)
    }
  }

  /**
   * ローディング状態の確認
   */
  async verifyLoadingState(isLoading: boolean): Promise<void> {
    const loadingElement = this.page.getByTestId("loading-indicator")

    if (isLoading) {
      await expect(loadingElement).toBeVisible()
    } else {
      await expect(loadingElement).not.toBeVisible()
    }
  }
}

/**
 * テストヘルパーファクトリー
 */
export function createRecordHelpers(page: Page, isMobile = false): RecordTestHelpers {
  const helper = isMobile ? new MobileRecordHelpers(page) : new DesktopRecordHelpers(page)
  helper.navigateToRecord()
  return helper
}

/**
 * 共通のテストセットアップ
 */
export async function setupRecordTest(
  page: Page,
  isMobile = false,
): Promise<{ helpers: RecordTestHelpers; assertions: CommonAssertions }> {
  const helpers = createRecordHelpers(page, isMobile)
  const assertions = new CommonAssertions(page)

  await helpers.navigateToRecord()
  await helpers.waitForPageLoad()

  return { helpers, assertions }
}

/**
 * データベース操作後のUI同期を待機する関数
 */
export async function waitForDbSync(page: Page, isMobile = false): Promise<void> {
  // ページリロードでUI状態をリセット
  await page.reload()
  await page.waitForLoadState("networkidle")

  // 表示モードに応じたコンテナの読み込み待機
  const containerTestId = isMobile ? "monthly-activity-list" : "monthly-activity-grid"
  await expect(page.getByTestId(containerTestId)).toBeVisible()

  // 少し追加の待機時間を設ける（UIの更新完了を確実にするため）
  await page.waitForTimeout(500)
}
