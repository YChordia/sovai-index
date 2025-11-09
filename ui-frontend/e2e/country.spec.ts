import { test, expect } from '@playwright/test'

test('country detail renders for EU', async ({ page }) => {
  await page.goto('/country/EU')
  await page.getByText(/European Union/i).waitFor()
  await expect(page).toHaveScreenshot('country-eu.png', { maxDiffPixelRatio: 0.03 })
})

test('country detail renders for IN', async ({ page }) => {
  await page.goto('/country/IN')
  await page.getByText(/India/i).waitFor()
  await expect(page).toHaveScreenshot('country-in.png', { maxDiffPixelRatio: 0.03 })
})

