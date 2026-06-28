# Backlog: Manual Bank-Transfer Payment — Phase 1 (Launch MVP)

**Format:** User Stories
**Source PRD:** `2026-06-29-manual-transfer-payment-prd.md` (P0 stories 1–9 + P1 #10)
**Pre-mortem:** `2026-06-29-manual-transfer-payment-premortem.md`
**Total stories:** 12
**Estimated total effort:** ~M×7 + S×4 + L×1 (roughly one focused sprint for one engineer)

> Stories are ordered by dependency. Stories 1–3 are foundation (no user-visible change) and unblock the rest. Acceptance criteria are written to be QA-verifiable without extra interpretation.

## Resolved design decisions (grill-me, 2026-06-29)

These were the launch-blocking unknowns. All now decided:

1. **Proof storage — private.** Proofs do **not** go in the existing public `media` collection (it's configured `disablePayloadAccessControl: true` with public URLs). Use a dedicated private bucket/prefix (or collection) with access control **on**; admins view proofs through an **authenticated stream route**, never a public URL. → new Story 0 + affects 6, 7, 10.
2. **Token secret — dedicated.** Add `UPLOAD_TOKEN_SECRET` (separate from `PAYLOAD_SECRET`) so upload-link compromise is rotatable without nuking sessions. → Story 3.
3. **Token TTL — expires at event date** (+ optional buffer days, configurable). → Story 3.
4. **Upload entry — one tokenized URL page** (`/register/event/[slug]/upload?token=…`) serves both the initial upload and the emailed re-upload link. Single code path. → Stories 6, 10.
5. **Post-approval — link invalidates.** Once `paymentStatus = paid` / ticket issued, the upload page is read-only ("already confirmed"); the server checks **status**, not just token validity. → Stories 6, 8.
6. **Pre-review — overwrite allowed.** While `awaiting-verification`, the registrant may replace their proof; status stays queued; admin sees the latest file. → Story 6.
7. **Abuse — rate limit + strict validation.** Per-token + per-IP rate limit plus server-side type/size checks before storing. → Story 6.
8. **Retention — deferred to client.** Ship Phase 1 storing proofs privately with **no auto-purge**; retention window is a client/finance decision (E3) tracked as an open item. → Open Questions.

---

## Stories

### Story 0: Private proof storage (foundation)
**As an** engineer, **I want** payment proofs stored in access-controlled storage, **so that** financial PII isn't world-readable like the existing public media bucket.

Acceptance Criteria:
- [ ] Proofs are stored in a **private** bucket/prefix (or a dedicated collection) with `disablePayloadAccessControl: false` — **not** the existing public `media` collection.
- [ ] No proof file is reachable via a public/guessable URL; direct bucket access is denied to anonymous users.
- [ ] Admins read a proof only through an **authenticated stream route** (the admin user must be logged in).
- [ ] New env/config for the private bucket documented in `.env.example`.
- [ ] Verified: an unauthenticated request to a proof URL is rejected.

Priority: P0 | Effort: M | Dependencies: none | Build with Stories 1–3

---

### Story 1: Extend EventRegistrations data model for manual transfer
**As an** engineer, **I want** the registration schema to represent the manual-transfer lifecycle, **so that** every later story has fields to read/write.

Acceptance Criteria:
- [ ] `paymentStatus` select gains values `awaiting-payment`, `awaiting-verification`, `rejected` (existing values retained).
- [ ] New fields added: `transferProof` (upload → media), `rejectionReason` (textarea), `verifiedBy` (relationship → users), `verifiedAt` (date), `ticketEmailSent` (checkbox, default false).
- [ ] `payload-types.ts` regenerated (`bun run generate:types`).
- [ ] **DB columns confirmed present** via dev auto-push (`bun run dev`) before any `build`; verified on the target/staging DB, not just locally (mitigates T4).
- [ ] Admin edit view shows the new fields in sensible positions; no regression to the existing Xendit fields.

Priority: P0 | Effort: S | Dependencies: none

---

### Story 2: Extract an idempotent, email-safe ticket-issuing utility
**As an** engineer, **I want** one shared `issueTicketForRegistration()` used by both the webhook and manual approval, **so that** tickets are issued identically and exactly once.

Acceptance Criteria:
- [ ] New `src/utilities/ticketing/issueTicketForRegistration.ts` contains the ticket-code + QR + `tickets` create + link + ticket email logic currently inline in the Xendit webhook.
- [ ] **Idempotent (T2):** if the registration already has a linked `ticket`, the function returns it without creating a second ticket or sending a second email.
- [ ] **Email-safe (T6):** a failed `sendTicketEmail` sets `ticketEmailSent = false` and returns a non-fatal result — it does **not** throw or prevent ticket creation; success sets `ticketEmailSent = true`.
- [ ] The Xendit webhook is refactored to call this utility with **no change to its external behavior** (verified by existing flow still issuing tickets on `PAID`).
- [ ] Unit/integration test covers: first call issues, second call is a no-op, email failure leaves a valid ticket.

Priority: P0 | Effort: M | Dependencies: Story 1

---

### Story 3: Signed upload-token utility
**As an** engineer, **I want** to mint and verify an unguessable per-registration token, **so that** public upload endpoints can't be driven by ID enumeration (mitigates T1).

Acceptance Criteria:
- [ ] Utility exposes `mintUploadToken(registrationId)` and `verifyUploadToken(token)` using HMAC over the registration id + secret.
- [ ] **Secret = `UPLOAD_TOKEN_SECRET`** (new env var, separate from `PAYLOAD_SECRET`); read from env, never hardcoded; documented in `.env.example`.
- [ ] **TTL = event date (+ optional buffer days, configurable).** The token embeds/derives an expiry tied to the registration's event; an expired token fails verification with a clear "link expired" outcome.
- [ ] Tokens are not guessable from the sequential `registrationId`; a tampered token, wrong id, or expired token all fail verification.
- [ ] Unit tests: valid token verifies; modified token/id rejected; expired token rejected.

Priority: P0 | Effort: S | Dependencies: Story 1 (needs event date for TTL)

---

### Story 4: Bank-account configuration (Payment Settings global)
**As an** admin, **I want** to set the bank details once, **so that** every event's transfer instructions stay correct without code changes.

Acceptance Criteria:
- [ ] A "Payment Settings" field group (on an existing global, e.g. `SiteLabels`) holds bank name, account number, account holder, and optional instruction notes.
- [ ] Fields are editable in the admin and readable server-side for the registration confirmation screen.
- [ ] Empty/unconfigured values degrade gracefully (no broken instructions page).

Priority: P1 (Phase 1 if cheap) | Effort: S | Dependencies: none

---

### Story 5: Manual-transfer branch in the registration action
**As a** registrant, **I want** submitting the form to create a pending bank-transfer registration, **so that** I can pay without Xendit.

Acceptance Criteria:
- [ ] `createRegistrationWithPayment` branches on method: for manual transfer it creates the registration with `paymentMethod = bank-transfer`, `paymentStatus = awaiting-payment`, prices by category (general/alumni) as today.
- [ ] It **does not** call Xendit (`createXenditInvoice` skipped) and does not set `xenditSessionId`/`xenditCheckoutUrl`.
- [ ] It mints an upload token (Story 3) and returns bank instructions + token instead of a checkout URL.
- [ ] Xendit is not reachable from the registration UI at launch (manual-only); the Xendit code path remains in the repo but unreferenced (verifies Paper Tiger from pre-mortem).

Priority: P0 | Effort: M | Dependencies: Stories 3, 4

---

### Story 6: Registrant proof-upload (tokenized page + guarded action)
**As a** registrant, **I want** a single tokenized page showing instructions and an upload control, **so that** my payment can be verified — reachable from the post-submit redirect AND the emailed link.

Acceptance Criteria:
- [ ] One page (`/register/event/[eventSlug]/upload?token=…`) serves both initial upload and re-upload; the post-submit redirect and the emailed links (Stories 11/9) point here.
- [ ] The page shows bank name, account number, account holder, **exact amount**, and the `reg-{id}` reference (from Story 4 global).
- [ ] An upload control accepts **JPG/PNG/PDF only, max 10 MB**, enforced **server-side**; the file is written to **private storage** (Story 0), never the public media bucket.
- [ ] The upload action **verifies the signed token** (Story 3) and is **field-scoped** — it can only set `transferProof` and move status; it cannot read other PII or mutate other fields, and rejects a bare `registrationId` (mitigates T1).
- [ ] On success: proof attached, `paymentStatus → awaiting-verification`, registrant sees a "pending review" confirmation.
- [ ] **Overwrite allowed pre-review:** if already `awaiting-verification`, a new upload replaces the file and stays queued.
- [ ] **Invalidated after approval:** if `paymentStatus = paid` / ticket issued, the page is read-only ("already confirmed") and uploads are rejected — server checks status, not just token.
- [ ] **Abuse protection:** per-token + per-IP rate limit on the endpoint; invalid type/size/token/expiry returns a clear error and changes nothing.

Priority: P0 | Effort: L | Dependencies: Stories 0, 3, 4, 5

---

### Story 7: Admin verification dashboard view
**As an** admin, **I want** a dedicated queue of transfers awaiting verification, **so that** I can review them quickly.

Acceptance Criteria:
- [ ] A custom admin view registered like `CheckInView` (e.g. admin path `/manual-transfers`) lists registrations with `paymentStatus = awaiting-verification`.
- [ ] Each row shows registrant, event, category, **expected amount + `reg-{id}` reference**, submission time, and an **inline preview** of the uploaded proof served via the **authenticated stream route** (Story 0), not a public URL.
- [ ] The list is filterable/sortable by event and ordered by submission time.
- [ ] Access restricted to authenticated admin users.

Priority: P0 | Effort: M | Dependencies: Stories 1, 6 (needs data to display)

---

### Story 8: Admin approve transfer (with mismatch warning)
**As an** admin, **I want** to approve a verified transfer, **so that** the registrant's ticket is issued and emailed.

Acceptance Criteria:
- [ ] Approve requires the admin to enter `amountPaid`; if it differs from the category-priced expected amount, a **clear mismatch warning** is shown before confirmation (mitigates T3).
- [ ] On confirm: sets `paymentStatus = paid`, `paidAt`, `verifiedBy`, `verifiedAt`, `status = confirmed`, then calls `issueTicketForRegistration()` and revalidates the event page.
- [ ] **Idempotent / no double-issue (T2):** the Approve button disables after first click; re-approving an already-ticketed registration does not create a second ticket or email.
- [ ] After approval the registration leaves the pending queue.

Priority: P0 | Effort: M | Dependencies: Stories 2, 7

---

### Story 9: Admin reject transfer + rejection email with re-upload link
**As an** admin, **I want** to reject a bad transfer with a reason, **so that** the registrant knows to fix and resubmit.

Acceptance Criteria:
- [ ] Reject requires a `rejectionReason`, sets `paymentStatus = rejected`, and issues **no ticket**.
- [ ] The registrant is emailed the reason plus a **signed re-upload link** (token from Story 3).
- [ ] The rejected registration is removed from the awaiting-verification queue.
- [ ] Email send failure is surfaced to the admin (not silently swallowed).

Priority: P0 | Effort: S | Dependencies: Stories 3, 7

---

### Story 10: Registrant re-upload after rejection
**As a** registrant whose proof was rejected, **I want** to upload corrected proof via my link, **so that** I can still get my ticket.

Acceptance Criteria:
- [ ] The signed re-upload link opens the **same tokenized upload page as Story 6**, additionally showing the rejection reason; same file constraints, private storage, and rate limiting apply.
- [ ] A valid re-upload replaces `transferProof`, clears `rejectionReason`, sets `paymentStatus → awaiting-verification`, and returns the registration to the admin queue.
- [ ] An invalid/expired token, or a registration already `paid`, shows a clear error and changes nothing.

Priority: P0 | Effort: M | Dependencies: Stories 3, 6, 9

---

### Story 11: "Complete your payment" follow-up email
**As a** registrant, **I want** an email with bank instructions and my upload link right after registering, **so that** I can pay and submit proof later without losing the link.

Acceptance Criteria:
- [ ] On manual-transfer registration (Story 5), an email is sent to the registrant titled like "Complete your payment".
- [ ] The email includes bank name, account number, account holder, **exact amount**, the `reg-{id}` reference, and a **tokenized link to the upload page** (Story 6, token from Story 3).
- [ ] The link is the same tokenized URL as the on-screen redirect — landing on it resumes the upload flow.
- [ ] Reuses the existing Resend setup (`sendTicketEmail` style); send failure is logged/surfaced and does **not** break the registration (the on-screen confirmation still shows the instructions + link).
- [ ] Token expiry in the email matches Story 3 (event date + buffer).

Priority: P0 | Effort: S | Dependencies: Stories 3, 4, 5, 6

---

## Story Map

```
Foundation (no UI):  [0 private storage] [1 schema] [2 ticket-util] [3 token-util]
Registrant:                       [4 bank global] → [5 reg branch] → [6 upload page] → [11 payment email]
Admin:                                              [7 queue view] → [8 approve] → [9 reject]
Reject loop:                                                                       [10 re-upload]
```

Build order: **0, 1, 2, 3 → 4 → 5 → 6 → 11 → 7 → 8 → 9 → 10.** Foundation (0–3) can be parallelized; everything user-facing depends on it. Total stories: **12** (added Story 0 and Story 11).

## Technical Notes
- **DB:** Story 1's columns must exist via dev auto-push before any prod build (project gotcha; T4). Add to deploy checklist.
- **Private storage:** Story 0 is foundational — proofs must NOT land in the existing public `media` collection (`disablePayloadAccessControl: true`, public URLs). Admin previews stream through an authed route.
- **Reuse:** Story 2 refactors the Xendit webhook to the shared utility — regression-test the existing `PAID` path.
- **Security boundary:** `event-registrations` is `create: anyone` / `read|update: authenticated`. Public actions (Stories 6, 10) run server-side, token-verified (`UPLOAD_TOKEN_SECRET`, event-date TTL), field-scoped, rate-limited, and status-gated (read-only after approval) — the single highest-risk surface (T1).
- **Email:** reuse the Resend setup behind `sendTicketEmail`. In Phase 1 scope: ticket email (Story 2), "complete your payment" email (Story 11), rejection email (Story 9). All must be non-fatal on send failure.
- **New env vars:** `UPLOAD_TOKEN_SECRET` (Story 3) and the private-bucket config (Story 0).

## Open Questions (must answer before/at sprint start)
- Token TTL buffer — how many days after the event date stays valid (Story 3)?
- Notification channel for new pending transfers (email/Slack) — Phase 2 (P1 #11), not blocking Phase 1.
- **Proof retention window (deferred to client, E3):** Phase 1 stores proofs privately with **no auto-purge**; client/finance to set the retention period later.
- **Elephants (client decision, not engineering):** stopgap vs permanent (E1); who owns reconciliation + accountability for a wrong approval (E2).
