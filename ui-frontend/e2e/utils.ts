import { Page, expect } from '@playwright/test'

export async function waitForApiReady(page: Page) {
  const apiBase = process.env.E2E_API_BASE || 'http://localhost:8000'
  // Wait for /health
  for (let i = 0; i < 20; i++) {
    const res = await page.request.get(`${apiBase}/health`)
    if (res.ok()) break
    await page.waitForTimeout(500)
  }
  // Wait for /countries to have at least one country
  for (let i = 0; i < 20; i++) {
    const res = await page.request.get(`${apiBase}/countries`)
    if (res.ok()) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) break
    }
    await page.waitForTimeout(500)
  }
}

export async function gotoAndIdle(page: Page, url: string) {
  await page.goto(url)
  // Give the app a moment to fetch API + topojson
  await page.waitForLoadState('networkidle')
}

