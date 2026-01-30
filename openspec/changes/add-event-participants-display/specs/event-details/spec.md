## ADDED Requirements

### Requirement: Event Details Tabbed Layout

The event details page SHALL use a tabbed interface with "Details" and "Participants" tabs.

#### Scenario: Tab navigation

- **WHEN** viewing an event details page
- **THEN** a tab bar is displayed with "Details" and "Participants" tabs
- **AND** the "Details" tab is selected by default
- **AND** clicking a tab shows the corresponding content

#### Scenario: Details tab content

- **WHEN** the "Details" tab is selected
- **THEN** the event description, schedule, pairings, and gallery sections are displayed

#### Scenario: Participants tab content

- **WHEN** the "Participants" tab is selected
- **THEN** the list of paid participants is displayed with pagination

### Requirement: Event Participants Display

The Participants tab SHALL display a vertical list of confirmed (paid) participants.

#### Scenario: Event with paid participants

- **WHEN** the event has registrations with paymentStatus "paid"
- **THEN** participants are displayed in a vertical numbered list
- **AND** each entry shows a user icon and the participant name

#### Scenario: Event with no paid participants

- **WHEN** the event has no registrations with paymentStatus "paid"
- **THEN** a message "No participants registered yet" is displayed

#### Scenario: Privacy protection

- **WHEN** displaying participant information
- **THEN** only the participant name is shown
- **AND** email, phone, category, and other personal information are NOT displayed

### Requirement: Participant Count Badge

The event hero section and Participants tab SHALL display the count of confirmed participants.

#### Scenario: Display participant count in hero

- **WHEN** the event has paid participants
- **THEN** a badge showing the participant count appears in the hero section metadata area
- **AND** the badge uses the Users icon consistent with existing design

#### Scenario: Display participant count on tab

- **WHEN** the event has paid participants
- **THEN** the Participants tab shows a badge with the count next to the tab label

#### Scenario: No participants count

- **WHEN** the event has zero paid participants
- **THEN** the participant count badge is not displayed in the hero section

### Requirement: Participant List Pagination

The participants list SHALL paginate large numbers of participants.

#### Scenario: More than 20 participants

- **WHEN** the event has more than 20 paid participants
- **THEN** 20 participants are displayed per page
- **AND** pagination controls show page numbers and prev/next buttons
- **AND** the current range and total count are displayed (e.g., "Showing 1-20 of 150")

#### Scenario: 20 or fewer participants

- **WHEN** the event has 20 or fewer paid participants
- **THEN** all participants are displayed without pagination controls
