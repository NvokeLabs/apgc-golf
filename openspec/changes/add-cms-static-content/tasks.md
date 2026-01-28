# Tasks: Migrate Static Content to Payload CMS

## 1. Create Backend Globals and Collection

- [x] 1.1 Create SiteLabels Global (`/src/SiteLabels/config.ts`)
- [x] 1.2 Create HomePage Global (`/src/HomePage/config.ts`)
- [x] 1.3 Create SponsorsPage Global (`/src/SponsorsPage/config.ts`)
- [x] 1.4 Create FormContent Global (`/src/FormContent/config.ts`)
- [x] 1.5 Create SponsorshipTiers Collection (`/src/collections/SponsorshipTiers/index.ts`)
- [x] 1.6 Create revalidation hooks for each new global/collection
- [x] 1.7 Register globals and collection in payload.config.ts
- [x] 1.8 Run `npx payload generate:types` to update TypeScript types

## 2. Create Data Fetching Utilities

- [x] 2.1 Create `/src/utilities/getSiteContent.ts` with cached fetch functions

## 3. Update Frontend Pages

- [x] 3.1 Update Home Page (`/src/app/(frontend)/page.tsx`)
- [x] 3.2 Update Sponsors Page (`/src/app/(frontend)/sponsors/page.tsx`)
- [x] 3.3 Update Events List Page (`/src/app/(frontend)/events/page.tsx`)
- [x] 3.4 Update Event Detail Page (`/src/app/(frontend)/events/[slug]/page.tsx`)
- [x] 3.5 Update Players Page (`/src/app/(frontend)/players/page.tsx`)
- [x] 3.6 Update Player Detail Page (`/src/app/(frontend)/players/[slug]/page.tsx`)
- [x] 3.7 Update Event Registration Page and Form
- [x] 3.8 Update Sponsor Registration Page and Form
- [x] 3.9 Update Success/Failure pages

## 4. Seed Initial Data

- [x] 4.1 Create seed script to populate CMS with current hardcoded values (`/src/scripts/seed-cms-content.ts`)
- [ ] 4.2 Run seed script to initialize content (`npx tsx src/scripts/seed-cms-content.ts`)

## 5. Verification

- [ ] 5.1 Verify all pages render correctly with CMS data
- [ ] 5.2 Test content updates reflect on frontend
- [ ] 5.3 Test graceful fallbacks for missing content
