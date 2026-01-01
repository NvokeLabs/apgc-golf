# Check-in Capability

## ADDED Requirements

### Requirement: QR Code Scanner Page

The system SHALL provide an admin page with a camera-based QR code scanner for event check-in.

The scanner page MUST:
- Be accessible at `/admin/check-in`
- Require admin authentication
- Allow selection of the current event
- Display camera feed with QR detection overlay
- Show scan results with attendee information

#### Scenario: Admin accesses scanner page
- **WHEN** an authenticated admin navigates to `/admin/check-in`
- **THEN** the page displays an event selector
- **AND** after selecting an event, the camera scanner activates

#### Scenario: Camera permission requested
- **WHEN** the scanner page loads
- **THEN** the browser requests camera permission
- **AND** if denied, displays instructions for enabling camera access

### Requirement: QR Code Validation API

The system SHALL provide an API endpoint to validate scanned QR codes.

Endpoint: `POST /api/check-in/validate`

Request body:
- `ticketCode` (required)
- `eventId` (required)

Response (success):
- `valid: true`
- `attendee` - Name and category
- `event` - Event name
- `status` - Ticket status after scan

Response (failure):
- `valid: false`
- `reason` - Error message

#### Scenario: Valid ticket scanned for first time
- **WHEN** a valid ticket code is scanned
- **AND** the ticket status is `pending`
- **AND** the ticket belongs to the selected event
- **THEN** the API returns `valid: true`
- **AND** updates ticket status to `checked_in`
- **AND** sets `checkedInAt` to current timestamp
- **AND** sets `checkedInBy` to the scanning admin

#### Scenario: Already checked-in ticket scanned
- **WHEN** a ticket code is scanned
- **AND** the ticket status is already `checked_in`
- **THEN** the API returns `valid: false`
- **AND** `reason: "Already checked in at {timestamp}"`
- **AND** does not modify the ticket

#### Scenario: Invalid ticket code scanned
- **WHEN** an unrecognized ticket code is scanned
- **THEN** the API returns `valid: false`
- **AND** `reason: "Ticket not found"`

#### Scenario: Ticket scanned for wrong event
- **WHEN** a valid ticket code is scanned
- **AND** the ticket belongs to a different event than selected
- **THEN** the API returns `valid: false`
- **AND** `reason: "Ticket is for a different event: {eventName}"`

#### Scenario: Cancelled ticket scanned
- **WHEN** a ticket with status `cancelled` is scanned
- **THEN** the API returns `valid: false`
- **AND** `reason: "Ticket has been cancelled"`

### Requirement: Scanner UI Feedback

The scanner interface SHALL provide clear visual and audio feedback for scan results.

#### Scenario: Successful check-in feedback
- **WHEN** a valid ticket is successfully checked in
- **THEN** the UI displays a green success indicator
- **AND** shows the attendee name prominently
- **AND** plays a success sound (if enabled)
- **AND** auto-resets to scanning mode after 3 seconds

#### Scenario: Failed check-in feedback
- **WHEN** a scan fails validation
- **THEN** the UI displays a red error indicator
- **AND** shows the error reason
- **AND** plays an error sound (if enabled)
- **AND** auto-resets to scanning mode after 3 seconds

### Requirement: Check-in Statistics

The scanner page SHALL display real-time check-in statistics for the selected event.

#### Scenario: Statistics display
- **WHEN** an event is selected in the scanner
- **THEN** the page displays:
  - Total registered (paid) attendees
  - Number checked in
  - Number remaining
  - Percentage checked in

#### Scenario: Statistics update on check-in
- **WHEN** a successful check-in occurs
- **THEN** the statistics update immediately without page refresh

### Requirement: Manual Ticket Entry

The scanner page SHALL provide a fallback manual entry option.

#### Scenario: Manual ticket code entry
- **WHEN** a QR code cannot be scanned
- **THEN** the admin can type the ticket code manually
- **AND** submit it for validation
- **AND** the validation follows the same rules as QR scanning
