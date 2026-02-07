import { test, expect } from '@playwright/test';
import { addMonths, format } from 'date-fns';
import { ja } from 'date-fns/locale';

import { login, clearActivitiesInRange } from './auth-helper';

test.describe('Record CRUD Operations', () => {
  test.describe.configure({ mode: 'serial' });

  const getCellForDate = (page: import('@playwright/test').Page, date: Date) => {
    const day = format(date, 'd');
    const weekday = format(date, 'E', { locale: ja });
    return page
      .getByTestId('day-item')
      .filter({ hasText: new RegExp(`${day}\\s*${weekday}`) })
      .first();
  };

  const getSummaryRow = (todayCell: import('@playwright/test').Locator) => {
    return todayCell.locator('span', { hasText: '合計' }).locator('..');
  };

  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.text().includes('Failed')) {
        console.log(`[Browser] ${msg.type()}: ${msg.text()}`);
      }
    });
    page.on('dialog', async (d) => {
      console.log(`[Dialog] ${d.message()}`);
      await d.accept();
    });

    await login(page);
    const today = format(new Date(), 'yyyy-MM-dd');
    const nextMonthStart = format(addMonths(new Date(), 1), 'yyyy-MM-01');
    await clearActivitiesInRange(page, { startDate: today, endDate: today });
    await clearActivitiesInRange(page, { startDate: nextMonthStart, endDate: nextMonthStart });

    await page.goto('/record');
    await page.waitForLoadState('networkidle');
  });

  test('can create and delete an activity record', async ({ page }) => {
    // 1. Create a record
    // Find today's cell
    const todayCell = getCellForDate(page, new Date());
    await expect(todayCell).toBeVisible();

    // Get current hours (0 if none)
    let initialHours = 0;
    const summaryRow = getSummaryRow(todayCell);
    if (await summaryRow.isVisible()) {
      const text = await summaryRow.locator('span').nth(1).textContent();
      initialHours = Number(text ?? 0);
    }

    // Click to open form
    await todayCell.click();

    // Wait for modal
    const modal = page.getByRole('dialog');
    const modalHeading = page.getByRole('heading', { name: '記録を追加・編集' });
    await expect(modalHeading).toBeVisible();

    // Fill form (add 2 hours)
    await page.getByTestId('period-input').fill('2');
    await page.getByTestId('submit-btn').click();

    // Wait for modal to close
    await expect(modalHeading).not.toBeVisible();

    // 2. Verify creation
    // Check summary value increased by 2
    // Wait for the value to update (polling via expect)
    await expect
      .poll(async () => {
        if (!(await summaryRow.isVisible())) return null;
        const text = await summaryRow.locator('span').nth(1).textContent();
        return text ?? null;
      })
      .toBe(String(initialHours + 2));

    // 3. Delete the record
    await todayCell.click();
    await expect(modalHeading).toBeVisible();

    // Find the added record (2 hours) and click delete
    const recordItem = modal.locator('div').filter({ hasText: '2' }).filter({ hasText: '時間' }).first();
    await expect(recordItem).toBeVisible({ timeout: 30000 });
    await recordItem.locator('button[title="記録を削除"]').first().click();

    // Confirm dialog
    await expect(page.getByText('記録の削除')).toBeVisible();
    await page.getByRole('button', { name: '削除する' }).click();

    // Wait for dialog to close
    await expect(page.getByText('記録の削除')).not.toBeVisible();

    // 4. Verify deletion
    // Summary value should revert to initial
    if (initialHours === 0) {
      await expect(summaryRow).not.toBeVisible();
    } else {
      await expect(summaryRow.locator('span').nth(1)).toHaveText(String(initialHours));
    }
  });

  test('can add another record on a day with existing entries', async ({ page }) => {
    const targetDate = addMonths(new Date(), 1);
    targetDate.setDate(1);
    const targetDateString = format(targetDate, 'yyyy-MM-dd');

    await clearActivitiesInRange(page, { startDate: targetDateString, endDate: targetDateString });

    await page.getByTestId('next-month-btn').click();

    const targetCell = getCellForDate(page, targetDate);
    await expect(targetCell).toBeVisible();

    let initialHours = 0;
    const summaryRow = getSummaryRow(targetCell);
    if (await summaryRow.isVisible()) {
      const text = await summaryRow.locator('span').nth(1).textContent();
      initialHours = Number(text ?? 0);
    }

    const modalHeading = page.getByRole('heading', { name: '記録を追加・編集' });

    const addRecord = async (period: number) => {
      await targetCell.click();
      await expect(modalHeading).toBeVisible();
      await page.getByTestId('period-input').fill(String(period));
      await page.getByTestId('submit-btn').click();
      await expect(modalHeading).not.toBeVisible();
    };

    // Add two records with distinct values
    await addRecord(7);
    await expect
      .poll(async () => {
        if (!(await summaryRow.isVisible())) return null;
        const text = await summaryRow.locator('span').nth(1).textContent();
        return text ?? null;
      })
      .toBe(String(initialHours + 7));

    await addRecord(8);
    await expect
      .poll(async () => {
        if (!(await summaryRow.isVisible())) return null;
        const text = await summaryRow.locator('span').nth(1).textContent();
        return text ?? null;
      })
      .toBe(String(initialHours + 15));

    // Cleanup via API to avoid coupling to UI list order
    await clearActivitiesInRange(page, { startDate: targetDateString, endDate: targetDateString });
  });
});
