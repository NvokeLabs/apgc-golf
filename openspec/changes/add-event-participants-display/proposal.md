# Change: Display Event Participants (Paid Joiners)

## Why

Event organizers and potential attendees want to see who has already registered and paid for an event. This creates social proof, helps build excitement, and allows participants to see who else will be attending. Currently, successful registrations with paid status are stored in the database but not visible to public visitors on the event details page.

## What Changes

- **NEW: Event Details Tabs** - Tabbed interface with "Details" and "Participants" tabs
- **NEW: Participant Count Badge** - Show total number of confirmed participants in hero section and tab
- **NEW: ParticipantsList Component** - Vertical list with pagination for displaying participant names
- **NEW: EventDetailsTabs Component** - Client component for tabbed layout using shadcn Tabs
- **MODIFIED: Event Detail Page** - Refactored to use tabbed layout

### UX Design Decisions

1. **Tabbed Layout**: Two tabs - "Details" (event info, schedule, pairings, gallery) and "Participants" (list of paid registrants)
2. **Privacy**: Display only participant names (no categories, emails, phones, or other PII)
3. **Display Format**:
   - Vertical list with numbered entries
   - 20 participants per page with pagination controls
   - User icon avatar placeholder for each participant
4. **Empty State**: Shows "No participants registered yet" message
5. **Counter Badge**: Participant count shown in hero section and on Participants tab

### Design Consistency

- Uses shadcn `Tabs` component with custom styling
- Uses existing `GlassCard` component for containers
- Follows existing color scheme (#0b3d2e primary, #636364 secondary text)
- Tab styling matches site design (rounded-xl, white/60 background)

## Impact

- **Affected pages**: `src/app/(frontend)/events/[slug]/page.tsx`
- **New components**:
  - `src/components/golf/ParticipantsList.tsx`
  - `src/components/golf/EventDetailsTabs.tsx`
- **New UI dependencies**: `@radix-ui/react-tabs` (via shadcn)
- **No new API routes** - uses existing Payload queries
