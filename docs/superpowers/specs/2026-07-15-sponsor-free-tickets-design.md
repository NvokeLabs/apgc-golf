# Sponsor Free Tickets — Design

**Date:** 2026-07-15
**Status:** Approved

## Problem

Sponsors receive complimentary event tickets as part of their sponsorship package. Today the only way to get a ticket is the public registration flow: register → pay by bank transfer → upload payment proof → staff approves at `/admin/manual-transfers` → ticket issued.

Sponsors pay nothing, so there is no transfer and no proof to upload. Staff currently have no way to hand a sponsor's guest a ticket.

## Goal

Let an admin or registration staff member issue a ticket directly from the admin panel, choosing a **sponsor** instead of uploading a payment proof. The guest receives the same ticket email, PDF, and QR code as a paying registrant, and checks in through the same scanner.

Ticket allowance is informally tied to sponsorship tier, but **no quota is enforced** — the number of tickets a sponsor gets is a business conversation, not a system rule.

## Non-Goals

- Enforcing or configuring a per-tier ticket quota.
- Per-ticket "don't send email" toggle.
- Bulk / CSV issuance.
- Any change to the paid registration flow, the Xendit webhook, or check-in.

## Design

### 1. Data model

A sponsor ticket is a **normal `EventRegistration`** with a sponsor attached and payment already settled. This reuses every downstream system unchanged: `issueTicketForRegistration` (QR + PDF + email), the Tickets collection, the check-in scanner, the admin dashboard counts, and the registration list views — all of which read `registration.playerName` / `registration.event`.

Two schema additions to `src/collections/EventRegistrations/index.ts`:

| change | detail |
|---|---|
| `paymentMethod` | add option `sponsor` (existing: `bank-transfer`, `credit-card`, `cash`) |
| `sponsor` | **new** `relationship` → `sponsors`, optional, sidebar, `admin.condition: (data) => data?.paymentMethod === 'sponsor'` |

Both require a schema push (`bun run dev`) before `bun run build` — a new `sponsor_id` column and a new `payment_method` enum value. See memory note `db-schema-push`.

Field values written on issuance:

| field | value | why |
|---|---|---|
| `paymentMethod` | `sponsor` | distinguishes the free path |
| `paymentStatus` | `paid` | nothing is owed; keeps `ticket` issuance preconditions consistent with the paid path |
| `status` | `confirmed` | same as an approved transfer |
| `amountDue`, `amountPaid` | `0` | free |
| `paidAt`, `verifiedAt` | now | audit trail |
| `verifiedBy` | issuing admin / staff user | who handed out the ticket |
| `sponsor` | selected sponsor | the point of the feature |
| `transferProof` | null | never uploaded |
| `agreedToTerms` | `true` | required field; admin issues on the guest's behalf |
| `xenditSessionId`, `xenditCheckoutUrl` | null | no payment session |

No upload token is minted — there is nothing for the guest to upload.

### 2. Issuance utility

`src/utilities/registration/issueSponsorRegistration.ts`

Collapses `issueManualRegistration` (create the registration) and `approveTransfer` (mark paid, issue ticket) into a single step. Same dependency-injection shape as the existing utilities so it is testable without booting Payload against a real DB:

```ts
type SponsorTicketDeps = {
  payload: Pick<Payload, 'create'>
  issueTicket: (payload: Payload, registrationId: number) => Promise<IssueTicketResult>
  now?: () => number
}

type SponsorTicketInput = {
  eventId: number
  sponsorId: number
  playerName: string
  email: string
  phone?: string
  tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL'
  category: 'general' | 'alumni'
  alumniClassYear?: number
  alumniMajor?: string
  notes?: string
  issuedById: number
}

issueSponsorRegistration(deps: SponsorTicketDeps, input: SponsorTicketInput)
```

(Payload IDs in this codebase are `number`, matching `approveTransfer` / `issueManualRegistration`.)

Behaviour:

1. Validate required input (`eventId`, `sponsorId`, `playerName`, `email`, `tshirtSize`, `category`); throw on missing.
2. `payload.create({ collection: 'event-registrations', data: { ...values from the table above } })`.
3. `issueTicket(payload, registration.id)` — in production this is `issueTicketForRegistration`, which generates the ticket code and QR, renders the PDF, sends it via Resend, and persists `ticketEmailSent`. It never throws on email or PDF failure, so a mail outage still leaves a valid, scannable ticket.
4. Return `{ registrationId, ticketId, ticketCode }`.

The guest's email is identical to the paid path — no separate template.

### 3. API route

`src/app/(payload)/api/sponsor-tickets/route.ts` — `POST`

- `payload.auth(...)`; 401 if there is no user.
- Both `admin` and `registration-staff` may issue. Staff already run `/admin/manual-transfers` and `/admin/check-in`, so this is within their existing remit; no role check beyond "authenticated".
- Parses and validates the body, calls `issueSponsorRegistration`, returns `{ registrationId, ticketId, ticketCode }`.
- `revalidatePath('/events')` on success, matching `manual-transfers/approve`.

Server-side validation is authoritative — `tshirtSize` is intentionally not `required` in the DB (existing convention), so the route enforces it.

### 4. Admin view

`src/components/admin/SponsorTicketsView/` registered in `src/payload.config.ts` under `admin.components.views` at path `/sponsor-tickets`, alongside the existing `ManualTransfersView` and `CheckInView`.

Form fields: event, sponsor, player name, email, phone, t-shirt size, category, and the alumni fields (class year, major) shown only when category is `alumni` — the same conditional rule the public form uses.

The sponsor picker lists active sponsors with their tier name and an **"N tickets issued"** count, fetched from the existing REST endpoint:

```
/api/event-registrations?where[sponsor][equals]=<id>&limit=0
```

The count is **informational only**. It never blocks submission and there is no quota field on `SponsorshipTiers`.

Nav: add `/admin/sponsor-tickets` to `REGISTRATION_STAFF_ALLOWED_HREFS` in `src/components/admin/Nav/visibleMenuGroups.ts` so staff can see the entry.

### 5. Error handling

- Missing or invalid field → 400 with the offending field named; nothing is written.
- Unauthenticated → 401.
- Ticket email or PDF failure → registration and ticket still exist and are scannable (`issueTicketForRegistration` swallows these by design); the admin sees a success state noting the email may not have sent, and can re-download the PDF from `/api/tickets/[id]/pdf`.
- Registration create failure → the error propagates; no orphan ticket is possible because the ticket is created after the registration.

## Testing

TDD — failing test first for each unit.

`tests/int/sponsor-ticket.int.spec.ts` (new), covering `issueSponsorRegistration` with a stubbed `payload` and a stubbed `issueTicket`:

1. Writes a registration with `paymentMethod: 'sponsor'`, `paymentStatus: 'paid'`, `status: 'confirmed'`, `amountDue: 0`, `amountPaid: 0`, the selected `sponsor`, and `verifiedBy` set to the issuing user.
2. Never sets `transferProof`, `xenditSessionId`, or `xenditCheckoutUrl`.
3. Calls `issueTicket` exactly once, with the new registration's id.
4. Passes alumni fields (`alumniClassYear`, `alumniMajor`) through when `category === 'alumni'`.
5. Rejects missing `sponsorId` / `eventId` / `playerName` / `email` / `tshirtSize` without creating anything.

`tests/int/visible-menu-groups.int.spec.ts` (existing) — extended: registration staff see `/admin/sponsor-tickets`.

Run with `bun run test:int`.

## Deliberate simplifications

- **No quota enforcement.** The user explicitly said the allowance is tier-dependent but the system does not need to know the number. A count is displayed; nothing is blocked. Add a `ticketQuota` field on `SponsorshipTiers` only if a sponsor actually overdraws.
- **No new collection.** Reusing `EventRegistrations` keeps one check-in path, one PDF path, one email path.
- **No collection hook.** Issuance stays in an explicit route, so a routine edit or re-save of a registration can never mint a second ticket.
