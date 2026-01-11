# Tasks: Admin UI Revamp

## Phase 1: Foundation (COMPLETED)

### 1. Foundation Setup

- [x] 1.1 Create admin theme SCSS file with color variables matching cms-latest (`src/app/(payload)/custom.scss`)
- [x] 1.2 Add Radix UI packages to package.json (accordion, popover, dropdown-menu, scroll-area, separator)
- [x] 1.3 Create admin UI utility components (Accordion, Popover, DropdownMenu, ScrollArea, Table, Badge, Separator)
- [x] 1.4 Set up admin component directory structure

### 2. Dashboard (Using Payload's beforeDashboard)

- [x] 2.1 Create Dashboard API endpoint (`/api/admin/dashboard`) with real data fetching
- [x] 2.2 Create BeforeDashboard component with metrics, activity feed, quick actions
- [x] 2.3 Add loading states and error handling
- [x] 2.4 Include Check-In Scanner in quick actions

### 3. Login Page

- [x] 3.1 Create BeforeLogin component with branded design (APGC logo, welcome text)

### 4. Payload Configuration

- [x] 4.1 Update payload.config.ts with admin meta (title, description, favicon)
- [x] 4.2 Verify beforeDashboard and beforeLogin components are registered
- [x] 4.3 Verify collection groups are properly configured

## Phase 2: Styling via SCSS (COMPLETED)

The SCSS file (`src/app/(payload)/custom.scss`) includes:

- [x] Color variables matching cms-latest (#ed5f24 primary, #171046 sidebar, #F6F7FB background)
- [x] Sidebar styling (dark theme, orange accents, active indicators)
- [x] Navigation link styles with hover/active states
- [x] Card and panel styling
- [x] Button styling (primary orange)
- [x] Form field styling with focus states
- [x] Table/list view styling
- [x] Status badge styling
- [x] Dashboard component styles (metrics, activity feed, quick actions)
- [x] Login page styling
- [x] Scrollbar customization
- [x] Animations (fadeIn)

## Phase 3: Tickets Section (COMPLETED)

### 5. Tickets Enhancement

- [x] 5.1 Create TicketsBeforeList component with info and quick action
- [x] 5.2 Add "Open Check-In Scanner" button to Tickets list
- [x] 5.3 Register component in Tickets collection config
- [x] 5.4 Add collection description

## Phase 4: To Be Tested

### Testing Checklist

- [ ] Run `pnpm install` to install new Radix UI packages
- [ ] Run `pnpm dev` and navigate to `/admin`
- [ ] Verify login page shows APGC branding
- [ ] Verify dashboard shows metrics cards with real data
- [ ] Verify activity feed shows recent registrations
- [ ] Verify quick actions navigate correctly
- [ ] Verify sidebar has dark theme with orange accents
- [ ] Verify all collection CRUD operations work
- [ ] Verify Tickets section shows info header and scanner button
- [ ] Verify Check-In Scanner is accessible from dashboard and Tickets

## Files Created/Modified

### New Files

- `src/app/(payload)/api/admin/dashboard/route.ts` - Dashboard data API
- `src/components/ui/accordion.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/separator.tsx`
- `src/components/admin/TicketsBeforeList.tsx` - Tickets list header with scanner button
- `src/components/admin/collections/TicketsList.tsx` - Custom tickets list component (optional use)
- `src/components/admin/views/TicketsListView.tsx` - Tickets view wrapper (optional use)

### Modified Files

- `src/app/(payload)/custom.scss` - Complete rewrite with cms-latest theme
- `src/components/BeforeDashboard/index.tsx` - New dashboard with metrics
- `src/components/BeforeDashboard/index.scss` - Updated styles
- `src/components/BeforeLogin/index.tsx` - Branded login
- `src/payload.config.ts` - Added admin meta
- `src/collections/Tickets/index.ts` - Added beforeList component
- `package.json` - Added Radix UI packages

## Notes

### Approach Used

We used Payload's officially supported customization methods:

1. **beforeDashboard** - Inject custom dashboard above Payload's default
2. **beforeLogin** - Add branding to login page
3. **beforeList** - Add helpful header to Tickets collection
4. **Custom SCSS** - Override Payload's default styles
5. **Admin Meta** - Custom title, description, favicon

This approach:

- Keeps Payload's proven navigation, forms, and list views
- Adds custom dashboard with real metrics
- Enhances Tickets section with quick access to scanner
- Styles everything to match cms-latest via SCSS
- Lower risk of breaking existing functionality

### What We Did NOT Do (by design)

- Did not replace Payload's Nav component entirely (too risky)
- Did not replace entire list views (Payload's work fine, just styled them)
- Did not create custom edit forms (Payload's work fine)
- Did not add custom notifications system (can be added later)

### Check-In Scanner Access Points

The Check-In Scanner (`/admin/check-in`) is now accessible from:

1. Dashboard Quick Actions
2. Tickets section header button
