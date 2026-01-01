# Ticketing Capability

## ADDED Requirements

### Requirement: Ticket Generation

The system SHALL generate a unique ticket for each paid event registration.

Each ticket MUST contain:
- Unique ticket code in format `APGC-{id}-{hash}`
- QR code encoding the ticket code
- Reference to the event registration
- Reference to the event
- Ticket status (pending, checked_in, cancelled)

#### Scenario: Ticket created after successful payment
- **WHEN** a Xendit payment webhook confirms successful payment
- **THEN** a new ticket record is created with status `pending`
- **AND** the ticket is linked to the registration and event
- **AND** a unique ticket code is generated

#### Scenario: Ticket code uniqueness
- **WHEN** generating a ticket code
- **THEN** the code MUST be unique across all tickets
- **AND** the format MUST be `APGC-{ticketId}-{shortHash}`

### Requirement: Ticket PDF Generation

The system SHALL generate a downloadable PDF ticket on demand.

The PDF MUST include:
- Event name, date, and location
- Attendee name and category
- QR code (scannable)
- Ticket code (human-readable)
- APGC branding

#### Scenario: PDF download via API
- **WHEN** a GET request is made to `/api/tickets/[id]/pdf`
- **THEN** the system generates a PDF with all ticket details
- **AND** returns it with `Content-Type: application/pdf`
- **AND** sets `Content-Disposition` for download

#### Scenario: PDF requested for non-existent ticket
- **WHEN** a PDF is requested for an invalid ticket ID
- **THEN** the system returns a 404 error

### Requirement: Ticket Collection Schema

The system SHALL store tickets in a Payload CMS collection with the following fields:
- `ticketCode` (text, unique, required)
- `registration` (relationship to event-registrations, required)
- `event` (relationship to events, required)
- `qrCodeData` (text - base64 encoded QR image)
- `status` (select: pending, checked_in, cancelled)
- `checkedInAt` (date)
- `checkedInBy` (relationship to users)

#### Scenario: Ticket record creation
- **WHEN** a ticket is created
- **THEN** all required fields MUST be populated
- **AND** the ticket code MUST be unique

#### Scenario: Ticket status transitions
- **WHEN** a ticket status changes from `pending` to `checked_in`
- **THEN** `checkedInAt` MUST be set to the current timestamp
- **AND** `checkedInBy` MUST reference the admin user who performed the check-in
