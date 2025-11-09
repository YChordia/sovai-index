import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Polyfill matchMedia for Mantine color scheme logic in jsdom
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  // @ts-expect-error - add JSDOM polyfill
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
