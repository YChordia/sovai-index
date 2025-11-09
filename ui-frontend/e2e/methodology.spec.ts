import { test, expect } from '@playwright/test'
import { waitForApiReady, gotoAndIdle } from './utils'

test('methodology page renders', async ({ page }) => {
  await waitForApiReady(page)
  await gotoAndIdle(page, '/methodology')
  await page.getByText(/Methodology/i).waitFor()
  await expect(page.getByText('Weights')).toBeVisible()
})
