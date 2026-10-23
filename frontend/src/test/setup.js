import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// jsdom lacks these browser APIs used by the layout
window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
window.scrollTo = () => {}
