# Design: Admin UI Revamp

## Context

The APGC Golf admin panel currently uses Payload CMS's default admin UI. This revamp will customize the admin experience to match the cms-latest design while maintaining Payload's data management capabilities.

### Stakeholders

- Admin users (content managers, event coordinators)
- Developers maintaining the codebase

### Constraints

- Must work with Payload CMS 3.64.0
- Must not break existing functionality (collections, APIs, check-in)
- Must use existing shadcn/ui components where possible
- Real data from collections for dashboard metrics

## Goals / Non-Goals

### Goals

- Match cms-latest visual design (sidebar, header, dashboard, lists, forms)
- Provide real-time dashboard metrics from Payload collections
- Implement working notifications for registrations and form submissions
- Create cohesive admin experience across all sections
- Integrate Tickets section with check-in functionality

### Non-Goals

- Changing Payload's underlying data structures
- Modifying frontend website design
- Implementing dark mode (light mode only per cms-latest)
- Adding new collections (only UI changes)

## Technical Approach

### Payload Component Overrides

Payload 3.x supports extensive component customization via `admin.components`:

```typescript
// payload.config.ts
admin: {
  components: {
    // Global layout components
    Nav: '@/components/admin/Nav',
    Header: '@/components/admin/Header',
    beforeDashboard: ['@/components/admin/Dashboard'],
    beforeLogin: ['@/components/admin/BeforeLogin'],

    // Per-collection views
    views: {
      // Custom list views, edit views
    }
  }
}
```

### Component Architecture

```
src/components/admin/
├── layout/
│   ├── Sidebar.tsx           # Dark sidebar with navigation
│   ├── Header.tsx            # Top bar with breadcrumbs, search, notifications
│   └── CMSLayout.tsx         # Main layout wrapper
├── dashboard/
│   ├── Dashboard.tsx         # Main dashboard page
│   ├── DashboardMetrics.tsx  # Metrics cards (4 columns)
│   ├── RecentActivity.tsx    # Activity feed
│   ├── QuickActions.tsx      # Quick action buttons
│   └── NotificationsPopover.tsx
├── collections/
│   ├── PlayersList.tsx
│   ├── EventsList.tsx
│   ├── NewsList.tsx
│   ├── SponsorsList.tsx
│   ├── TicketsList.tsx       # New tickets view
│   ├── EventRegistrationsList.tsx
│   ├── SponsorRegistrationsList.tsx
│   └── ... (other collections)
├── editors/
│   ├── CreatePlayer.tsx
│   ├── CreateEvent.tsx
│   └── ... (create/edit forms)
├── globals/
│   ├── HeaderConfig.tsx
│   └── FooterConfig.tsx
└── ui/                       # Admin-specific UI components
    ├── AdminTable.tsx
    ├── AdminCard.tsx
    └── SearchBar.tsx
```

### Styling Strategy

1. **CSS Variables** - Define theme in `admin-theme.css`:

```css
:root {
  --admin-background: #f6f7fb;
  --admin-foreground: #171046;
  --admin-primary: #ed5f24;
  --admin-sidebar: #171046;
  --admin-card: #ffffff;
  --admin-border: rgba(23, 16, 70, 0.1);
  --admin-muted: #717182;
}
```

2. **Tailwind Classes** - Extend tailwind.config.js with admin colors

3. **SCSS Override** - Use `custom.scss` for Payload-specific overrides

### Data Fetching

Dashboard metrics will use Payload's Local API:

```typescript
// Server component
const getMetrics = async () => {
  const payload = await getPayload()

  const [players, events, registrations, sponsors] = await Promise.all([
    payload.count({ collection: 'players' }),
    payload.find({ collection: 'events', where: { date: { greater_than: new Date() } } }),
    payload.count({ collection: 'event-registrations', where: { status: { equals: 'pending' } } }),
    payload.count({ collection: 'sponsors' }),
  ])

  return { players, events, registrations, sponsors }
}
```

### Notifications System

Real-time notifications from:

- New event registrations (last 24h)
- New sponsor registrations (last 24h)
- Form submissions (last 24h)

Stored in memory/session, refreshed on page load.

### Tickets Integration

Tickets section will:

1. Show list of all tickets with status, event, attendee
2. Link to check-in page from quick actions
3. Allow status updates (cancel, mark checked-in)
4. Show QR code preview

## Decisions

### Decision 1: Component Override vs Full Custom Admin

**Choice**: Component Override
**Rationale**:

- Maintains Payload's built-in features (auth, permissions, API)
- Less maintenance burden
- Can progressively customize
- Alternatives: Full custom admin (too much work), Custom dashboard only (incomplete)

### Decision 2: Server vs Client Components

**Choice**: Hybrid approach

- Server components for data fetching (Dashboard, Lists)
- Client components for interactivity (Search, Notifications, Modals)
  **Rationale**: Optimal performance while maintaining interactivity

### Decision 3: Styling Approach

**Choice**: CSS Variables + Tailwind + SCSS
**Rationale**:

- CSS variables for theme consistency
- Tailwind for rapid development
- SCSS for Payload-specific overrides (required by Payload)

## Risks / Trade-offs

| Risk                                             | Mitigation                                               |
| ------------------------------------------------ | -------------------------------------------------------- |
| Payload version upgrade breaks custom components | Pin Payload version, test before upgrading               |
| Performance impact from real-time metrics        | Use caching, limit query frequency                       |
| Complex state management for notifications       | Keep state simple, use React Context                     |
| Custom list views lose Payload features          | Extend Payload's list components, don't replace entirely |

## Migration Plan

### Phase 1: Foundation

1. Set up admin theme CSS variables
2. Create layout components (Sidebar, Header)
3. Implement Dashboard with metrics

### Phase 2: Navigation & Collections

4. Configure Payload to use custom components
5. Implement custom list views
6. Add Tickets section

### Phase 3: Polish

7. Implement notifications system
8. Add quick actions
9. Style create/edit forms
10. Testing and refinement

### Rollback

- All changes are additive (new components)
- Original Payload admin can be restored by reverting payload.config.ts
- No database changes required

## Open Questions

1. Should notifications persist across sessions (database) or be session-only?
   - **Answer**: Session-only for now, simpler implementation
2. Should we add real-time updates (WebSocket) for notifications?
   - **Answer**: No, refresh on page load is sufficient for MVP
