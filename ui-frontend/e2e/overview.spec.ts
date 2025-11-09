import { test, expect } from '@playwright/test'
import { waitForApiReady, gotoAndIdle } from './utils'

test('overview page renders and matches screenshot', async ({ page }) => {
  await waitForApiReady(page)
  await gotoAndIdle(page, '/')
  await page.getByText('SovAI Index').waitFor()
  await expect(page).toHaveScreenshot('overview.png', { maxDiffPixelRatio: 0.02 })
})
