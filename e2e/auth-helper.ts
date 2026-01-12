import { Page, expect } from '@playwright/test'

const E2E_EMAIL = process.env.E2E_EMAIL
const E2E_PASSWORD = process.env.E2E_PASSWORD

export const E2E_USER = {
  username: process.env.E2E_USERNAME,
  firstName: process.env.E2E_FIRSTNAME,
  lastName: process.env.E2E_LASTNAME,
}

export async function login(page: Page) {
  if (!E2E_EMAIL || !E2E_PASSWORD) {
    throw new Error('E2E_EMAIL and E2E_PASSWORD environment variables are required.')
  }

  await page.goto('/sign-in')
  await page.getByLabel('メールアドレス').fill(E2E_EMAIL)
  await page.getByLabel('パスワード').fill(E2E_PASSWORD)
  await page.getByRole('button', { name: 'サインイン', exact: true }).click()
  await expect(page).toHaveURL('/')
  await page.waitForLoadState('networkidle')
}
