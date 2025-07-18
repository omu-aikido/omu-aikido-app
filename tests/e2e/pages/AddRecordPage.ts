import type { Page, Locator } from "@playwright/test"

export class AddRecordPage {
  readonly page: Page
  readonly titleInput: Locator
  readonly contentInput: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.titleInput = page.locator('input[name="title"]')
    this.contentInput = page.locator('textarea[name="content"]')
    this.saveButton = page.locator('button[type="submit"]')
  }

  async goto() {
    await this.page.goto("/apps/record/add")
  }

  async addRecord(title: string, content: string) {
    await this.titleInput.fill(title)
    await this.contentInput.fill(content)
    await this.saveButton.click()
  }
}
