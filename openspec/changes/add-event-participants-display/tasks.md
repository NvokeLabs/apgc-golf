# Tasks: Display Event Participants

## 1. Data Layer

- [x] 1.1 Create `getEventParticipants` utility function to query paid registrations for an event
- [x] 1.2 Update event detail page to fetch participants data

## 2. UI Components

- [x] 2.1 Install shadcn Tabs component
- [x] 2.2 Create `EventDetailsTabs` component for tabbed layout
- [x] 2.3 Create `ParticipantsList` component with vertical layout
- [x] 2.4 Add pagination controls to ParticipantsList

## 3. Event Details Page Integration

- [x] 3.1 Refactor event page to use tabbed layout
- [x] 3.2 Move existing content (description, schedule, pairings, gallery) to Details tab
- [x] 3.3 Add participants list to Participants tab
- [x] 3.4 Add participant count badge in hero section
- [x] 3.5 Add participant count badge on Participants tab
- [x] 3.6 Handle empty state (show message when no participants)

## 4. Testing & Validation

- [ ] 4.1 Test with event having paid registrations
- [ ] 4.2 Test empty state with event having no paid registrations
- [ ] 4.3 Test pagination with large number of participants (20+)
- [ ] 4.4 Verify mobile responsiveness
- [ ] 4.5 Test tab switching functionality
