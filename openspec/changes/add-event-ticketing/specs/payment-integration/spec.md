# Payment Integration Capability

## ADDED Requirements

### Requirement: Xendit Payment Session Creation

The system SHALL create a Xendit Payment Session when a user submits an event registration.

The session MUST be configured with:
- `session_type`: `PAY` (one-time payment)
- `mode`: `PAYMENT_LINK` (redirect to Xendit hosted checkout)
- `country`: `ID` (Indonesia)
- `currency`: `IDR`
- `amount`: Event price (with alumni discount if applicable)
- 24-hour expiry window
- All available Xendit payment methods (VA, cards, e-wallets, QRIS, retail)
- `success_return_url`: Redirect URL after successful payment
- `failure_return_url`: Redirect URL after failed/cancelled payment

#### Scenario: Session created for standard registration
- **WHEN** a user submits a registration for an event with price 500000
- **AND** the user is not an alumni
- **THEN** a Xendit Payment Session is created with amount 500000
- **AND** the user is redirected to the Xendit hosted checkout page

#### Scenario: Session created with alumni discount
- **WHEN** a user submits a registration for an event with price 500000 and alumni price 400000
- **AND** the user selects the alumni category
- **THEN** a Xendit Payment Session is created with amount 400000

#### Scenario: Session expiry configuration
- **WHEN** a Xendit Payment Session is created
- **THEN** the session MUST expire after 24 hours
- **AND** expired sessions trigger an `expired` status on the registration

### Requirement: Payment Session API

The system SHALL provide an API endpoint to create payment sessions.

Endpoint: `POST /api/payments/create-session`

Request body:
- `registrationId` (required)

Response:
- `checkoutUrl` - Xendit hosted checkout page URL
- `sessionId` - Xendit session ID for tracking

#### Scenario: Successful payment session creation
- **WHEN** a POST request is made with a valid registration ID
- **THEN** the system creates a Xendit Payment Session
- **AND** updates the registration with `xenditSessionId` and `xenditCheckoutUrl`
- **AND** sets registration `paymentStatus` to `pending`
- **AND** returns the checkout URL for redirect

#### Scenario: Payment session for already paid registration
- **WHEN** a payment session is requested for a registration with `paymentStatus: paid`
- **THEN** the system returns a 400 error with message "Registration already paid"

### Requirement: Xendit Session Webhook Handler

The system SHALL receive and process Xendit session webhook notifications.

Endpoint: `POST /api/payments/webhook`

Supported session events:
- Session completed with successful payment
- Session expired without payment

#### Scenario: Successful payment webhook
- **WHEN** Xendit sends a session webhook indicating successful payment
- **AND** the callback token matches `XENDIT_WEBHOOK_TOKEN`
- **THEN** the system updates the registration `paymentStatus` to `paid`
- **AND** sets `paidAt` to the payment timestamp
- **AND** sets `amountPaid` to the paid amount
- **AND** triggers ticket generation
- **AND** triggers confirmation email

#### Scenario: Expired session webhook
- **WHEN** Xendit sends a session webhook indicating expiry
- **THEN** the system updates the registration `paymentStatus` to `expired`

#### Scenario: Invalid webhook token
- **WHEN** a webhook is received with an invalid `x-callback-token`
- **THEN** the system returns a 401 Unauthorized response
- **AND** does not process the webhook

#### Scenario: Idempotent webhook handling
- **WHEN** the same webhook is received multiple times
- **THEN** the system processes it only once
- **AND** subsequent calls return success without side effects

### Requirement: EventRegistrations Payment Fields

The EventRegistrations collection SHALL be extended with payment tracking fields:
- `paymentStatus` (select: unpaid, pending, paid, expired, failed)
- `xenditSessionId` (text)
- `xenditCheckoutUrl` (text)
- `paidAt` (date)
- `amountPaid` (number)
- `ticket` (relationship to tickets)

#### Scenario: Registration created with unpaid status
- **WHEN** a new registration is created
- **THEN** `paymentStatus` defaults to `unpaid`

#### Scenario: Payment status visible in admin
- **WHEN** an admin views the registrations list
- **THEN** `paymentStatus` is displayed as a column
- **AND** admins can filter by payment status
