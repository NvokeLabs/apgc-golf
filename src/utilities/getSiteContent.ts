import { cache } from 'react'
import { unstable_cache } from 'next/cache'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type {
  FormContent,
  HomePage,
  SiteLabel,
  SponsorsPage,
  SponsorshipTier,
} from '@/payload-types'

/**
 * Get site-wide labels (status, buttons, fields, navigation)
 * Cached with 'global_site-labels' tag
 */
export const getSiteLabels = cache(async (): Promise<SiteLabel> => {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'site-labels' })
})

/**
 * Get home page content (hero, sections, broadcast schedule)
 * Cached with 'global_home-page' tag
 */
export const getHomePageContent = cache(async (): Promise<HomePage> => {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'home-page' })
})

/**
 * Get sponsors page content (header, why partner, CTA)
 * Cached with 'global_sponsors-page' tag
 */
export const getSponsorsPageContent = cache(async (): Promise<SponsorsPage> => {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'sponsors-page' })
})

/**
 * Get form content (labels, placeholders, messages)
 * Cached with 'global_form-content' tag
 */
export const getFormContent = cache(async (): Promise<FormContent> => {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'form-content' })
})

/**
 * Get active sponsorship tiers
 * Cached with 'sponsorship-tiers' tag
 */
export const getSponsorshipTiers = cache(async (): Promise<SponsorshipTier[]> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'sponsorship-tiers',
    where: { isActive: { equals: true } },
    sort: 'order',
    limit: 100,
  })
  return result.docs
})

/**
 * Cached version for static generation with Next.js unstable_cache
 * Use when you need ISR with specific revalidation
 */
export const getCachedSiteLabels = unstable_cache(async () => getSiteLabels(), ['site-labels'], {
  tags: ['global_site-labels'],
})

export const getCachedHomePageContent = unstable_cache(
  async () => getHomePageContent(),
  ['home-page'],
  { tags: ['global_home-page'] },
)

export const getCachedSponsorsPageContent = unstable_cache(
  async () => getSponsorsPageContent(),
  ['sponsors-page'],
  { tags: ['global_sponsors-page'] },
)

export const getCachedFormContent = unstable_cache(async () => getFormContent(), ['form-content'], {
  tags: ['global_form-content'],
})

export const getCachedSponsorshipTiers = unstable_cache(
  async () => getSponsorshipTiers(),
  ['sponsorship-tiers'],
  { tags: ['sponsorship-tiers'] },
)
