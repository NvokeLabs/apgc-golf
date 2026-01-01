# Email Notifications Capability

## ADDED Requirements

### Requirement: Ticket Confirmation Email

The system SHALL send a confirmation email with ticket upon successful payment.

The email MUST be sent via Resend and include:
- Event name, date, time, and location
- Attendee name and registration category
- Inline QR code image (for mobile viewing)
- PDF ticket attachment (for printing)
- Clear instructions for event check-in

#### Scenario: Email sent after payment confirmation
- **WHEN** a Xendit payment webhook confirms successful payment
- **AND** a ticket has been generated
- **THEN** an email is sent to the registrant's email address
- **AND** the email includes the PDF ticket as an attachment
- **AND** the email includes an inline QR code image

#### Scenario: Email contains all required information
- **WHEN** a ticket confirmation email is sent
- **THEN** the subject MUST include the event name
- **AND** the body MUST include attendee name, event details, and check-in instructions
- **AND** the QR code MUST be visible without downloading the attachment

### Requirement: Email Template Design

The system SHALL use a branded React Email template for ticket emails.

The template MUST:
- Include APGC logo and branding colors
- Be responsive for mobile email clients
- Display QR code prominently
- Include a "Download Ticket" section referencing the PDF attachment

#### Scenario: Email renders correctly on mobile
- **WHEN** the email is viewed on a mobile device
- **THEN** the QR code MUST be clearly visible and scannable
- **AND** the layout MUST be single-column and readable

#### Scenario: Email renders correctly on desktop
- **WHEN** the email is viewed on a desktop email client
- **THEN** all content MUST display correctly
- **AND** the PDF attachment MUST be downloadable

### Requirement: Email Service Configuration

The system SHALL use Resend as the email delivery service.

Configuration requirements:
- `RESEND_API_KEY` environment variable
- Sender domain configured in Resend dashboard
- From address: `tickets@{domain}` or `noreply@{domain}`

#### Scenario: Email delivery failure handling
- **WHEN** email delivery fails
- **THEN** the error is logged
- **AND** the ticket remains valid (email failure does not invalidate ticket)
- **AND** admin can manually resend the ticket email

### Requirement: Manual Email Resend

The system SHALL allow admins to manually resend ticket emails.

#### Scenario: Admin resends ticket email
- **WHEN** an admin clicks "Resend Ticket" for a paid registration
- **THEN** the system regenerates and sends the ticket email
- **AND** displays a success confirmation

#### Scenario: Resend not available for unpaid registration
- **WHEN** a registration has `paymentStatus` other than `paid`
- **THEN** the "Resend Ticket" action is not available
