# Change: Add Event Ticketing System

## Why

Currently, event registration collects attendee information but lacks payment processing and ticket generation. Users register and receive a static success page, but no actual payment is processed, no tickets are issued, and no QR codes are generated for event check-in. This creates manual work for admins to track payments and verify attendees at events.

## What Changes

- **NEW: Tickets Collection** - Store generated tickets with unique QR codes linked to registrations
- **NEW: Xendit Payment Integration** - Create payment sessions via Xendit Session API, handle webhooks for payment confirmation
- **NEW: Email Service (Resend)** - Send ticket emails with PDF attachment and inline QR code upon successful payment
- **NEW: Admin QR Scanner** - Camera-based QR code scanner in admin dashboard for event check-in
- **MODIFIED: EventRegistrations** - Add payment status tracking and ticket relationship
- **MODIFIED: Registration Flow** - Redirect to Xendit payment page after form submission

### Key Features

1. **Payment Flow**: Registration → Xendit Payment Session (24h expiry) → Webhook confirmation → Ticket generation → Email delivery
2. **Ticket Generation**: Unique QR code per ticket, PDF generation with event details, attendee info, and scannable barcode
3. **Check-in System**: Real-time QR scanning, single-scan validation (marks as checked-in, prevents re-entry)
4. **Admin Dashboard**: View all registrations with payment status, filter by paid/unpaid, monitor check-ins

### Payment Methods (via Xendit)

- Virtual Account (Bank Transfer)
- Credit/Debit Cards
- E-wallets (OVO, DANA, GoPay)
- QRIS
- Retail outlets (Alfamart, Indomaret)

## Impact

- **Affected collections**: EventRegistrations (modified), Tickets (new)
- **New API routes**: `/api/payments/create-session`, `/api/payments/webhook`, `/api/tickets/[id]/pdf`, `/api/check-in/validate`
- **New dependencies**: `xendit-node`, `resend`, `qrcode`, `@react-pdf/renderer` or `jspdf`
- **Environment variables**: `XENDIT_SECRET_KEY`, `XENDIT_WEBHOOK_TOKEN`, `RESEND_API_KEY`
- **Admin UI**: New check-in scanner page, updated registration list with payment status
