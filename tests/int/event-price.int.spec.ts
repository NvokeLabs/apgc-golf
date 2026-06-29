import { describe, it, expect } from 'vitest'
import { resolveEventPrice } from '@/utilities/registration/resolveEventPrice'

describe('resolveEventPrice', () => {
  it('uses the base price for general registrations', () => {
    expect(resolveEventPrice({ price: 500_000, alumniPrice: 300_000 }, 'general')).toBe(500_000)
  })

  it('uses alumniPrice for alumni when set', () => {
    expect(resolveEventPrice({ price: 500_000, alumniPrice: 300_000 }, 'alumni')).toBe(300_000)
  })

  it('falls back to the base price for alumni when alumniPrice is unset', () => {
    expect(resolveEventPrice({ price: 500_000, alumniPrice: null }, 'alumni')).toBe(500_000)
  })

  it('returns 0 when no price is configured', () => {
    expect(resolveEventPrice({ price: null, alumniPrice: null }, 'general')).toBe(0)
  })
})
