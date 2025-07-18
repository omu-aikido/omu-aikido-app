import type { Page, Locator } from "@playwright/test"

export class ProfileSetupPage {
  readonly page: Page
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.nameInput = page.locator('input[name="name"]')
    this.emailInput = page.locator('input[name="email"]')
    this.saveButton = page.locator('button[type="submit"]')
  }

  async goto() {
    await this.page.goto("/account/setup")
  }

  async setupProfile(name: string, email: string) {
    await this.nameInput.fill(name)
    await this.emailInput.fill(email)
    await this.saveButton.click()
  }
}
