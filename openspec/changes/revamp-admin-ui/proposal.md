# Change: Revamp Admin UI to Match cms-latest Design

## Why

The current Payload CMS admin panel uses default styling. We need a custom-branded admin experience matching the cms-latest design with a dark sidebar, orange accents, dashboard metrics, custom navigation, and improved UX across all admin views.

## What Changes

- **BREAKING**: Complete visual overhaul of admin panel (users will see different UI)
- Custom sidebar navigation with dark theme (#171046) and orange accents (#ed5f24)
- Top header with breadcrumbs, global search, notifications dropdown, user menu
- Dashboard with real-time metrics (players, events, registrations, sponsors counts)
- Real notifications system showing new registrations and form submissions
- Custom list views for all collections with search, filters, column controls
- Custom create/edit forms matching cms-latest styling
- New Tickets section with list view and integration with check-in functionality
- Quick actions on dashboard including check-in scanner access

## Impact

- Affected specs: `admin-ui` (new capability)
- Affected code:
  - `src/payload.config.ts` - Admin component configuration
  - `src/components/` - New admin components directory
  - `src/app/(payload)/` - Custom admin routes and styles
  - `src/collections/` - Custom admin views per collection

## Reference

- Target design: `/Users/engelbertavania/Documents/freelance/cms-latest/extracted_cms/`
- Payload custom components docs: https://payloadcms.com/docs/custom-components/overview

## Design Decisions

1. Use Payload's component override system (not replace entire admin)
2. Leverage existing shadcn/ui components already in project
3. Fetch real data from Payload collections for dashboard metrics
4. Integrate existing check-in page into Tickets workflow
5. Use CSS variables for theming to match cms-latest color scheme
