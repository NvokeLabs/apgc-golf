import { describe, it, expect } from 'vitest'

import {
  LOGO_SIZE_CLASSES,
  LOGO_SIZE_IMAGE_DIMS,
  resolveLogoSize,
} from '@/utilities/sponsorTierSize'

describe('resolveLogoSize', () => {
  it('returns the size when it is set', () => {
    expect(resolveLogoSize('xl')).toBe('xl')
    expect(resolveLogoSize('lg')).toBe('lg')
    expect(resolveLogoSize('md')).toBe('md')
    expect(resolveLogoSize('sm')).toBe('sm')
  })

  it('falls back to "sm" when the size is null or undefined', () => {
    expect(resolveLogoSize(null)).toBe('sm')
    expect(resolveLogoSize(undefined)).toBe('sm')
  })
})

describe('LOGO_SIZE_CLASSES', () => {
  it('defines a Tailwind class string for every size', () => {
    expect(LOGO_SIZE_CLASSES.xl).toMatch(/w-\d+ h-\d+ md:w-\d+ md:h-\d+/)
    expect(LOGO_SIZE_CLASSES.lg).toMatch(/w-\d+ h-\d+ md:w-\d+ md:h-\d+/)
    expect(LOGO_SIZE_CLASSES.md).toMatch(/w-\d+ h-\d+ md:w-\d+ md:h-\d+/)
    expect(LOGO_SIZE_CLASSES.sm).toMatch(/w-\d+ h-\d+ md:w-\d+ md:h-\d+/)
  })
})

describe('LOGO_SIZE_IMAGE_DIMS', () => {
  it('defines positive width and height for every size', () => {
    for (const key of ['xl', 'lg', 'md', 'sm'] as const) {
      expect(LOGO_SIZE_IMAGE_DIMS[key].width).toBeGreaterThan(0)
      expect(LOGO_SIZE_IMAGE_DIMS[key].height).toBeGreaterThan(0)
    }
  })

  it('has monotonically non-increasing widths from xl to sm', () => {
    const order = ['xl', 'lg', 'md', 'sm'] as const
    for (let i = 0; i < order.length - 1; i++) {
      expect(LOGO_SIZE_IMAGE_DIMS[order[i]].width).toBeGreaterThanOrEqual(
        LOGO_SIZE_IMAGE_DIMS[order[i + 1]].width,
      )
    }
  })
})
