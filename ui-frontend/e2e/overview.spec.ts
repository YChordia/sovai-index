import { test, expect } from '@playwright/test'
import { waitForApiReady, gotoAndIdle } from './utils'

test('overview page renders core UI', async ({ page }) => {
  await waitForApiReady(page)
  await gotoAndIdle(page, '/')
  await page.getByText('SovAI Index').waitFor()
  await expect(page.getByText('Overview')).toBeVisible()
  // Table renders at least one country
  const firstRow = page.locator('table tbody tr').first()
  await expect(firstRow).toBeVisible()
})
