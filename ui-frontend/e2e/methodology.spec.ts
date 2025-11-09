import { test, expect } from '@playwright/test'
import { waitForApiReady, gotoAndIdle } from './utils'

test('methodology page renders', async ({ page }) => {
  await waitForApiReady(page)
  await gotoAndIdle(page, '/methodology')
  // Be explicit to avoid strict mode violations (link + heading both say "Methodology")
  await page.getByRole('heading', { name: /Methodology/i }).waitFor()
  await expect(page.getByText('Weights')).toBeVisible()
})
