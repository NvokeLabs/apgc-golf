# Dynamic Sponsor Tiers — Design Spec

**Date:** 2026-04-21
**Status:** Approved (ready for implementation planning)

## Goal

Finish the in-progress refactor from hardcoded sponsor tier keys (`title` / `platinum` / `gold`) to fully CMS-driven, dynamically editable tiers, and make each tier drive the visual size of its sponsors' logos on the public Sponsors page.

## Background

The project is partway through moving tiers out of the codebase and into the `sponsorship-tiers` Payload collection. The data-model side is mostly done; the public `/sponsors` page is broken because the JSX still references `titleSponsors` / `platinumSponsors` / `goldSponsors` variables that were deleted when the filtering logic was rewritten.

Beyond fixing the break, we want tier editors to control how prominent each tier's logos appear on the page — bigger logos for higher-prestige tiers, smaller for lower — without code changes.

## Decisions (from brainstorming)

| # | Question | Decision |
|---|---|---|
| 1 | How is logo size determined? | Explicit `logoSize` enum field on the tier. |
| 2 | What size buckets? | Four: `xl`, `lg`, `md`, `sm`, each mapped to a fixed pair of mobile/desktop Tailwind size classes. |
| 3 | Opacity / grayscale treatment? | Uniform across all tiers: every logo renders at 70% opacity, grayscale, revealing full color / 100% opacity on hover. |
| 4 | Seed + default mapping? | ALBATROS → `xl`, EAGLE → `lg`, BIRDIE → `md`, PAR → `sm`. New tiers default to `sm`. |
| 5 | `selectedTier` on `sponsor-registrations`? | Keep as free text (point-in-time record of the tier name the applicant chose). |

## Architecture

Three moving parts:

1. **Schema** — one new `logoSize` select field on `SponsorshipTiers`. Everything else in the schema is already in place.
2. **A shared size map** — a single `src/utilities/sponsorTierSize.ts` module that maps `logoSize` → Tailwind classes and `next/image` dimensions. Both the public page and any future consumer (e.g. a homepage sponsors block) import from this module.
3. **Sponsors page rewrite** — replace the broken hardcoded rows with a loop over active tiers sorted by `order`, rendering a row per tier using the size map.

Migration: backfill `logoSize` on existing tier docs; manually remap any sponsor rows with stale string tier values (editorial mapping, not mechanical).

## Data model changes

### `src/collections/SponsorshipTiers/index.ts`

Add one field, placed after the existing `order` / `isActive` row:

```ts
{
  name: 'logoSize',
  type: 'select',
  required: true,
  defaultValue: 'sm',
  options: [
    { label: 'Extra Large (top/hero row)', value: 'xl' },
    { label: 'Large', value: 'lg' },
    { label: 'Medium', value: 'md' },
    { label: 'Small', value: 'sm' },
  ],
  admin: {
    description:
      'Controls how big sponsor logos are displayed on the public Sponsors page. Bigger = more prominent.',
  },
}
```

Also update `admin.defaultColumns` to include `logoSize`:

```ts
defaultColumns: ['name', 'price', 'logoSize', 'order', 'isActive'],
```

### `src/collections/Sponsors/index.ts`

No change — the in-progress refactor from select to relationship is already correct.

### `src/collections/SponsorRegistrations/index.ts`

No change — `selectedTier` stays as free text.

### `src/payload-types.ts`

Regenerated via `bun run generate:types` after the collection change. The `SponsorshipTier` interface will gain:

```ts
logoSize: 'xl' | 'lg' | 'md' | 'sm';
```

## Shared size module

New file: `src/utilities/sponsorTierSize.ts`

```ts
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
```

`resolveLogoSize` exists so that any tier without `logoSize` set (e.g. one that predates the migration) defaults to `sm` at read time rather than crashing.

## Seed changes

`src/seed/index.ts` (tier seed block around lines 1049-1112): add `logoSize` to each of the four seeded tiers.

| Tier | `order` | `logoSize` |
|---|---|---|
| ALBATROS | 1 | `xl` |
| EAGLE | 2 | `lg` |
| BIRDIE | 3 | `md` |
| PAR | 4 | `sm` |

The seed is gated by an `existingTiers.totalDocs === 0` check, so it only runs on empty databases.

## Public Sponsors page rewrite

File: `src/app/(frontend)/sponsors/page.tsx`

### Remove

- `tierSizeClasses` array and `getTierSize` helper (lines ~126-133)
- References to `titleSponsors`, `platinumSponsors`, `goldSponsors` (lines ~170-249) — these variables don't exist and currently cause a compile error

### Add / change

Import the shared module:

```ts
import {
  LOGO_SIZE_CLASSES,
  LOGO_SIZE_IMAGE_DIMS,
  resolveLogoSize,
} from '@/utilities/sponsorTierSize'
```

Keep the existing `sponsorsByTierId` Map build (lines ~136-144).

The pyramid iterates `cmsTiers` (the real CMS docs) rather than the `sponsorshipTiers` variable — `sponsorshipTiers` falls back to a hardcoded array when the CMS is empty, and those fallback entries have neither `id` (needed for the Map lookup) nor `logoSize`. The pricing grid below keeps using `sponsorshipTiers` so it still renders sensibly when the CMS is empty. The pyramid only shows when CMS tiers + sponsors both exist, which is the correct behavior.

Replace the pyramid block with one loop over `cmsTiers` (already sorted by `order` from `getSponsorshipTiers`):

```tsx
{cmsTiers.map((tier) => {
  const tierSponsors = (sponsorsByTierId.get(tier.id) ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  if (tierSponsors.length === 0) return null

  const size = resolveLogoSize(tier.logoSize)
  const dims = LOGO_SIZE_IMAGE_DIMS[size]

  return (
    <div
      key={tier.id}
      className="flex flex-wrap justify-center gap-3 md:gap-6 max-w-6xl w-full"
    >
      {tierSponsors.map((sponsor) => (
        <GlassCard
          key={sponsor.id}
          className={`${LOGO_SIZE_CLASSES[size]} flex items-center justify-center p-4 bg-white/50 border-[#0b3d2e]/10 hover:border-[#0b3d2e]/30 transition-colors`}
          hoverEffect
        >
          {typeof sponsor.logo === 'object' && sponsor.logo?.url ? (
            <Image
              src={sponsor.logo.url}
              alt={sponsor.name}
              width={dims.width}
              height={dims.height}
              className="max-w-full max-h-full object-contain grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <span className="text-[#0b3d2e] font-medium text-center">{sponsor.name}</span>
          )}
        </GlassCard>
      ))}
    </div>
  )
})}
```

### Behavior

- Tier order drives row order (existing `sort: 'order'` on the fetch).
- Sponsor order within a row uses the sponsor's own `order` field.
- Tiers with zero active sponsors render nothing (no empty row).
- Opacity/grayscale is uniform: `grayscale opacity-70` with `hover:opacity-100 hover:grayscale-0`.
- When the CMS has no tiers (fresh install before seed), `cmsTiers` is empty and the entire pyramid block is skipped — the "Become a Sponsor" pricing grid below still renders using `defaultSponsorshipTiers`, so the page is never empty.

## Sponsor registration page

`src/app/(frontend)/register/sponsor/page.tsx` and `SponsorRegistrationForm.tsx` — no changes. The form already passes `tier.name` as the `selectedTier` string, and `selectedTier` is a free-text field in the collection.

## Migration

### 1. Backfill `logoSize` on existing tier docs

New Payload migration: `src/migrations/<timestamp>_backfill_tier_logoSize.ts`.

For every existing `sponsorship-tiers` doc without `logoSize`, set a value based on `order`:

| `order` range | `logoSize` |
|---|---|
| ≤ 1 | `xl` |
| 2 | `lg` |
| 3 | `md` |
| ≥ 4 or null | `sm` |

This mirrors the seed mapping so existing local DBs match the freshly seeded layout. Editors can tweak in the admin afterwards.

The migration is idempotent (skips any doc that already has `logoSize` set).

### 2. Sponsor rows with stale string tier values

If any `sponsors` rows exist with old string tier values (`'title'` / `'platinum'` / `'gold'`), they need their `tier` relationship reassigned. The name mapping is editorial (e.g. is `'title'` the new `ALBATROS` or `EAGLE`?), so:

- Run a read-only audit query before deploy: `payload.find({ collection: 'sponsors', limit: 1000 })` and log any `sponsor.tier` values that are strings.
- Document a manual admin step: open each affected sponsor and re-pick the tier from the relationship dropdown.

If the audit returns zero stale rows (likely, since there's no evidence of a real sponsor seed), this step is skipped.

## Revalidation

No changes. `revalidateTierAfterChange` (`src/collections/SponsorshipTiers/hooks/revalidateTiers.ts`) already busts `/sponsors` and the `sponsorship-tiers` cache tag on any tier edit — including `logoSize` changes. Editing a tier's `logoSize` will live-update the public page within the existing revalidation window.

## Testing strategy

- **Unit**: no new pure functions beyond `resolveLogoSize`, which is a one-line fallback — covered by TypeScript.
- **Integration (manual)**:
  1. Run the backfill migration locally; verify the four seeded tiers get the expected sizes.
  2. Create a 5th tier via admin with no `logoSize` set — verify it defaults to `sm` and renders at the smallest size.
  3. Toggle a tier's `logoSize` in admin — verify `/sponsors` updates on next request.
  4. Deactivate a tier — verify the row disappears from `/sponsors`.
  5. Create a sponsor with no logo — verify the fallback name renders in the correctly sized card.
  6. Submit the sponsor registration form with a real tier and with "Custom" — verify both land in the collection with the expected `selectedTier` string.
- **Visual regression**: none formally; compare `/sponsors` before/after the change — the pyramid should look visually equivalent to the old hardcoded version when there are 4 tiers with the seed mapping.

## Out of scope

- Reworking the pricing grid further down the page (the 4-column "Become a Sponsor" grid works for any tier count as-is).
- Per-tier opacity/grayscale overrides (Q3 picked uniform; revisit if editors ask for it).
- Converting `selectedTier` on registrations to a relationship (Q5 kept as text).
- Adding a "Custom package" boolean on registrations (out of scope; the free-text value `"Custom"` is sufficient today).
- A homepage sponsor block — not part of this change, though the shared size module is designed so it could consume it later.
