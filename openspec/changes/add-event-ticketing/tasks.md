# Tasks: Add Event Ticketing

## 1. Environment & Dependencies

- [x] 1.1 Install dependencies: `xendit-node`, `resend`, `qrcode`, `@react-pdf/renderer`, `html5-qrcode`
- [x] 1.2 Add environment variables to `.env.example`: `XENDIT_WEBHOOK_TOKEN`, `RESEND_API_KEY`
- [x] 1.3 Update `openspec/project.md` with new environment variables

## 2. Database Schema

- [x] 2.1 Create `Tickets` collection in `src/collections/Tickets/index.ts`
  - Fields: ticketCode, registration, event, qrCodeData, status, checkedInAt, checkedInBy
  - Access: authenticated for all operations
  - Admin group: "Registrations"
- [x] 2.2 Modify `EventRegistrations` collection to add payment fields
  - Add: paymentStatus, xenditSessionId, xenditCheckoutUrl, paidAt, amountPaid, ticket
  - Update defaultColumns to include paymentStatus
- [x] 2.3 Register `Tickets` collection in `src/payload.config.ts`
- [x] 2.4 Run `pnpm payload generate:types` to update TypeScript types

## 3. Utility Functions

- [x] 3.1 Create `src/utilities/ticketing/generateTicketCode.ts`
  - Generate unique code in format `APGC-{id}-{hash}`
- [x] 3.2 Create `src/utilities/ticketing/generateQRCode.ts`
  - Generate QR code as base64 data URL using `qrcode` library
- [x] 3.3 Create `src/utilities/xendit/createSession.ts`
  - Wrapper for Xendit Payment Session API with proper typing
  - Configure session_type: PAY, mode: PAYMENT_LINK
- [x] 3.4 Create `src/utilities/xendit/verifyWebhook.ts`
  - Verify callback token from webhook headers
- [x] 3.5 Create `src/utilities/email/sendTicketEmail.ts`
  - Send email via Resend with PDF attachment

## 4. PDF Ticket Generation

- [x] 4.1 Create `src/components/TicketPDF/TicketPDF.tsx`
  - React PDF component with event details, attendee info, QR code
  - Include APGC branding
- [x] 4.2 Create `src/app/(payload)/api/tickets/[id]/pdf/route.ts`
  - GET endpoint to generate and return PDF

## 5. Email Templates

- [x] 5.1 Create `src/utilities/email/sendTicketEmail.ts`
  - Inline HTML email template with QR, event details
  - Responsive design for mobile/desktop
- [x] 5.2 Test email rendering with Resend preview

## 6. Payment Integration

- [x] 6.1 Create `src/app/(payload)/api/payments/create-session/route.ts`
  - POST endpoint to create Xendit Payment Session
  - Configure session_type: PAY, mode: PAYMENT_LINK
  - Set 24-hour expiry, success/failure return URLs
  - Update registration with session details
  - Return checkout URL for redirect
- [x] 6.2 Create `src/app/(payload)/api/payments/webhook/route.ts`
  - POST endpoint for Xendit session webhooks
  - Verify callback token
  - Handle session completed (payment success) and expired events
  - Idempotent handling (check if already processed)
- [x] 6.3 Create ticket generation hook triggered by webhook
  - Generate ticket code and QR
  - Create Tickets record
  - Link to registration

## 7. Registration Flow Update

- [x] 7.1 Modify `EventRegistrationForm.tsx` to redirect to payment
  - After form submit, call create-session API
  - Redirect to Xendit payment page
- [x] 7.2 Create payment success page at `src/app/(frontend)/register/event/[eventSlug]/payment-success/page.tsx`
  - Thank user, explain ticket will arrive via email
- [x] 7.3 Create payment pending/failed page for edge cases

## 8. Admin Check-in Scanner

- [x] 8.1 Create `src/app/(payload)/admin/check-in/page.tsx`
  - Custom admin page with event selector
  - Camera scanner component
  - Results display
- [x] 8.2 Create `src/components/QRScanner/QRScanner.tsx`
  - Client component using `html5-qrcode`
  - Camera feed with overlay
  - Scan result callback
- [x] 8.3 Create `src/app/(payload)/api/check-in/validate/route.ts`
  - POST endpoint to validate ticket code
  - Update ticket status on success
  - Return attendee info or error reason
- [x] 8.4 Implement scanner UI feedback
  - Success/error visual states
  - Optional audio feedback
  - Auto-reset after display
- [x] 8.5 Add check-in statistics component
  - Total, checked in, remaining counts
  - Real-time updates

## 9. Admin UI Enhancements

- [x] 9.1 Add check-in link to admin dashboard
- [ ] 9.2 Add "Resend Ticket" button to registration admin view (future enhancement)
- [ ] 9.3 Add payment status filter to registrations list (built-in with Payload)

## 10. Testing

- [ ] 10.1 Write integration tests for payment webhook handler
  - Test valid payment, expired, invalid token scenarios
- [ ] 10.2 Write integration tests for check-in validation
  - Test valid, already checked-in, wrong event, cancelled scenarios
- [ ] 10.3 Test PDF generation output
- [ ] 10.4 Test email delivery with Resend test mode
- [ ] 10.5 E2E test: full registration → payment → ticket → check-in flow

## 11. Documentation & Deployment

- [ ] 11.1 Document Xendit webhook URL configuration in README
- [ ] 11.2 Document required Resend domain setup
- [ ] 11.3 Add environment variables to production deployment
- [ ] 11.4 Configure Xendit webhook URL in Xendit dashboard
