# Frontend Standardization (APGC) — Design

**Date:** 2026-06-14
**Phase:** 2 of 2 (Phase 1 = admin UX revamp).
**Goal:** Make the public site internally consistent in typography, spacing, buttons/cards, and interaction states. **No visual redesign** — normalize values already in use and centralize the repeated button recipe. Colors unchanged.

## Principle

The site is already mostly consistent (inventory confirmed). This pass maps OUTLIERS to the dominant pattern and centralizes the 108+ repeated raw-button recipe into shadcn `Button` variants that render the **same classes** (identical pixels). Rollout: apply, then user reviews the diff. Foundation + homepage first as the reference, then remaining pages.

## Canonical standard

### Typography
- **H1 / page title:** `text-4xl md:text-5xl font-light text-[#0b3d2e]` (hero's larger white title is a kept exception)
- **H2 / section header:** `text-3xl md:text-4xl font-bold text-[#0b3d2e]` (optional highlight word: `font-serif italic font-medium`)
- **H3 / card title:** `text-xl font-semibold text-[#0b3d2e]`
- **Eyebrow/label:** `text-xs font-bold tracking-[0.2em] uppercase`
- **Body:** `text-[#636364] text-lg`; caption `text-[#636364] text-sm`
- Map one-off sizes/weights (e.g. stray `font-light` on bold section headers, `text-2xl`/random) to the nearest canonical. Keep intentional serif-italic accents.

### Spacing
- **Section padding:** `py-24` default; `py-12` compact (e.g. sponsors marquee). Normalize stray `py-20` → `py-24` unless clearly intentional.
- **Container:** `container mx-auto px-6`.
- **Grid gaps:** `gap-6` default, `gap-8` spacious.
- **Heading-block margins:** `mb-12` major, `mb-8` minor. Restrict margins to the scale `{2,4,6,8,12}`.
- **Card padding:** `p-6` default, `p-8` forms/emphasis.

### Buttons (centralize, identical output)
Extend `src/components/ui/button.tsx` (cva) with brand variants matching the dominant recipes, and add brand sizes:
- `brand`: `bg-[#0b3d2e] text-white hover:bg-[#091f18] rounded-sm tracking-[0.15em] uppercase shadow-md hover:shadow-lg transition-all duration-300`
- `brandSecondary`: `bg-[#c2ecdb] text-[#0b3d2e] hover:bg-[#a8e0c8] border border-[#0b3d2e]/20 rounded-sm tracking-[0.15em] uppercase`
- `brandOutline`: `border-2 border-[#0b3d2e] text-[#0b3d2e] hover:bg-[#0b3d2e] hover:text-white rounded-sm transition-colors`
- sizes: `cta` = `px-6 py-4 text-sm`, `ctaSm` = `px-4 py-2 text-xs`, `ctaLg` = `px-8 py-4 text-sm` (cover the px/py combos found).
- New `src/components/golf/TextLink.tsx`: arrow text-link → `inline-flex items-center gap-2 text-[#0b3d2e] hover:text-[#091f18] font-medium transition-colors`, arrow icon with `group-hover:translate-x-1 transition-transform`.
- Migrate raw `<Link className="bg-[#0b3d2e]...">`/`<button>` instances to `<Button asChild variant=... size=...><Link/></Button>` (navigational) or `<Button variant=...>` (actions), and arrow links to `<TextLink>`. Rendered classes stay equivalent → no visual change. Standardize the only true outliers in passing: button `rounded` (→ `rounded-sm`), shadow (`shadow-md`/`hover:shadow-lg`).

### Cards
`GlassCard` is the standard (keep). Fix outliers: borders → `border-[#0b3d2e]/10`, default interior `p-6`. `ui/card` stays unused on the frontend.

### Interaction states
- **Form focus (unify):** `focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]` — replace `emerald-500` focus variants.
- Keep hover/transition conventions: `transition-all duration-300` general, `duration-700` image scale, `group-hover:scale-105/110`, sponsor logos `opacity-50 hover:opacity-80`.
- `Button` provides `focus-visible` rings for keyboard users.

## Scope (pages)

All of `src/app/(frontend)/`: home; events (list+detail); players (list+detail); news (list+detail); posts (list+detail+pagination); sponsors; contact; search; register/event (form+success+payment-success/failed); register/sponsor (form+success); `[slug]`. Plus shared `src/components/golf/*` (cards) and forms.

## Execution

1. **Foundation:** extend `ui/button.tsx` variants + create `golf/TextLink.tsx`. Verify compile.
2. **Reference page:** standardize `src/app/(frontend)/page.tsx` (home) against the standard; user reviews this diff.
3. **Remaining pages (parallel clusters):** (a) golf listings, (b) detail pages, (c) forms/flows + misc — each normalizes typography/spacing, migrates buttons → variants/`TextLink`, unifies focus, fixes card outliers.
4. Build + typecheck; user reviews full diff.

## Verification

- `bunx tsc --noEmit` clean; `bun run build` reaches "✓ Compiled successfully" (note: prerender needs the `players.role` DB column — run `bun run dev` once; see memory [[db-schema-push]]).
- Spot-check that rendered button/heading output is visually unchanged (same classes), only centralized/normalized.

## Out of scope

Color/layout/imagery changes; new animations; admin (Phase 1, done); content/data.
