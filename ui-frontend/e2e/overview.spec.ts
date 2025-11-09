import { test, expect } from '@playwright/test'

test('overview page renders and matches screenshot', async ({ page }) => {
  await page.goto('/')
  await page.getByText('SovAI Index').waitFor()
  await expect(page).toHaveScreenshot('overview.png', { maxDiffPixelRatio: 0.02 })
})

