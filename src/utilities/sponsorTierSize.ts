import type { SponsorshipTier } from '@/payload-types'

export type LogoSize = NonNullable<SponsorshipTier['logoSize']>

export const LOGO_SIZE_CLASSES: Record<LogoSize, string> = {
  xl: 'w-40 h-32 md:w-64 md:h-48',
  lg: 'w-32 h-24 md:w-48 md:h-32',
  md: 'w-28 h-20 md:w-40 md:h-28',
  sm: 'w-24 h-16 md:w-32 md:h-24',
}

export const LOGO_SIZE_IMAGE_DIMS: Record<LogoSize, { width: number; height: number }> = {
  xl: { width: 200, height: 100 },
  lg: { width: 160, height: 80 },
  md: { width: 128, height: 64 },
  sm: { width: 96, height: 48 },
}

export const resolveLogoSize = (size: LogoSize | null | undefined): LogoSize => size ?? 'sm'
