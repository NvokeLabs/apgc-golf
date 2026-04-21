# Dynamic Sponsor Tiers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the in-progress refactor from hardcoded sponsor tier keys to fully CMS-driven, dynamically editable tiers, and make each tier drive the visual size of its sponsors' logos on the public Sponsors page.

**Architecture:** Add a `logoSize` enum field to the `SponsorshipTiers` Payload collection. Introduce one shared utility module (`src/utilities/sponsorTierSize.ts`) that maps `logoSize` → Tailwind classes and `next/image` dimensions. Rewrite the broken `/sponsors` pyramid to loop over active tiers dynamically, using the shared map. Backfill existing DB rows with a one-shot TSX script.

**Tech Stack:** Next.js 15 (App Router), Payload CMS 3.64.0 (postgres-adapter), React 19, TypeScript, Tailwind, Vitest (integration tests). Package manager: **bun**.

**Spec:** `docs/superpowers/specs/2026-04-21-dynamic-sponsor-tiers-design.md`

---

## Starting state (important)

The working tree currently has uncommitted changes from an in-progress refactor. The existing uncommitted diff is **correct and necessary** — the plan builds on top of it. Relevant files and their current state:

- `src/collections/Sponsors/index.ts` — `tier` already swapped from select → `relationship` to `sponsorship-tiers` ✅ keep
- `src/collections/SponsorRegistrations/index.ts` — `selectedTier` already swapped from select → text ✅ keep
- `src/collections/SponsorshipTiers/index.ts` — old `tierKey` select field already removed ✅ keep; this plan adds `logoSize`
- `src/seed/index.ts` — ALBATROS/EAGLE/BIRDIE/PAR tiers already seeded (no `logoSize` yet) ✅ keep; this plan adds `logoSize`
- `src/app/(frontend)/register/sponsor/page.tsx` + `SponsorRegistrationForm.tsx` — already use `getSponsorshipTiers()` ✅ keep
- `src/payload-types.ts` — already regenerated for the relationship change ✅ keep
- `src/app/(payload)/admin/importMap.js` + `tsconfig.tsbuildinfo` — build artifacts ✅ keep
- **`src/app/(frontend)/sponsors/page.tsx` — currently BROKEN**: references `titleSponsors` / `platinumSponsors` / `goldSponsors` variables that no longer exist. Task 3 of this plan replaces the broken block. Until then, the page won't compile.

### Task 0: Baseline commit

**Files:** all currently-modified files except `src/app/(frontend)/sponsors/page.tsx`

- [ ] **Step 0.1: Stash the broken sponsors page, commit the rest as baseline**

The broken `sponsors/page.tsx` should not land in a commit. Stage everything else:

```bash
git add src/collections/Players/index.ts \
        src/collections/Sponsors/index.ts \
        src/collections/SponsorRegistrations/index.ts \
        src/collections/SponsorshipTiers/index.ts \
        src/app/\(frontend\)/register/sponsor/SponsorRegistrationForm.tsx \
        src/app/\(frontend\)/register/sponsor/page.tsx \
        src/app/\(payload\)/admin/importMap.js \
        src/seed/index.ts \
        src/payload-types.ts \
        tsconfig.tsbuildinfo
git status
```

Expected: `src/app/(frontend)/sponsors/page.tsx` remains modified (not staged). Everything else staged.

- [ ] **Step 0.2: Commit baseline**

```bash
git commit -m "$(cat <<'EOF'
refactor: move sponsor tiers to CMS relationship (baseline)

- Sponsors.tier: select → relationship to sponsorship-tiers
- SponsorshipTiers: drop hardcoded tierKey
- SponsorRegistrations.selectedTier: select → free text
- Seed: replace 3 hardcoded tiers with 4 CMS tiers (ALBATROS/EAGLE/BIRDIE/PAR)
- Register/sponsor pages: use dynamic getSponsorshipTiers()

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## File structure for this plan

| File | Purpose | Task |
|---|---|---|
| `src/collections/SponsorshipTiers/index.ts` | Add `logoSize` field | Task 1 |
| `src/utilities/sponsorTierSize.ts` | NEW — shared size map and fallback | Task 2 |
| `tests/int/golf-collections.int.spec.ts` | NEW tests for logoSize round-trip + resolveLogoSize | Task 2, Task 5 |
| `src/app/(frontend)/sponsors/page.tsx` | Replace broken pyramid with dynamic tier loop | Task 3 |
| `src/seed/index.ts` | Add `logoSize` to each seeded tier | Task 4 |
| `src/scripts/backfill-tier-logo-sizes.ts` | NEW — one-shot TSX backfill for existing tiers | Task 6 |
| `src/scripts/audit-stale-sponsor-tiers.ts` | NEW — one-shot TSX audit for stale sponsor tier strings | Task 7 |
| `src/payload-types.ts` | Regenerated automatically | Task 1 |

---

### Task 1: Add `logoSize` field to `SponsorshipTiers` collection

**Files:**
- Modify: `src/collections/SponsorshipTiers/index.ts`
- Regenerate: `src/payload-types.ts` (via `bun run generate:types`)

- [ ] **Step 1.1: Add the field and update defaultColumns**

Open `src/collections/SponsorshipTiers/index.ts`. Two changes:

1. Update the `defaultColumns` line (around line 16):

```ts
  admin: {
    defaultColumns: ['name', 'price', 'logoSize', 'order', 'isActive'],
    useAsTitle: 'name',
    group: 'Golf Content',
  },
```

2. Add a new `logoSize` field after the `isHighlighted` field at the end of the `fields` array (around line 107, before the closing `]`):

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
    },
```

- [ ] **Step 1.2: Regenerate Payload types**

Run:
```bash
bun run generate:types
```

Expected: the command exits 0 and `src/payload-types.ts` is updated.

- [ ] **Step 1.3: Verify the type landed**

Run:
```bash
grep -n "logoSize" src/payload-types.ts
```

Expected output: at least two lines, one in the `SponsorshipTier` interface and one in `SponsorshipTiersSelect`. The SponsorshipTier line should read approximately:

```ts
  logoSize: 'xl' | 'lg' | 'md' | 'sm';
```

- [ ] **Step 1.4: Verify build still type-checks**

Run:
```bash
bun run build 2>&1 | tail -40
```

Expected: build succeeds. There will still be no usage of `logoSize` outside the schema; that's fine.

If the build fails with errors **unrelated** to `logoSize`, stop and report — do not continue. Errors **about** `logoSize` should not occur at this stage.

- [ ] **Step 1.5: Commit**

```bash
git add src/collections/SponsorshipTiers/index.ts src/payload-types.ts
git commit -m "$(cat <<'EOF'
feat(tiers): add logoSize enum field to SponsorshipTiers

Adds a required select field (xl/lg/md/sm) defaulting to 'sm' so
tier editors can control how prominent each tier's sponsor logos
appear on the public Sponsors page.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Create the shared size utility with unit tests (TDD)

**Files:**
- Create: `src/utilities/sponsorTierSize.ts`
- Create: `tests/int/golf-collections.int.spec.ts` (currently empty)

- [ ] **Step 2.1: Write the failing test first**

Open `tests/int/golf-collections.int.spec.ts` (it's currently empty) and write:

```ts
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
```

- [ ] **Step 2.2: Run the test and verify it fails**

Run:
```bash
bun run test:int
```

Expected: test fails with a module-resolution error on `@/utilities/sponsorTierSize` (because the file doesn't exist yet). Something like:

```
Failed to resolve import "@/utilities/sponsorTierSize"
```

- [ ] **Step 2.3: Create the utility module**

Create `src/utilities/sponsorTierSize.ts`:

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

- [ ] **Step 2.4: Run the test and verify it passes**

Run:
```bash
bun run test:int
```

Expected: all assertions pass, exit code 0.

- [ ] **Step 2.5: Commit**

```bash
git add src/utilities/sponsorTierSize.ts tests/int/golf-collections.int.spec.ts
git commit -m "$(cat <<'EOF'
feat(tiers): add shared sponsor tier size utility

One source of truth for Tailwind size classes + next/image dimensions
per tier logoSize bucket, plus a null-safe resolver that defaults
unset tiers to 'sm'. Covered by unit tests in golf-collections.int.spec.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Rewrite the Sponsors page pyramid (fixes the broken build)

**Files:**
- Modify: `src/app/(frontend)/sponsors/page.tsx`

Until this task completes, `/sponsors` does not compile. After this task, it renders.

- [ ] **Step 3.1: Replace the broken block**

Open `src/app/(frontend)/sponsors/page.tsx`. Two edits:

**(a) Update imports** — replace the import line that currently reads:

```tsx
import { Check, ArrowRight, Award, Globe, Users, Handshake, Trophy, Star } from 'lucide-react'
```

...with these two lines (keeping the icon import, adding a new line for the utility):

```tsx
import { Check, ArrowRight, Award, Globe, Users, Handshake, Trophy, Star } from 'lucide-react'
import {
  LOGO_SIZE_CLASSES,
  LOGO_SIZE_IMAGE_DIMS,
  resolveLogoSize,
} from '@/utilities/sponsorTierSize'
```

**(b) Replace the entire `{/* Pyramid Layout */}` block** (currently around lines 166-250, containing the broken `titleSponsors` / `platinumSponsors` / `goldSponsors` references and the three per-row JSX blocks) **with the following**:

```tsx
        {/* Pyramid Layout */}
        {sponsors.length > 0 && cmsTiers.length > 0 && (
          <div className="mb-24 flex flex-col items-center gap-4">
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
                        <span className="text-[#0b3d2e] font-medium text-center">
                          {sponsor.name}
                        </span>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )
            })}
          </div>
        )}
```

**(c) Also delete the now-unused local `tierSizeClasses` array and `getTierSize` helper** (currently around lines 126-133, right above `const sponsorsByTierId = ...`):

```tsx
  // DELETE THESE LINES:
  const tierSizeClasses = [
    'w-40 h-32 md:w-64 md:h-48',
    'w-32 h-24 md:w-48 md:h-32',
    'w-28 h-20 md:w-40 md:h-28',
    'w-24 h-16 md:w-32 md:h-24',
  ]
  const getTierSize = (idx: number) =>
    tierSizeClasses[Math.min(idx, tierSizeClasses.length - 1)]
```

Keep the `sponsorsByTierId` Map block immediately below them — that's still used.

- [ ] **Step 3.2: Remove unused icon imports**

After the rewrite, `Trophy` and `Star` may no longer be used (they were used by the old `getTierIcon` helper that was already deleted in the in-progress diff). Run:

```bash
grep -n "Trophy\|Star" src/app/\(frontend\)/sponsors/page.tsx
```

If each icon appears only on the `import` line and nowhere else in the file, remove it from the `from 'lucide-react'` import. Keep any icon that IS still referenced (e.g. `Globe`, `Users`, `Handshake`, `Award`, `Check`, `ArrowRight`, `Star` if still used as a fallback in the `whyPartner` icon switch).

Check the `whyPartner` icon switch around the middle of the file — `Star` IS the default case there, so keep `Star`. `Trophy` is used in the same switch, so keep `Trophy` too. Net effect: both icons stay.

- [ ] **Step 3.3: Verify the build compiles**

Run:
```bash
bun run build 2>&1 | tail -40
```

Expected: build succeeds with no TypeScript errors. Pay specific attention to:
- No `Cannot find name 'titleSponsors'` / `platinumSponsors` / `goldSponsors` errors
- No unused-import warnings for `LOGO_SIZE_CLASSES` etc.

- [ ] **Step 3.4: Manual smoke test**

Start the dev server:
```bash
bun run dev
```

Open `http://localhost:3000/sponsors` in a browser and verify:
1. Page renders without runtime errors (check browser console)
2. If the DB has seeded tiers AND active sponsors with tier relationships, the pyramid shows them grouped by tier in `order` sequence
3. If there are no sponsors, the pyramid block is hidden entirely — page still renders the header, Canva embed, pricing grid, and "Why Partner With Us" below
4. The pricing grid still shows 4 tier cards (driven by `sponsorshipTiers` which falls back to `defaultSponsorshipTiers`)

If the DB is empty, create two tiers via the admin panel (at `http://localhost:3000/admin`, Golf Content → Sponsorship Tiers) with different `logoSize` values, then create one sponsor per tier (with a logo), then recheck the pyramid.

Stop the dev server (`Ctrl+C`) before committing.

- [ ] **Step 3.5: Commit**

```bash
git add src/app/\(frontend\)/sponsors/page.tsx
git commit -m "$(cat <<'EOF'
fix(sponsors): rewrite pyramid to iterate CMS tiers dynamically

Replaces the broken title/platinum/gold hardcoded rows with a loop
over active sponsorship-tiers, using the shared sponsorTierSize
utility to size logos by tier.logoSize. Tiers with zero active
sponsors render nothing. Grayscale/opacity is uniform across all
logos.

Fixes broken build where titleSponsors / platinumSponsors /
goldSponsors variables no longer existed after the tier-relationship
refactor.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Add `logoSize` to seeded tiers

**Files:**
- Modify: `src/seed/index.ts` (around lines 1049-1112)

- [ ] **Step 4.1: Add `logoSize` to each of the four tier objects**

Open `src/seed/index.ts`. The seed block creates 4 tier objects: ALBATROS, EAGLE, BIRDIE, PAR. Add `logoSize` to each one.

For **ALBATROS** (around line 1050), inside the object literal, add `logoSize: 'xl',` as a new line. The object should now look like:

```ts
      {
        name: 'ALBATROS',
        order: 1,
        isActive: true,
        logoSize: 'xl',
        price: 'Rp 100.000.000',
        priceNumeric: 100000000,
        benefits: [
          // ... existing benefits unchanged ...
        ],
        isHighlighted: true,
      },
```

For **EAGLE** (around line 1066), add `logoSize: 'lg',`:

```ts
      {
        name: 'EAGLE',
        order: 2,
        isActive: true,
        logoSize: 'lg',
        price: 'Rp 75.000.000',
        priceNumeric: 75000000,
        benefits: [ /* unchanged */ ],
        isHighlighted: false,
      },
```

For **BIRDIE** (around line 1082), add `logoSize: 'md',`:

```ts
      {
        name: 'BIRDIE',
        order: 3,
        isActive: true,
        logoSize: 'md',
        price: 'Rp 50.000.000',
        priceNumeric: 50000000,
        benefits: [ /* unchanged */ ],
        isHighlighted: false,
      },
```

For **PAR** (around line 1097), add `logoSize: 'sm',`:

```ts
      {
        name: 'PAR',
        order: 4,
        isActive: true,
        logoSize: 'sm',
        price: 'Rp 25.000.000',
        priceNumeric: 25000000,
        benefits: [ /* unchanged */ ],
        isHighlighted: false,
      },
```

- [ ] **Step 4.2: Verify type-check passes**

Run:
```bash
bun run build 2>&1 | tail -20
```

Expected: build succeeds. The `payload.create({ collection: 'sponsorship-tiers', data: tier })` call now receives a `logoSize` that matches the required enum.

- [ ] **Step 4.3: Commit**

```bash
git add src/seed/index.ts
git commit -m "$(cat <<'EOF'
feat(seed): assign logoSize per tier (xl/lg/md/sm)

ALBATROS=xl, EAGLE=lg, BIRDIE=md, PAR=sm — matches the
original pyramid's relative sizing.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Integration test for tier round-trip with `logoSize`

**Files:**
- Modify: `tests/int/golf-collections.int.spec.ts` (append a new describe block)

- [ ] **Step 5.1: Write the failing integration test**

Append this block to the end of `tests/int/golf-collections.int.spec.ts`:

```ts
import { beforeAll, afterAll } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'

describe('SponsorshipTiers.logoSize round-trip', () => {
  let payload: Payload
  const createdIds: number[] = []

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    for (const id of createdIds) {
      try {
        await payload.delete({ collection: 'sponsorship-tiers', id })
      } catch {
        // already deleted or never created; ignore
      }
    }
  })

  it('persists and reads back a logoSize value', async () => {
    const created = await payload.create({
      collection: 'sponsorship-tiers',
      data: {
        name: `test-tier-${Date.now()}`,
        price: 'Rp 0',
        order: 999,
        isActive: false,
        logoSize: 'lg',
      },
    })
    createdIds.push(created.id)

    const fetched = await payload.findByID({
      collection: 'sponsorship-tiers',
      id: created.id,
    })

    expect(fetched.logoSize).toBe('lg')
  })

  it('applies the sm default when logoSize is omitted on create', async () => {
    const created = await payload.create({
      collection: 'sponsorship-tiers',
      // @ts-expect-error intentionally omitting required logoSize to verify runtime default
      data: {
        name: `test-default-${Date.now()}`,
        price: 'Rp 0',
        order: 998,
        isActive: false,
      },
    })
    createdIds.push(created.id)

    expect(created.logoSize).toBe('sm')
  })
})
```

> Note: the second test uses `@ts-expect-error` because `logoSize` is `required: true` in the schema, so the generated input type requires it. The expectation is intentional — we're verifying runtime default behavior, not the type-level contract. If Payload's generated types change such that `logoSize` becomes optional on input, remove the `@ts-expect-error` line.

- [ ] **Step 5.2: Run the integration test**

Requires a running Postgres DB reachable via `DATABASE_URI` in `.env`. If that isn't set, skip to Step 5.4.

Run:
```bash
bun run test:int
```

Expected: all existing tests pass, plus two new tests for `SponsorshipTiers.logoSize round-trip`. Exit code 0.

If the tests fail because the DB isn't available, that's an environment issue — note it and move on (the unit tests from Task 2 still run and cover the utility module).

- [ ] **Step 5.3: Clean up any leftover test tiers**

If the test was interrupted, there may be orphan rows. Verify none remain:

```bash
bun run payload --help  # sanity check Payload CLI is wired
```

Or open the admin UI and remove any `test-tier-*` / `test-default-*` rows.

- [ ] **Step 5.4: Commit**

```bash
git add tests/int/golf-collections.int.spec.ts
git commit -m "$(cat <<'EOF'
test(tiers): integration test for logoSize round-trip

Verifies that a SponsorshipTiers row persists logoSize to Postgres
and reads it back unchanged, and that omitting logoSize on create
applies the 'sm' default.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Backfill script for existing tier rows

**Files:**
- Create: `src/scripts/backfill-tier-logo-sizes.ts`

This project runs Payload in push mode (no `migrationDir` in `payload.config.ts`), so schema changes are auto-applied but existing rows do not get default values applied retroactively. A one-shot TSX script handles the backfill.

- [ ] **Step 6.1: Create the backfill script**

Create directory if needed and write the script:

```bash
mkdir -p src/scripts
```

Create `src/scripts/backfill-tier-logo-sizes.ts`:

```ts
import 'dotenv/config'

import { getPayload } from 'payload'
import config from '@/payload.config'

import type { LogoSize } from '@/utilities/sponsorTierSize'

/**
 * Map a tier's `order` to a logoSize bucket, mirroring the seed defaults.
 * Editors can override in admin after running.
 */
const orderToLogoSize = (order: number | null | undefined): LogoSize => {
  if (order == null) return 'sm'
  if (order <= 1) return 'xl'
  if (order === 2) return 'lg'
  if (order === 3) return 'md'
  return 'sm'
}

async function main() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'sponsorship-tiers',
    limit: 1000,
    pagination: false,
  })

  let updated = 0
  let skipped = 0

  for (const tier of docs) {
    if (tier.logoSize) {
      skipped += 1
      continue
    }
    const next = orderToLogoSize(tier.order)
    await payload.update({
      collection: 'sponsorship-tiers',
      id: tier.id,
      data: { logoSize: next },
    })
    console.log(`  set logoSize=${next} on "${tier.name}" (order=${tier.order ?? 'null'})`)
    updated += 1
  }

  console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 6.2: Run the backfill locally**

If a local DB with existing tier rows is available:

```bash
bunx tsx src/scripts/backfill-tier-logo-sizes.ts
```

Expected output (example):
```
  set logoSize=xl on "ALBATROS" (order=1)
  set logoSize=lg on "EAGLE" (order=2)
  set logoSize=md on "BIRDIE" (order=3)
  set logoSize=sm on "PAR" (order=4)

Done. Updated 4, skipped 0.
```

Running it a second time should show `Updated 0, skipped 4` — confirming idempotency.

If no local DB is available, skip the execution and rely on the script landing in the repo for production runs.

- [ ] **Step 6.3: Verify type-check**

Run:
```bash
bun run build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 6.4: Commit**

```bash
git add src/scripts/backfill-tier-logo-sizes.ts
git commit -m "$(cat <<'EOF'
feat(scripts): one-shot backfill for tier logoSize

Idempotent TSX script that sets logoSize on any SponsorshipTiers
row missing it, using the tier's `order` as a heuristic
(<=1: xl, 2: lg, 3: md, >=4: sm). Run once per environment after
deploy:

    bunx tsx src/scripts/backfill-tier-logo-sizes.ts

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Audit script for sponsors with stale string tier values

**Files:**
- Create: `src/scripts/audit-stale-sponsor-tiers.ts`

If any `sponsors` rows were created before the `tier: select → relationship` refactor, they may have a string value (`'title'` / `'platinum'` / `'gold'`) in the `tier` column that no longer matches any tier ID. The audit script flags these so an editor can remap them manually.

- [ ] **Step 7.1: Create the audit script**

Create `src/scripts/audit-stale-sponsor-tiers.ts`:

```ts
import 'dotenv/config'

import { getPayload } from 'payload'
import config from '@/payload.config'

async function main() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'sponsors',
    limit: 1000,
    pagination: false,
  })

  const stale: Array<{ id: number; name: string; tier: unknown }> = []

  for (const sponsor of docs) {
    const tier = sponsor.tier
    // A valid tier is either a number (ID reference) or an object (populated relation).
    // A string here means a pre-refactor hardcoded key like 'title' / 'gold' / 'platinum'.
    if (typeof tier === 'string') {
      stale.push({ id: sponsor.id, name: sponsor.name, tier })
    }
  }

  if (stale.length === 0) {
    console.log(`\nNo stale sponsors found out of ${docs.length} total. Safe to deploy.`)
    process.exit(0)
  }

  console.log(`\n⚠️  Found ${stale.length} sponsor(s) with stale string tier values:\n`)
  for (const s of stale) {
    console.log(`  id=${s.id}  name="${s.name}"  tier=${JSON.stringify(s.tier)}`)
  }
  console.log(
    `\nOpen each in the admin panel (Golf Content → Sponsors) and reselect the tier from the relationship dropdown, or delete the row if the sponsor is no longer active.`,
  )
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 7.2: Run the audit**

```bash
bunx tsx src/scripts/audit-stale-sponsor-tiers.ts
```

Expected:
- If zero stale rows: exit 0 with "No stale sponsors found".
- If any stale rows: exit 1 with a table. For each reported row, open `http://localhost:3000/admin` → Sponsors → click the row → pick the correct tier from the dropdown → Save.

Re-run the audit to confirm it's clean.

- [ ] **Step 7.3: Verify type-check**

Run:
```bash
bun run build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 7.4: Commit**

```bash
git add src/scripts/audit-stale-sponsor-tiers.ts
git commit -m "$(cat <<'EOF'
feat(scripts): audit sponsors with stale string tier values

Reports any Sponsors rows whose `tier` is still a string instead of
a relationship to sponsorship-tiers (leftover from the pre-refactor
hardcoded 'title'/'platinum'/'gold' values). Exit 1 if any found,
with instructions to remap via the admin panel.

    bunx tsx src/scripts/audit-stale-sponsor-tiers.ts

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Verification checklist (run after Task 7)

- [ ] `bun run build` exits 0
- [ ] `bun run test:int` — all tests pass (given a reachable DB)
- [ ] `/sponsors` renders in the browser with no console errors
- [ ] Creating a new tier via admin without `logoSize` — admin UI blocks save (field is required)
- [ ] Creating a new tier via admin with `logoSize: 'xl'` — renders at the top size on `/sponsors` within the cache TTL (or immediately after the `revalidateTierAfterChange` hook fires)
- [ ] Changing a tier's `logoSize` in admin — refreshes on `/sponsors` on next request
- [ ] Deactivating a tier (`isActive: false`) — its row vanishes from `/sponsors`
- [ ] `bunx tsx src/scripts/backfill-tier-logo-sizes.ts` — exits 0, idempotent on re-run
- [ ] `bunx tsx src/scripts/audit-stale-sponsor-tiers.ts` — exits 0 (no stale rows)

## Out of scope (explicitly deferred)

- Per-tier opacity/grayscale override field
- Per-tier hero icon override
- Converting `selectedTier` on `sponsor-registrations` to a relationship
- A homepage sponsor block consuming `sponsorTierSize` (the shared module is ready for this but no homepage change is required today)
- Adding a formal Payload `migrations` directory and switching off push mode
