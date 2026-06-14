# Homepage Structural Upgrades (APGC) — Design

**Date:** 2026-06-14
**Context:** Client feedback on the live homepage (polinemagolf.com). Goal: strengthen the site for selling Director Cup VIII sponsorship and positioning APGC as a golf event platform.

## Scope

Structural/code work only. All actual content/data (alumni names & roles, stat numbers, sponsor logos, news, benefit copy beyond defaults) is entered by the client in the Payload admin. The event date discrepancy (Priority 1) is already fixed by the client and is out of scope.

Three changes, from the client's "Prioritas 3":

- **B. Alumni & Professional Network** (Priority 2) — convert the "Featured Players" section from rank/wins/points to name + role/title.
- **C. Stats / Impact band** — new "Dampak APGC" numbers section (client's biggest flagged gap).
- **D. Why Sponsor + CTA** (Priority 3) — new "Mengapa Menjadi Sponsor" section with benefit cards and a sponsorship CTA button.

## Key files

- `src/app/(frontend)/page.tsx` — hardcoded homepage React component; fetches collections + the `home-page` global.
- `src/HomePage/config.ts` — `home-page` Payload global (tabbed groups; editable in admin).
- `src/collections/Players/index.ts` — Players collection.

## A. Alumni & Professional Network (reuse Players collection)

**Schema (`src/collections/Players/index.ts`):**
- Add a top-level text field `role` (placed after the slug field), admin description: "Role/title shown on the Alumni & Professional Network card (e.g. Vice Chairman APGC)".
- Add `role: true` to `defaultPopulate`.

**Render (`page.tsx`, Featured Players block ~lines 511–592):**
- Keep the query unchanged: `players` where `isFeatured` + `status: active`, `limit: 4`, `sort: 'rank'` (rank stays the ordering control).
- Card: keep image + link to `/players/[slug]`. In the image overlay, show `player.name` + `player.role` (replacing `player.country`). Remove the `#{rank} Rank` badge.
- Remove the bottom 2-column **Career Wins / Points** grid entirely.

**Heading default (`HomePage/config.ts` + page fallback):**
- `featuredPlayersSection.title` defaultValue → "Alumni & Professional Network".
- `featuredPlayersSection.description` defaultValue → an APGC-appropriate line (e.g. "Jejaring alumni dan profesional yang menggerakkan komunitas APGC.").
- Update the matching fallback strings in `page.tsx`.

## B. Stats / Impact band (new, editable) — after the Hero

**Schema (`HomePage/config.ts`):** new tab `statsSection` group:
- `label` (text), `title` (text), `description` (text, optional).
- `items` array of `{ value: text, label: text }`. Left empty by default (client fills real numbers).

**Render (`page.tsx`):** a new band immediately after the Hero `</section>`. Renders the items in a responsive row (value large, label small). Section is hidden when `statsSection.items` is empty.

## C. Why Sponsor + CTA (new, editable) — before the Partner Resmi (sponsors) section

**Schema (`HomePage/config.ts`):** new tab `whySponsorSection` group:
- `label` (text), `title` (text), `description` (text).
- `benefits` array of `{ icon: select, title: text, description: textarea }`.
  - `icon` select options: `exposure`, `network`, `impact`, `visibility`.
  - **Default-filled with the client's 4 cards** (editable in admin):
    1. exposure — "Eksposur Premium" / "Tampil di hadapan komunitas profesional, alumni, dan pelaku industri."
    2. network — "Networking Strategis" / "Bertemu langsung dengan pengambil keputusan dan pemimpin bisnis."
    3. impact — "Dampak Sosial" / "Mendukung program pendidikan dan pengembangan generasi masa depan."
    4. visibility — "Brand Visibility" / "Promosi melalui event, media sosial, website, dan materi publikasi."
- `ctaLabel` (text) defaultValue "Unduh Proposal Sponsorship".
- `ctaLink` (text) defaultValue "/sponsors".

**Render (`page.tsx`):** a new section before the Sponsors `<section id="sponsors">`. Title/description + grid of benefit cards (icon mapped to a lucide component) + a prominent CTA button linking to `ctaLink`. Section hides if `benefits` is empty.

Icon mapping (lucide): exposure → `Sparkles`/`Eye`, network → `Users`, impact → `HeartHandshake`, visibility → `Megaphone`.

## Final homepage order

Hero → **Impact band** → Event Schedule → **Why Sponsor** → Partner Resmi (sponsors) → Alumni & Professional Network → News

## Verification

- Run `bun run generate:types` after schema edits.
- Run the project typecheck/build to confirm green.
- Confirm new admin tabs render and the homepage compiles with empty stats (sections hidden) and default why-sponsor cards (visible).

## Out of scope

All content/data entry (handled in admin by the client); event date (already fixed); hero copy rewrite; news content; sponsor logos.
