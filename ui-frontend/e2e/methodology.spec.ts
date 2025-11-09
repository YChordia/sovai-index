import { test, expect } from '@playwright/test'

test('methodology page renders', async ({ page }) => {
  await page.goto('/methodology')
  await page.getByText(/Methodology/i).waitFor()
  await expect(page).toHaveScreenshot('methodology.png', { maxDiffPixelRatio: 0.02 })
})

