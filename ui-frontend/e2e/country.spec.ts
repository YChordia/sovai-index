import { test, expect } from '@playwright/test'
import { waitForApiReady, gotoAndIdle } from './utils'

test('country detail renders for EU', async ({ page }) => {
  await waitForApiReady(page)
  await gotoAndIdle(page, '/country/EU')
  await page.getByText(/European Union/i).waitFor()
  await expect(page.getByText('Readiness Score')).toBeVisible()
})

test('country detail renders for IN', async ({ page }) => {
  await waitForApiReady(page)
  await gotoAndIdle(page, '/country/IN')
  await page.getByText(/India/i).waitFor()
  await expect(page.getByText('Readiness Score')).toBeVisible()
})
