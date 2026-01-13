import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '@playwright/test'

import { login } from './auth-helper'

test.describe.skip('Record CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.text().includes('Failed')) {
        console.log(`[Browser] ${msg.type()}: ${msg.text()}`)
      }
    })
    page.on('dialog', async (d) => {
      console.log(`[Dialog] ${d.message()}`)
      await d.accept()
    })

    await setupClerkTestingToken({ page })
    await login(page)
    await page.goto('/record')
    await page.waitForLoadState('networkidle')
  })

  test('can create and delete an activity record', async ({ page }) => {
    // 1. Create a record
    // Find today's cell
    const todayCell = page.locator('.day-today')
    await expect(todayCell).toBeVisible()

    // Get current hours (0 if none)
    let initialHours = 0
    if ((await todayCell.locator('.summary-value').count()) > 0) {
      const text = await todayCell.locator('.summary-value').textContent()
      initialHours = Number(text)
    }

    // Click to open form
    await todayCell.click()

    // Wait for modal
    const modal = page.locator('.modal-panel')
    await expect(modal).toBeVisible()

    // Fill form (add 2 hours)
    await page.getByTestId('period-input').fill('2')
    await page.getByTestId('submit-btn').click()

    // Wait for modal to close
    await expect(modal).not.toBeVisible()

    // 2. Verify creation
    // Check summary value increased by 2
    // Wait for the value to update (polling via expect)
    await expect(todayCell.locator('.summary-value')).toHaveText(String(initialHours + 2), { timeout: 30000 })

    // 3. Delete the record
    await todayCell.click()
    await expect(modal).toBeVisible()

    // Find the added record (2 hours) and click delete
    const recordItem = modal.locator('.record-item').filter({ hasText: '2' }).first()
    await recordItem.locator('.delete-btn').click()

    // Confirm dialog
    await expect(page.getByText('記録の削除')).toBeVisible()
    await page.getByRole('button', { name: '削除する' }).click()

    // Wait for dialog to close
    await expect(page.getByText('記録の削除')).not.toBeVisible()

    // 4. Verify deletion
    // Summary value should revert to initial
    if (initialHours === 0) {
      await expect(todayCell.locator('.summary-value')).not.toBeVisible()
    } else {
      await expect(todayCell.locator('.summary-value')).toHaveText(String(initialHours))
    }
  })
})
