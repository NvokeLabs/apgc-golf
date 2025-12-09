# Events Capability

## ADDED Requirements

### Requirement: Events Collection
The system SHALL provide an Events collection in Payload CMS for managing golf tournaments and events.

#### Scenario: Create event
- **WHEN** admin creates a new event with title, date, and location
- **THEN** the system creates an event document with auto-generated slug
- **AND** the event appears in the admin panel list

#### Scenario: Event with full details
- **WHEN** admin provides complete event data including schedule, pairings, and sponsors
- **THEN** all nested data is stored and retrievable

### Requirement: Event Fields Schema
The Events collection SHALL include the following fields:
- `title` (required text) - Event name
- `slug` (auto-generated) - URL-friendly identifier
- `date` (date) - Event date
- `endDate` (date, optional) - Multi-day event end date
- `location` (text) - Venue name and location
- `image` (media relationship) - Event cover image
- `tier` (select: Major/Championship/Qualifier) - Event tier level
- `prizeFund` (text) - Prize money description
- `status` (select: Upcoming/Open/Sold Out/Closed) - Registration status
- `price` (number) - Registration fee
- `alumniPrice` (number) - Discounted alumni price
- `description` (rich text) - Event description
- `schedule` (array) - Daily schedule with rounds
- `sponsors` (relationship to Sponsors) - Event sponsors
- `pairings` (array) - Player groupings and tee times
- `gallery` (array of media) - Event photos

#### Scenario: Schedule array structure
- **WHEN** admin adds schedule for Day 1
- **THEN** schedule item includes day label, and array of time/activity/location entries

#### Scenario: Pairings structure
- **WHEN** admin adds pairing group
- **THEN** pairing includes group number, tee time, starting tee, and player names

### Requirement: Events Listing Page
The system SHALL provide a public `/events` page displaying all events.

#### Scenario: View events listing
- **WHEN** visitor navigates to `/events`
- **THEN** the system displays events sorted by date
- **AND** each event card shows title, date, location, tier, and status

#### Scenario: Filter by tier
- **WHEN** visitor filters by "Major" tier
- **THEN** only Major tier events are displayed

#### Scenario: Filter by status
- **WHEN** visitor filters by "Open" status
- **THEN** only events with open registration are displayed

### Requirement: Event Details Page
The system SHALL provide a public `/events/[slug]` page for individual event details.

#### Scenario: View event details
- **WHEN** visitor navigates to `/events/spring-championship`
- **THEN** the system displays full event information
- **AND** shows description, schedule, pairings, sponsors, and gallery

#### Scenario: Event with tabs
- **WHEN** visitor views event with schedule and pairings
- **THEN** content is organized in tabs (Overview, Schedule, Pairings, Sponsors)

#### Scenario: Registration button
- **WHEN** event status is "Open"
- **THEN** registration button links to `/register/event/[slug]`

#### Scenario: Sold out event
- **WHEN** event status is "Sold Out"
- **THEN** registration button is disabled with "Sold Out" label

### Requirement: Homepage Event Section
The system SHALL display upcoming events on the homepage.

#### Scenario: Upcoming events display
- **WHEN** visitor views homepage
- **THEN** the system displays next 3 upcoming events
- **AND** events are sorted by date ascending

#### Scenario: Hero tournament card
- **WHEN** visitor views homepage hero section
- **THEN** the featured/next major event is displayed prominently
- **AND** shows countdown or date, location, and registration CTA

### Requirement: Event Registration
The system SHALL provide event registration functionality at `/register/event/[eventSlug]`.

#### Scenario: Registration form display
- **WHEN** visitor navigates to event registration page
- **THEN** the system displays form with name, email, category, and payment method fields
- **AND** shows event details and pricing

#### Scenario: Alumni pricing
- **WHEN** visitor selects "Alumni" category
- **THEN** the displayed price updates to alumni discounted price

#### Scenario: Submit registration
- **WHEN** visitor submits valid registration form
- **THEN** the system creates EventRegistration document
- **AND** displays confirmation screen with registration details

#### Scenario: Registration validation
- **WHEN** visitor submits form with invalid email
- **THEN** the system displays validation error
- **AND** does not create registration document
