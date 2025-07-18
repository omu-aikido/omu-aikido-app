import type { Page, Locator } from "@playwright/test"

export class DashboardPage {
  readonly page: Page
  readonly header: Locator
  readonly addRecordButton: Locator
  readonly recordListLink: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.locator("header")
    this.addRecordButton = page.locator('button[data-testid="add-record"]')
    this.recordListLink = page.locator('a[href="/apps/record/list"]')
  }

  async goto() {
    await this.page.goto("/dashboard")
  }

  async goToAddRecord() {
    await this.addRecordButton.click()
  }

  async goToRecordList() {
    await this.recordListLink.click()
  }
}
