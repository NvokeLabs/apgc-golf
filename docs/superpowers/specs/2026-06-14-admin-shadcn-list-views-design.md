# Admin shadcn List Views + Form Polish — Design

**Date:** 2026-06-14
**Goal:** Replace Payload's stock collection LIST views with shadcn list views for all collections, and CSS-polish the native edit/create forms. Light mode only; navy nav kept. Edit forms stay on Payload's form engine (only restyled).

## Approach

Generalize the proven `src/components/admin/collections/TicketsList.tsx` pattern (client component, fetches Payload REST `/api/{slug}?...`, renders shadcn `Table`) into ONE reusable component, then register it per collection.

### Reusable component: `src/components/admin/shadcn/CollectionListView.tsx`
`'use client'`. Props: `config: ListConfig`. Renders inside `<div className="apgc-admin">`.
```
type Column = {
  key: string                       // dot path into the doc
  header: string
  isTitle?: boolean                 // renders as link to /admin/collections/{slug}/{id}
  type?: 'text'|'date'|'badge'|'relationship'
  relationshipLabel?: string        // sub-field to show for a populated relationship (e.g. 'title','name')
  badge?: Record<string,'success'|'warning'|'error'|'default'>  // value→variant map
  accessor?: (doc:any)=>React.ReactNode  // escape hatch
}
type Filter = { field:string; label:string; options:{label:string;value:string}[] }
type ListConfig = {
  slug:string; title:string; description?:string;
  searchField?:string; searchPlaceholder?:string;
  defaultSort?:string; depth?:number;
  columns:Column[]; filters?:Filter[];
}
```
Features (port from TicketsList): header with title/description + "Create New" `Button` (→ `/admin/collections/{slug}/create`) + Refresh; search input (debounced, `where[{searchField}][contains]`); optional `<select>` filters (`where[{field}][equals]`); shadcn `Table` with select-all/row `Checkbox`, clickable sortable headers (toggles `sort`/`-sort` param), title cell links to edit page, `date`→localized, `badge`→`Badge` variant, `relationship`→shows `relationshipLabel` sub-field; pagination (prev/next, "x-y of total"); empty/loading states. Bulk delete: when rows selected, show a destructive `Button` that `DELETE /api/{slug}/{id}` per id after a `confirm()`, then refetch. Use shadcn primitives from `@/components/ui/*`.

### Per-collection wrappers: `src/components/admin/lists/{Name}ListView.tsx`
One thin `'use client'` default-export component each that renders `<CollectionListView config={{…}} />` with that collection's columns (derive from each collection's `admin.defaultColumns` + field types). Register in each collection config:
```
admin: { components: { views: { list: { Component: '@/components/admin/lists/{Name}ListView' } } } }
```

### Collections (all 13)
players, events, news, sponsors, sponsorship-tiers, event-registrations, sponsor-registrations, tickets, pages, posts, categories, users, media.
- **Tickets:** reuse existing TicketsList (already shadcn) — wrap/register it via the new pattern OR leave as-is; don't regress its scanner/edit view.
- **Media:** keep a "Create New" that opens the native upload; add a small thumbnail column (use the file `url`). If a clean table is impractical, leave Media native (note it).
- **Users:** minimal columns (email, role, createdAt) — sensitive; no bulk delete.

### Edit/create form polish (`src/app/(payload)/custom.scss`)
The edit/create views stay native (Payload form engine). Improve their styling: card-like field groups, consistent spacing, rounded inputs, on-brand buttons/tabs, better headers/sticky save bar, readable labels/descriptions. Additive CSS only; no React changes.

## Execution (de-risked)
1. Build `CollectionListView` + wire **sponsor-registrations** (the screenshot) as reference. Build-verify it renders.
2. Roll out wrappers + registration for the remaining collections (parallel subagents by group).
3. CSS-polish edit forms.
4. `bunx tsc --noEmit` + `bun run build` ("✓ Compiled"); restart note for config changes.

## Risks / notes
- REST API uses the admin session cookie (same-origin fetch) — already how TicketsList works.
- Custom list view replaces Payload's built-in filters/columns UI; our search + simple filters cover the common need. Note this tradeoff.
- Config (`views.list`) changes need a dev-server restart to take effect.

## Out of scope
Rebuilding edit forms as shadcn (would reimplement Payload's form engine); schema/data changes; frontend.
