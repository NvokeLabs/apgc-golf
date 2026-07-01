# Product Requirements Document: Manual Bank-Transfer Payment for Event Tickets

**Author:** Rama Guntur Ardana
**Date:** 2026-06-29
**Status:** Draft (revised post pre-mortem)
**Stakeholders:** APGC (product owner), event treasurer/admin, registrants
**Related:** `2026-06-29-manual-transfer-payment-premortem.md` — risk mitigations from it are folded into §5/§6/§8 below.

---

## 1. Executive Summary

Enable golfers to buy event tickets via **manual bank transfer** instead of the (not-yet-approved) Xendit gateway. Registrants see bank-transfer instructions, upload proof of payment, and an admin reviews each transfer from a dedicated dashboard. On approval, the system issues the QR ticket and emails it — reusing the exact ticketing logic the Xendit webhook already runs. This unblocks launch without waiting on Xendit approval.

## 2. Background & Context

The site already has a complete paid-registration flow built on Xendit:

- `createRegistrationWithPayment` (server action) creates an `event-registrations` record, prices by category, and creates a Xendit invoice (`src/app/(frontend)/register/event/[eventSlug]/actions.ts`).
- The Xendit webhook (`src/app/(payload)/api/payments/webhook/route.ts`) marks the registration `paid`, then **generates a ticket code + QR, creates the `tickets` record, links it to the registration, and emails the ticket** via `generateTicketCode` / `generateQRCode` / `sendTicketEmail`.
- `EventRegistrations` already has the scaffolding we need: a `paymentMethod` field (with a `bank-transfer` option), `paymentStatus`, `status`, `amountPaid`, `paidAt`, and a `ticket` relationship.

**The blocker:** Xendit has not approved the account, so the gateway cannot accept live payments. Tickets, QR generation, check-in, and email are all working — only the *payment confirmation trigger* is missing. Manual transfer supplies that trigger via human approval.

**Key insight:** the ticket-issuing block inside the webhook is the reusable core. Extract it into a shared utility and call it from both the webhook (future) and the new admin approval action (now).

## 3. Objectives & Success Metrics

**Goals:**
1. Let a registrant complete a paid registration end-to-end using bank transfer, with no Xendit dependency.
2. Give admins a single dashboard to review pending transfers, see uploaded proof, and approve or reject.
3. On approval, issue and email the QR ticket through the existing ticketing pipeline — identical output to the Xendit path.
4. Support rejection with a reason and let the registrant re-upload corrected proof.

**Non-Goals:**
1. **No Xendit / card / e-wallet at launch** — the form offers manual transfer only; Xendit code stays in the repo but is not user-reachable. (Re-enabling Xendit is a separate future change.)
2. **No automated bank-statement reconciliation** — verification is a human reading the uploaded proof. No bank API integration.
3. **No partial-payment or installment handling** — a transfer is either approved in full or rejected.
4. **No refunds workflow** — out of scope; handled offline if needed.
5. **No per-event bank accounts** — a single site-wide account is used (decision below).

**Success Metrics:**

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Registrations completable without Xendit | 0% | 100% | Manual flow live in prod |
| Median admin time to verify a transfer | n/a (manual/offline) | < 12 hours | `verifiedAt − submittedAt` on approved regs |
| Tickets issued via manual approval that match Xendit-path output (code+QR+email) | n/a | 100% | QA: approved reg always has linked ticket + sent email |
| Proof-upload completion rate (start form → proof uploaded) | n/a | ≥ 80% | funnel: registration created vs proof attached |

## 4. Target Users & Segments

- **Registrants (general + alumni):** Indonesian golfers paying in IDR who are comfortable with bank transfer (the dominant local payment habit). They need crystal-clear transfer instructions and a frictionless proof upload.
- **Admin / event treasurer:** APGC staff who reconcile incoming transfers against the bank account and approve tickets. Needs a fast queue, not a record-by-record hunt.

## 5. User Stories & Requirements

### Decisions locked for this PRD
- **Payment options at launch:** Manual transfer only (Xendit hidden).
- **Transfer details source:** Single site-wide bank account.
- **Admin review surface:** Dedicated dashboard view (like the existing `CheckInView`).
- **Rejection:** Admin can reject with a reason; registrant can re-upload.

**P0 — Must Have**

| # | User Story | Acceptance Criteria |
|---|-----------|---------------------|
| 1 | As a registrant, I register for an event and am shown bank-transfer instructions. | After submitting the form, a registration is created with `paymentMethod = bank-transfer`, `paymentStatus = awaiting-payment`; the confirmation screen shows bank name, account number, account holder, the exact amount (priced by category), and a unique reference (e.g. `reg-{id}`). |
| 2 | As a registrant, I upload proof of my transfer. | A proof upload accepts **JPG/PNG/PDF only, max 10 MB**, stores it via the existing Media/Supabase storage, attaches it to the registration, and moves `paymentStatus → awaiting-verification`. The registrant sees a "pending review" confirmation. (Constraints enforced server-side, not just client-side.) |
| 3 | As an admin, I see a queue of transfers awaiting verification. | A dedicated admin dashboard view lists registrations with `paymentStatus = awaiting-verification`, showing registrant, event, category, **expected amount + `reg-{id}` reference**, submission time, and an inline preview of the proof. Sortable/filterable by event. |
| 4 | As an admin, I approve a transfer. | Approve sets `paymentStatus = paid`, records admin-entered `amountPaid`, `paidAt`, `verifiedBy`, `verifiedAt`, sets `status = confirmed`, then **issues the ticket via the shared ticketing utility** and revalidates the event page. **Idempotency (T2):** the utility short-circuits if the registration already has a linked `ticket` — re-approving or double-clicking never creates a second ticket/email; the Approve button disables after first click. |
| 5 | As an admin, I reject a transfer with a reason. | Reject sets `paymentStatus = rejected`, stores a `rejectionReason`, and emails the registrant a message + a **signed re-upload link** (see story 8). No ticket is issued. |
| 6 | As a registrant whose proof was rejected, I re-upload corrected proof. | The signed re-upload link lets the registrant attach new proof, which returns the registration to `awaiting-verification` and back into the admin queue. |
| 7 | As the system, I reuse one ticketing code path. | The webhook's ticket-issuing block is extracted into a shared `issueTicketForRegistration(registrationId)` utility; both the Xendit webhook and the manual-approval action call it. No duplicated QR/email logic. The utility is **idempotent** (guards on the linked `ticket`, not just `paymentStatus`) and **never lets a failed email block ticket creation** (T6: it records send status instead of throwing). |
| 8 | As the system, I protect the public upload endpoints from tampering (T1). | The proof-upload and re-upload server actions are authenticated by an **unguessable signed token** (HMAC of registration id + a server secret) issued at registration time — never the raw sequential `registrationId`. The action verifies the token and is **field-scoped** to only `transferProof` and the payment status, so a public caller cannot read PII or alter other fields. ID enumeration must not expose or mutate any registration. |
| 9 | As an admin, I'm warned when the paid amount doesn't match (T3). | The approve step requires the admin to enter `amountPaid`; if it differs from the category-priced expected amount, the UI shows a clear mismatch warning before the admin can confirm. Prevents approving wrong/reused/short transfers. |
| 10 | As a registrant, I receive a "complete your payment" email with my upload link. | On manual registration, a Resend email is sent with bank details, exact amount, `reg-{id}` reference, and the **tokenized upload link** (same URL as the on-screen redirect) so I can pay and submit proof later. Send failure is non-fatal — the on-screen confirmation still shows the instructions + link. |

**P1 — Should Have**

| # | User Story | Acceptance Criteria |
|---|-----------|---------------------|
| 10 | As an admin, I configure the bank account in one place. | A global (e.g. a "Payment Settings" group on an existing global like `SiteLabels`) holds bank name, account number, account holder, and optional instruction notes; the registration confirmation reads from it. |
| 11 | As an admin, I'm notified of new pending transfers (T5). | The dashboard/nav shows a pending-count badge, and a notification (email/Slack) fires on each new `awaiting-verification` so the queue isn't neglected and the <12h SLA holds. |
| 12 | As an admin, I can see ticket-email status and resend (T6). | The registration shows a `ticketEmailSent` flag; if sending failed, the admin sees it and can trigger a resend — a `paid` reg never silently lacks a delivered ticket. |
| 13 | As a registrant, I get an email when my proof is received. | An acknowledgement email ("we got your proof, pending review") is sent on upload. |

**P2 — Nice to Have / Future**

| # | User Story | Acceptance Criteria |
|---|-----------|---------------------|
| 14 | Pending transfers expire automatically (T8). | Registrations stuck in `awaiting-payment` past N hours move to `expired` (cron job — pattern already supported via `CRON_SECRET`). |
| 15 | Capacity check at approval (T9). | Approval is blocked or warns when issuing would exceed event capacity (tickets are issued on approval, so seats aren't held during the pending window). |
| 16 | Re-enable Xendit alongside manual transfer. | Behind a config flag; form offers both methods. (Separate change.) |

## 6. Solution Overview

**Data model (EventRegistrations):**
- Extend `paymentStatus` options to include `awaiting-payment`, `awaiting-verification`, and `rejected` (alongside existing `unpaid`/`pending`/`paid`/`expired`/`failed`).
- Add fields: `transferProof` (upload → media), `rejectionReason` (textarea), `verifiedBy` (relationship → users), `verifiedAt` (date). Reuse existing `amountPaid` / `paidAt` / `ticket`.
- ⚠️ **DB note (project-specific):** new fields require Payload **dev auto-push** — run `bun run dev` once before `bun run build`, or prerender fails with `column … does not exist` (see `db-schema-push` memory).

**Registration flow (manual):**
1. Reuse `createRegistrationWithPayment`, but branch on method: for manual transfer, create the registration with `paymentMethod = bank-transfer`, `paymentStatus = awaiting-payment`, **skip the Xendit invoice call**, mint a **signed upload token** (HMAC of reg id + `PAYLOAD_SECRET`/dedicated secret), and return the bank instructions + token instead of a checkout URL.
2. Proof upload (server action) verifies the token, then attaches `transferProof` and sets `awaiting-verification`. The action is **field-scoped** — it can only touch `transferProof` and payment status, never other fields, and never accepts a bare `registrationId` for write/read.

**Public-endpoint security (T1):**
- `event-registrations` is `create: anyone` / `read|update: authenticated`. The public proof/re-upload actions therefore run server-side with elevated access but are guarded by the signed token + field scoping above. ID enumeration must not expose PII or mutate any registration. The token uses a dedicated `UPLOAD_TOKEN_SECRET`, expires at the event date (+buffer), the upload page goes read-only once `paid`, overwrite is allowed only while `awaiting-verification`, and the endpoint is rate-limited (per-token + per-IP).

**Private proof storage (T1/E3):**
- Proofs must **not** use the existing `media` collection — it's configured `disablePayloadAccessControl: true` with public URLs, which would leave financial PII world-readable. Use a dedicated **private** bucket/prefix (access control on); admins view proofs via an **authenticated stream route**, never a public URL.

**Admin approval:**
- New dedicated admin view (registered like `CheckInView` at an admin path, e.g. `/manual-transfers`) backed by a small API route that lists `awaiting-verification` registrations and exposes `approve` / `reject` actions.
- Approve → admin enters `amountPaid` (mismatch-warned, T3) → `issueTicketForRegistration()` (the extracted shared utility). Reject → set `rejected` + send signed re-upload email.

**Shared ticketing utility (T2/T6):**
- Extract lines ~68–128 of the Xendit webhook into `src/utilities/ticketing/issueTicketForRegistration.ts`. **Idempotent on the linked `ticket`** (return existing ticket if present — not merely a `paymentStatus` check), so double-clicks/retries never double-issue. Ticket creation and the email send are separated: a **failed email records status (`ticketEmailSent = false`) instead of throwing**, leaving the reg `paid` with a valid ticket and an admin resend path. Webhook and manual-approval both call it.

**Hiding Xendit:** the registration form renders manual-transfer instructions only; the Xendit server action / webhook remain in the codebase but unreferenced from the UI.

## 7. Open Questions

Resolved by the pre-mortem and folded above: proof constraints (JPG/PNG/PDF, 10 MB — story 2), re-upload link security (signed token — story 8), amount-mismatch handling (story 9).

**Resolved in the grill-me session (2026-06-29)** — see the Phase 1 stories doc:
- Proof storage = **private** bucket/route, not the public `media` collection (story 8 dependency; new Story 0).
- Token secret = **dedicated `UPLOAD_TOKEN_SECRET`**; **TTL = event date + buffer**.
- Upload = **single tokenized page** for initial + re-upload; **read-only after approval**; **overwrite allowed pre-review**; **rate-limited**.
- A **"complete your payment" follow-up email** with the tokenized upload link is in Phase 1 scope (new P0 story).

Remaining:

| Question | Owner | Deadline |
|----------|-------|----------|
| Token TTL buffer — how many days after the event date stays valid? | Product/Eng | Before build |
| Should the payment / acknowledgement / rejection emails reuse the Resend template style of `sendTicketEmail`? | Product/Eng | Before build |
| Is the single bank account fixed enough to hardcode initially, or build the global (P1 #10) in Phase 1? | Product | Sprint planning |
| Where do admin "new pending transfer" notifications go (email vs. Slack)? (T5) | Product | Sprint planning |
| Proof-image **retention window** — deferred to client/finance (E3); Phase 1 ships private storage, no auto-purge. | Client | Post-launch |
| Auto-expiry window for unpaid registrations (P2 #14) — what N hours? | Product | Post-launch |

**Elephants to resolve with the client (from pre-mortem §Elephants):** Is manual transfer a stopgap or the long-term system (E1)? Who owns bank reconciliation and is accountable for a wrong approval (E2)? Retention/access policy for stored proof images containing financial PII (E3, partially addressed by private storage).

## 8. Timeline & Phasing

**Phase 1 — Manual Transfer MVP (launch blocker):** P0 stories 1–9 (now includes signed-token security #8 and amount-mismatch #9), plus P1 #10 (bank-account global) if cheap.
- Schema fields + **auto-push verified on the target DB before deploy** (T4), shared **idempotent** `issueTicketForRegistration` utility with email-failure handling, manual branch in registration action, **token-guarded** proof-upload action, dedicated admin verification view with approve/reject + mismatch warning, rejection email + signed re-upload.

**Phase 2 — Polish:** P1 #11 (pending badge + admin notification, T5), #12 (ticket-email status + resend, T6), #13 (proof-received email), email templating.

**Phase 3 — Hardening & Xendit return:** P2 #14 (auto-expiry cron, T8), #15 (capacity check at approval, T9), #16 (re-enable Xendit behind flag).

**Dependencies:** existing ticketing utilities, Media/Supabase storage, Resend email — all already in place. No external approvals needed (that's the whole point).

**Rollback plan:** if the manual flow misbehaves in production, fall back to "registration created, pay/confirm offline" — disable the proof-upload/approval path and have admins issue tickets manually via the existing `tickets` collection. No data migration required to revert.

### Launch gate (from pre-mortem Go/No-Go)
- [ ] T1 — proof/re-upload actions use signed tokens, field-scoped, no raw-id access
- [ ] T2 — `issueTicketForRegistration()` idempotent on linked ticket; approve re-runnable; button disables
- [ ] T3 — expected amount + reference shown; `amountPaid` entry + mismatch warning
- [ ] T4 — prod/staging DB columns confirmed; deploy checklist updated; staging smoke test passed
- [ ] Fast-follow (T5–T7) assigned; Track triggers (T8–T9) noted; rollback above confirmed
- [ ] Admin/treasurer briefed (E2); proof-image retention/access policy decided (E3)

---

### Next steps
- Break Phase 1 into engineering **user stories** with acceptance tests (`/pm-execution:write-stories`).
- Resolve the three **Elephants** with the client before committing engineering time.
- Tighten scope: P1 #10 could drop to P2 if a hardcoded account is acceptable for launch.
