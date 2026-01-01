# Design: Event Ticketing System

## Context

APGC Golf needs a complete ticketing workflow from registration to event check-in. The system integrates with Xendit (Indonesian payment gateway) for processing and Resend for transactional emails. The admin dashboard requires a QR scanner for on-site check-in.

### Stakeholders
- **Event Attendees**: Register, pay, receive tickets, check-in at events
- **Event Admins**: Monitor registrations, payments, and check-in attendees
- **System**: Handle webhooks, generate PDFs, send emails

### Constraints
- Xendit API keys already configured in `.env` (`XENDIT_SECRET_KEY`, `XENDIT_PUBLIC_KEY`, `XENDIT_BASE64`)
- Must work with existing Payload CMS patterns and Local API
- Database: PostgreSQL via Supabase (with pgbouncer connection pooling)
- ORM: Payload CMS built-in database layer (no Prisma/Drizzle)
- Online-only scanner (no offline support)
- 24-hour payment expiry window (configured via session expiry)

## Goals / Non-Goals

### Goals
- Seamless payment flow using Xendit Payment Session API
- Unique QR ticket per registration (fraud prevention)
- PDF ticket with inline email for mobile convenience
- Real-time check-in with duplicate scan prevention
- Admin visibility into payment and check-in status

### Non-Goals
- Offline check-in support (requires complex sync logic)
- Partial payments or installments
- Refund processing (out of scope for v1)
- Bulk ticket purchase (each registration = 1 ticket)
- Ticket transfer between attendees

## Decisions

### 1. Payment Gateway: Xendit Payment Session API

**Decision**: Use Xendit Payment Session API with `PAYMENT_LINK` mode

**Rationale**:
- Payment Session is Xendit's all-in-one solution with hosted checkout page
- Low-code integration with `session_type: PAY` for one-time payments
- Supports all payment methods (VA, cards, e-wallets, QRIS, retail) via hosted page
- Built-in expiry handling (default 30 min, configurable up to 24 hours)
- Session webhook provides payment outcome asynchronously
- Simpler than integrating each payment method separately

**API Endpoint**: `POST https://api.xendit.co/payment_sessions`

**Flow**:
```
User submits form → Create Xendit Session (session_type: PAY, mode: PAYMENT_LINK) →
Redirect to session checkout_url → User pays → Xendit session webhook →
Update registration → Generate ticket → Send email
```

**Key Session Parameters**:
- `session_type`: `PAY` (one-time payment)
- `mode`: `PAYMENT_LINK` (redirect to Xendit hosted checkout)
- `country`: `ID` (Indonesia)
- `currency`: `IDR`
- `amount`: Event price (with alumni discount if applicable)
- `success_return_url`: Redirect after successful payment
- `failure_return_url`: Redirect after failed/cancelled payment

### 2. QR Code Strategy: Unique Token per Ticket

**Decision**: Generate UUID-based ticket code, encode as QR

**Rationale**:
- Simple UUID is sufficient (no cryptographic signing needed for this use case)
- QR contains ticket ID, scanner validates against database
- Prevents ticket sharing (single-scan invalidation)

**Format**: `APGC-{ticketId}-{shortHash}` (e.g., `APGC-abc123-x7k9`)

### 3. Email Delivery: Resend with React Email

**Decision**: Use Resend with React Email templates

**Rationale**:
- Developer-friendly API, good deliverability
- React Email allows component-based templates matching site design
- Supports attachments (PDF ticket) and inline images (QR code)

### 4. PDF Generation: @react-pdf/renderer

**Decision**: Use `@react-pdf/renderer` for server-side PDF generation

**Rationale**:
- React-based, consistent with project patterns
- Full layout control for ticket design
- Generates on-demand, no storage needed (can cache if performance is an issue)

### 5. Scanner Implementation: html5-qrcode

**Decision**: Use `html5-qrcode` library for browser-based scanning

**Rationale**:
- Works on laptop/mobile browsers without native app
- Accesses device camera via WebRTC
- Lightweight, well-maintained library
- No need for native mobile app development

### 6. Check-in State Machine

**Decision**: Simple single-scan validation

**States**:
- `pending` - Ticket generated, not yet scanned
- `checked_in` - Successfully scanned once
- Re-scan of `checked_in` ticket shows "Already checked in" error

**Rationale**:
- Simplest model that prevents ticket sharing
- No need for entry/exit tracking for golf events

## Data Model

### Tickets Collection (Payload CMS)

```typescript
// src/collections/Tickets/index.ts
import type { CollectionConfig } from 'payload'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    defaultColumns: ['ticketCode', 'registration', 'event', 'status', 'checkedInAt'],
    useAsTitle: 'ticketCode',
    group: 'Registrations',
  },
  fields: [
    { name: 'ticketCode', type: 'text', unique: true, required: true },
    { name: 'registration', type: 'relationship', relationTo: 'event-registrations', required: true },
    { name: 'event', type: 'relationship', relationTo: 'events', required: true },
    { name: 'qrCodeData', type: 'text' }, // Base64 QR data URL
    { name: 'status', type: 'select', defaultValue: 'pending', options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Checked In', value: 'checked_in' },
      { label: 'Cancelled', value: 'cancelled' },
    ]},
    { name: 'checkedInAt', type: 'date' },
    { name: 'checkedInBy', type: 'relationship', relationTo: 'users' },
  ],
}
```

### EventRegistrations Modifications

```typescript
// Add to src/collections/EventRegistrations/index.ts fields array:
{
  name: 'paymentStatus',
  type: 'select',
  defaultValue: 'unpaid',
  options: [
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Expired', value: 'expired' },
    { label: 'Failed', value: 'failed' },
  ],
},
{ name: 'xenditSessionId', type: 'text' },
{ name: 'xenditCheckoutUrl', type: 'text' },
{ name: 'paidAt', type: 'date' },
{ name: 'amountPaid', type: 'number' },
{ name: 'ticket', type: 'relationship', relationTo: 'tickets' },
```

## Database Operations (Payload Local API)

All database operations use Payload's Local API, not raw SQL or external ORM:

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

// Create ticket
const payload = await getPayload({ config })
const ticket = await payload.create({
  collection: 'tickets',
  data: {
    ticketCode: 'APGC-abc123-x7k9',
    registration: registrationId,
    event: eventId,
    qrCodeData: base64QrCode,
    status: 'pending',
  },
})

// Update registration
await payload.update({
  collection: 'event-registrations',
  id: registrationId,
  data: {
    paymentStatus: 'paid',
    paidAt: new Date().toISOString(),
    ticket: ticket.id,
  },
})

// Find by field
const existingTicket = await payload.find({
  collection: 'tickets',
  where: { ticketCode: { equals: scannedCode } },
})
```

## API Routes

Custom API routes are placed in `src/app/(payload)/api/` alongside Payload's auto-generated routes.

| Route | File Location | Method | Purpose |
|-------|---------------|--------|---------|
| `/api/payments/create-session` | `src/app/(payload)/api/payments/create-session/route.ts` | POST | Create Xendit Payment Session, return checkout URL |
| `/api/payments/webhook` | `src/app/(payload)/api/payments/webhook/route.ts` | POST | Receive Xendit session webhook notifications |
| `/api/tickets/[id]/pdf` | `src/app/(payload)/api/tickets/[id]/pdf/route.ts` | GET | Generate and return ticket PDF |
| `/api/check-in/validate` | `src/app/(payload)/api/check-in/validate/route.ts` | POST | Validate QR code, mark as checked in |

**Note**: Payload's REST API for collections is auto-generated at `/api/[collection-slug]` (e.g., `/api/tickets`, `/api/event-registrations`). Custom routes above are for specialized logic not covered by CRUD.

## Webhook Security

Xendit webhooks are verified using:
1. Callback token in header (`x-callback-token`)
2. Compare against `XENDIT_WEBHOOK_TOKEN` env var

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Webhook delivery failure | Xendit retries; add manual "resend ticket" in admin |
| PDF generation slow | Generate async, cache in Tickets collection if needed |
| Camera permissions denied | Show clear error with instructions |
| Duplicate webhook calls | Idempotent handler (check if already processed) |
| Scanner browser compatibility | Test Chrome/Safari/Firefox; fallback to manual entry |

## Migration Plan

1. Deploy new collections and API routes
2. Add environment variables (`XENDIT_WEBHOOK_TOKEN`, `RESEND_API_KEY`)
3. Configure Xendit webhook URL in Xendit dashboard
4. Update registration form to use new payment flow
5. Existing registrations remain unchanged (no backfill needed)

## Open Questions

1. **Ticket PDF design**: Should match APGC branding - needs design assets
2. **Email template**: Confirm brand colors and logo for email template
3. **Check-in page URL**: Suggest `/admin/check-in` - confirm with stakeholders
4. **Multiple events same day**: Scanner should filter by selected event
