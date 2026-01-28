# Change: Migrate Static Content to Payload CMS

## Why

The frontend contains hardcoded text content (headings, labels, descriptions, pricing) that requires code deployment to update. Marketing and content teams should be able to update website copy without developer involvement.

## What Changes

- Create 4 new Globals: SiteLabels, HomePage, SponsorsPage, FormContent
- Create 1 new Collection: SponsorshipTiers
- Update frontend pages to fetch and display CMS content
- Add revalidation hooks for cache invalidation

## Impact

- Affected specs: cms-content (new capability)
- Affected code:
  - `/src/payload.config.ts` - Register new globals/collection
  - `/src/app/(frontend)/page.tsx` - Home page
  - `/src/app/(frontend)/sponsors/page.tsx` - Sponsors page
  - `/src/app/(frontend)/events/*.tsx` - Event pages
  - `/src/app/(frontend)/players/*.tsx` - Player pages
  - `/src/app/(frontend)/register/**/*.tsx` - Registration pages
