import type { Page, Locator } from "@playwright/test"

export class RecordListPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly filterSelect: Locator
  readonly recordRows: Locator
  readonly editButtons: Locator
  readonly deleteButtons: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.locator('input[name="search"]')
    this.filterSelect = page.locator('select[name="filter"]')
    this.recordRows = page.locator('tr[data-testid="record-row"]')
    this.editButtons = page.locator('button[data-testid="edit-record"]')
    this.deleteButtons = page.locator('button[data-testid="delete-record"]')
  }

  async goto() {
    await this.page.goto("/apps/record/list")
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword)
    await this.searchInput.press("Enter")
  }

  async filter(option: string) {
    await this.filterSelect.selectOption(option)
  }

  async editRecord(index: number) {
    await this.editButtons.nth(index).click()
  }

  async deleteRecord(index: number) {
    await this.deleteButtons.nth(index).click()
  }
}
