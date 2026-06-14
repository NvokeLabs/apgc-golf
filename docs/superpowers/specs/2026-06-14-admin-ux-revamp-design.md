# Admin UX Revamp (APGC) — Design

**Date:** 2026-06-14
**Phase:** 1 of 2 (Phase 2 = frontend design polish, separate spec).
**Goal:** Make the Payload admin clear and on-brand. It currently follows Payload defaults, has unreachable collections/globals, and mixes a navy/orange nav with stock Payload-purple content.

## Constraints

- **Keep the navy nav** base color (`#171046`). Do not recolor the nav. Only fix its grouping.
- **Keep the brand color combination:** green `#0b3d2e`, accent orange `#D66232`, with navy nav retained.
- **No schema changes.** Field-layout work is purely presentational — never rename a field's `name`, and never nest existing fields into a *named* group/tab (that changes the data path and breaks types + frontend). Allowed: `admin.position: 'sidebar'`, reordering, **unnamed** tabs, `row`, `collapsible`, `admin.description`, `label`, `defaultColumns`, `useAsTitle`.
- Vercel skills are NOT used here (they don't theme the Payload admin); this is Payload theming + IA.

## Key facts (verified)

- **Admin is already themed** (navy `#171046` + orange `#ed5f24`) in `src/app/(payload)/custom.scss` — nav, buttons, cards, tables, pills, login, dashboard, scrollbars. It's hand-written and imported by `src/app/(payload)/layout.tsx`. So visual-theme work = refine/fill any Payload-purple gaps, NOT a rebuild. Keep navy.
- Tailwind **v3.4.3**; shadcn configured (`components.json`), components in `src/components/ui/`. Frontend shadcn tokens live in `src/app/(frontend)/globals.css` `:root`. The **admin route does NOT import Tailwind or those tokens**, so shadcn won't work in admin until we add scoped Tailwind + tokens.
- Payload v3 removed `admin.css`/`admin.scss`. Inject admin styles via a **custom Provider** at `admin.components.providers` that imports a stylesheet (same import pattern the Nav uses).
- Custom Nav: `src/components/admin/Nav/index.tsx` (+ `styles.scss`). Note: it hides Payload's default nav; the `.nav__*` rules in `custom.scss` are largely dead but harmless.
- Dashboard: `src/components/BeforeDashboard/index.tsx` — metrics/quick-actions/activity-feed fed by `/api/admin/dashboard`; its styles live in `custom.scss`.
- Custom views to rebuild with shadcn: `src/components/admin/views/TicketsListView.tsx`, `TicketEditView.tsx` (+ `.scss`), `src/components/admin/collections/TicketsList.tsx`, `src/components/admin/TicketsBeforeList.tsx`, and the Check-In page `src/app/(payload)/admin/check-in/page.tsx`.
- Payload config: `src/payload.config.ts` (`admin.components`).

## shadcn-in-admin approach (scoped, preflight-safe)

- New `src/components/admin/Provider.tsx` (`'use client'`) imports `./admin-shadcn.css` and renders `children`. Register at `admin.components.providers: ['@/components/admin/Provider']`.
- `src/components/admin/admin-shadcn.css`:
  - `@tailwind utilities;` only — **no `@tailwind base`** (preflight) so Payload's native UI is untouched.
  - Scope shadcn tokens to a wrapper: `.apgc-admin { --background; --foreground; --primary; --primary-foreground; --secondary; --muted; --muted-foreground; --accent; --accent-foreground; --destructive; --border; --input; --ring; --radius; --card; --card-foreground; --popover; --popover-foreground; ... }` — copy values from the frontend `globals.css` `:root` (brand green/orange).
  - Minimal scoped reset (shadcn needs it because preflight is omitted): `.apgc-admin *, .apgc-admin *::before, .apgc-admin *::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: hsl(var(--border)); }`
- Every shadcn admin surface is rendered inside `<div className="apgc-admin"> … </div>` so utilities/tokens apply only there.

## Workstream A — Navigation + global theme + config

**A1. Nav grouping (`Nav/index.tsx`, TSX only — do not touch `styles.scss`):**
Rebuild `menuGroups` so every collection and global is reachable:
- **Golf Content** (defaultOpen): Events, Players, Sponsors, Sponsorship Tiers (`/admin/collections/sponsorship-tiers`), News
- **Registrations** (defaultOpen): Event Registrations, Sponsor Registrations, Tickets
- **Website Content** (collapsed): Home Page (`/admin/globals/home-page`), Sponsors Page (`/admin/globals/sponsors-page`), Site Labels (`/admin/globals/site-labels`), Form Content (`/admin/globals/form-content`), Pages, Posts, Header (`/admin/globals/header`), Footer (`/admin/globals/footer`)
- **Settings** (collapsed): Media, Categories, Users
Keep standalone Dashboard + Check-In Scanner links. Pick sensible lucide icons for the new entries.

**A2. Theme refinement (`src/app/(payload)/custom.scss`):** the admin is already navy/orange-themed here. Pass to fill remaining Payload-purple leaks (selects, date pickers, links, focus rings, lexical editor toolbar, checkbox/radio accents) by pointing them at the existing `--apgc-*` vars. Keep navy nav + orange accent. No structural rewrite.

**A3. shadcn enablement (new files + config):** create `src/components/admin/Provider.tsx` + `src/components/admin/admin-shadcn.css` per the "shadcn-in-admin approach" above, and register `providers: ['@/components/admin/Provider']` under `admin.components` in `payload.config.ts`.

## Workstream B — Field layouts (collection configs only)

Full reorg, presentational only (see Constraints), for: **Events, Players, Sponsors, News, SponsorshipTiers, EventRegistrations, SponsorRegistrations**. For each:
- Move meta/control fields (status, isFeatured/featured, slug, order, dates, tier relationship) to the **sidebar** via `admin.position: 'sidebar'`.
- Group the main body into clear **unnamed** tabs or `collapsible` sections (e.g. "Details", "Media", "Content") — following the existing Players pattern (unnamed tabs keep fields at top level).
- Add `admin.description` to non-obvious fields and clarify `label`s.
- Set helpful `admin.defaultColumns` and confirm `useAsTitle` for each list view.
- Do NOT add/remove/rename fields or introduce named groups/tabs.

## Workstream C — Rebuild custom surfaces with shadcn

All rebuilt surfaces are wrapped in `<div className="apgc-admin">` and use shadcn primitives from `@/components/ui/*` (Card, Button, Badge, Table, etc.) + lucide icons.
- **Dashboard** (`src/components/BeforeDashboard/index.tsx`): rebuild metrics/quick-actions/activity-feed with shadcn Card/Badge/Button. Keep the same `/api/admin/dashboard` data contract. Add an "Edit Home Page" quick action (`/admin/globals/home-page`). The old `.before-dashboard`/`.metric-card` rules in `custom.scss` become unused — leave them (harmless) or remove in A2.
- **Tickets views** (`views/TicketsListView.tsx`, `views/TicketEditView.tsx`, `collections/TicketsList.tsx`, `TicketsBeforeList.tsx`) and **Check-In** (`admin/check-in/page.tsx`): rebuild presentation with shadcn, preserving existing data fetching / props / Payload view contracts.

## Execution (waves — shadcn foundation must exist before views compile against it)

**Wave 1 (parallel, disjoint files):**
- Agent A — shadcn foundation + dashboard: Provider.tsx, admin-shadcn.css, register provider in `payload.config.ts`, rebuild `BeforeDashboard/index.tsx` with shadcn (this also proves the pipeline compiles).
- Agent B — Nav grouping (`Nav/index.tsx`) + theme refinement (`custom.scss`).
- Agent C — field-layout reorg (collection configs only).

Verify Wave 1 builds (`bunx tsc --noEmit` + `bun run build` or a dev compile) before Wave 2.

**Wave 2 (after Wave 1 green):**
- Agent D — rebuild Tickets views + Check-In page with shadcn.

Then `bun run generate:types` (presentational reorg must NOT change types — if it does, a field was wrongly nested/renamed) and a final typecheck/build.

## Verification

- `bun run generate:types` — no schema diff expected from B (presentational only). If types change, a field was wrongly nested/renamed — fix.
- `bunx tsc --noEmit` clean for touched files.
- Manual: every collection + global is reachable from the Nav; admin accents are brand (not purple); nav stays navy.

## Out of scope

Frontend redesign (Phase 2); schema/field additions or removals; collection relationship changes.
