import type { Page, Locator } from "@playwright/test"

export class AdminDashboardPage {
  readonly page: Page
  readonly userManagementLink: Locator
  readonly recordManagementLink: Locator
  readonly logoutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.userManagementLink = page.locator('a[href="/admin/account"]')
    this.recordManagementLink = page.locator('a[href="/admin/record"]')
    this.logoutButton = page.locator('button[data-testid="logout"]')
  }

  async goto() {
    await this.page.goto("/admin")
  }

  async goToUserManagement() {
    await this.userManagementLink.click()
  }

  async goToRecordManagement() {
    await this.recordManagementLink.click()
  }

  async logout() {
    await this.logoutButton.click()
  }
}
