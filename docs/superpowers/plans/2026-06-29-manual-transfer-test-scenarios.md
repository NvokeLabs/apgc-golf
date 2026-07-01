# Test Scenarios: Manual Bank-Transfer Payment — Riskiest Stories

**Source:** `2026-06-29-manual-transfer-phase1-stories.md` (Stories 0, 2, 3, 6, 8)
**Pre-mortem refs:** T1 (token/storage), T2 (idempotency), T3 (amount), T6 (email-safe)
**Total scenarios:** 28
**Coverage:** happy path · edge cases · error handling · security · performance
**Focus rationale:** these stories carry every launch-blocking Tiger; security/error coverage is weighted over happy paths.

---

## Story 0 — Private proof storage

### S0.1: Authenticated admin can view a proof
**Tests:** Story 0 (authed stream route) · **Role:** admin · **Pre:** a registration with an uploaded proof exists.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log in as admin, open the verification view | Proof preview renders for the registration |
| 2 | Inspect the proof's network request | Served via the authed stream route, not a public Supabase URL |

**Post:** proof visible only within an authed session. **Priority:** High

### S0.2: Anonymous user cannot reach a proof file (security)
**Tests:** Story 0 (no public URL) · **Role:** anonymous.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Capture a proof's storage object path/URL | — |
| 2 | Request that URL with no auth / incognito | 401/403/404 — file is NOT returned |
| 3 | Request the authed stream route with no session | Rejected (redirect to login or 401) |

**Post:** financial PII not world-readable. **Priority:** Critical

### S0.3: Proof is not written to the public `media` collection (security)
**Tests:** Story 0 · **Role:** system.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Upload a proof through the normal flow | File lands in the private bucket/prefix only |
| 2 | Query the `media` collection | No record for the proof; no public `…/object/public/…` URL exists for it |

**Post:** storage segregation verified. **Priority:** Critical

### S0.4: Non-admin authenticated user cannot view others' proofs (security)
**Tests:** Story 0 (access control scope) · **Role:** logged-in non-admin (if such role exists).

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | As a non-admin authenticated user, hit the stream route for a proof | Rejected if role lacks permission (confirm intended role model) |

**Post:** least-privilege confirmed. **Priority:** High · *Flag: confirm whether any non-admin authed users exist.*

---

## Story 2 — Idempotent, email-safe ticket issuing

### S2.1: First issue creates ticket + sends email (happy path)
**Tests:** Story 2 · **Role:** system · **Pre:** a `paid` registration with no linked ticket.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Call `issueTicketForRegistration(regId)` | One `tickets` record created with code + QR |
| 2 | Inspect registration | `ticket` linked; `ticketEmailSent = true` |
| 3 | Check inbox | One ticket email with QR received |

**Post:** exactly one ticket + one email. **Priority:** Critical

### S2.2: Re-invocation does not double-issue (T2)
**Tests:** Story 2 idempotency · **Pre:** registration already has a linked ticket.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Call the utility again on the same registration | Returns the existing ticket; no new `tickets` record |
| 2 | Check inbox | No second email sent |

**Post:** ticket count unchanged. **Priority:** Critical

### S2.3: Concurrent/double invocation (race)
**Tests:** Story 2 · **Pre:** `paid` reg, no ticket.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Fire two near-simultaneous calls for the same reg | Exactly one ticket exists afterward (no duplicate from the race) |

**Post:** single ticket. **Priority:** High · *Flag: needs concurrency test harness; confirm DB-level guard/unique constraint.*

### S2.4: Email failure leaves a valid ticket (T6)
**Tests:** Story 2 email-safe · **Pre:** Resend mocked to fail.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Issue ticket while email send throws/returns failure | Ticket still created and linked; call does NOT throw |
| 2 | Inspect registration | `ticketEmailSent = false`; failure logged/surfaced |
| 3 | Re-run issue (retry) | No duplicate ticket; email retried |

**Post:** never `paid` without a ticket. **Priority:** Critical · *Mock: Resend.*

### S2.5: Xendit webhook regression via shared utility
**Tests:** Story 2 (refactor) · **Pre:** Xendit path enabled in a test env.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Simulate a `PAID` webhook | Ticket issued + emailed exactly as before the refactor |
| 2 | Replay the same `PAID` webhook | Idempotent — no second ticket (existing behavior preserved) |

**Post:** no regression. **Priority:** High

---

## Story 3 — Signed upload-token utility

### S3.1: Valid token verifies (happy path)
**Tests:** Story 3 · **Role:** system.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | `mintUploadToken(regId)` then `verifyUploadToken(token)` | Verifies; resolves to the correct `regId` |

**Priority:** High

### S3.2: Tampered token rejected (security)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Flip a character in the signature portion, verify | Rejected |
| 2 | Change the embedded id to another registration, verify | Rejected (signature mismatch) |

**Priority:** Critical

### S3.3: Enumeration resistance (security / T1)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Attempt to forge a token for `regId+1` without the secret | Cannot produce a valid token |
| 2 | Pass a bare integer `registrationId` where a token is expected | Rejected — bare id is never accepted |

**Priority:** Critical

### S3.4: Expired token rejected (event-date TTL)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Mint a token for an event whose date+buffer is in the past | `verify` rejects with an "expired" outcome |
| 2 | Mint for a future event | Verifies |

**Priority:** High · *Test data: past-dated and future-dated events.*

### S3.5: Secret rotation invalidates old tokens (security)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Mint a token, then change `UPLOAD_TOKEN_SECRET`, verify old token | Rejected (confirms isolation from `PAYLOAD_SECRET`) |
| 2 | Confirm Payload admin sessions still valid after rotation | Sessions unaffected (separate secret) |

**Priority:** Medium

### S3.6: Missing/empty env secret fails safe
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Unset `UPLOAD_TOKEN_SECRET`, attempt mint/verify | Fails loudly at startup/use — never signs with an empty/default secret |

**Priority:** High

---

## Story 6 — Registrant proof-upload (tokenized page + guarded action)

### S6.1: Upload valid proof (happy path)
**Tests:** Story 6 · **Role:** registrant · **Pre:** registration `awaiting-payment`, valid token.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `…/upload?token=…` | Page shows bank details, exact amount, `reg-{id}` reference |
| 2 | Upload a 2 MB JPG | Stored to private bucket; `paymentStatus → awaiting-verification`; "pending review" shown |
| 3 | Open the admin queue | Registration appears with the proof |

**Post:** proof attached, queued. **Priority:** Critical

### S6.2: File type rejected server-side (error)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Upload a `.exe`/`.zip` (also try renaming to `.jpg`) | Rejected by server-side type check; nothing stored; clear error |

**Priority:** Critical · *Negative test; bypass client validation directly against the action.*

### S6.3: Oversized file rejected (boundary)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Upload exactly 10 MB | Accepted (boundary) |
| 2 | Upload 10 MB + 1 byte / 25 MB | Rejected with size error; nothing stored |

**Priority:** High

### S6.4: Invalid/missing token blocks upload (security / T1)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open the page with a tampered/absent token | Access denied; no upload control or upload disabled |
| 2 | POST directly to the action with a bare `registrationId` | Rejected — no write occurs |

**Priority:** Critical

### S6.5: Field-scoping — cannot mutate other fields (security / T1)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Craft an upload request adding extra fields (e.g. `paymentStatus=paid`, `amountPaid`, `email`) | Only `transferProof` + intended status change applied; injected fields ignored |
| 2 | Confirm no PII of the registration is returned in the response | Response leaks no other-field data |

**Priority:** Critical

### S6.6: Overwrite allowed while awaiting verification (edge)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Upload proof A → `awaiting-verification` | Queued with A |
| 2 | Re-open link, upload proof B before admin acts | B replaces A; status stays `awaiting-verification`; admin sees B (latest) |

**Priority:** High

### S6.7: Read-only after approval (security / lifecycle)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Admin approves the registration (`paid`) | — |
| 2 | Registrant re-opens the (still-valid-TTL) upload link | Page is read-only "already confirmed"; upload rejected |
| 3 | POST directly to the action post-approval | Server rejects on status check, not just token |

**Priority:** Critical

### S6.8: Rate limiting (security / performance / T7)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit many uploads rapidly for one token | Throttled after the limit (per-token) |
| 2 | Hammer the endpoint from one IP across tokens | Throttled (per-IP) |

**Priority:** High · *Flag: needs load/rate-limit test tooling.*

### S6.9: Expired token on the page (TTL)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open the upload page after event-date+buffer | "Link expired" message; no upload possible |

**Priority:** Medium

### S6.10: Resume from email link (happy path, cross-device)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open the link from the "complete your payment" email on a different device/browser | Same tokenized page loads; upload works |

**Priority:** Medium · *Cross-browser/device check.*

### S6.11: Corrupt/empty file upload (error)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Upload a 0-byte file or a truncated image | Rejected with a clear error; nothing stored; status unchanged |

**Priority:** Medium

---

## Story 8 — Admin approve transfer (with mismatch warning)

### S8.1: Approve matching amount issues ticket (happy path)
**Tests:** Story 8 · **Role:** admin · **Pre:** registration `awaiting-verification`, expected = 500,000.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open the registration, enter `amountPaid = 500,000`, approve | `paymentStatus=paid`, `paidAt`, `verifiedBy`, `verifiedAt`, `status=confirmed` set |
| 2 | — | Ticket issued via shared utility; email sent; event page revalidated |
| 3 | Re-open verification queue | Registration no longer listed |

**Post:** one ticket, registrant emailed. **Priority:** Critical

### S8.2: Mismatch warning on wrong amount (T3)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter `amountPaid = 250,000` (≠ 500,000) | Clear mismatch warning shown before confirm |
| 2 | Proceed anyway / cancel | Approval requires explicit confirmation; cancel leaves status unchanged |

**Priority:** Critical

### S8.3: Double-click / re-approve does not double-issue (T2)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click Approve, then immediately click again | Button disabled after first click; one ticket only |
| 2 | Re-approve an already-`paid` registration | No second ticket, no second email |

**Priority:** Critical

### S8.4: Two admins approve same registration (race)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Two admins open the same pending reg and approve near-simultaneously | Exactly one ticket issued; second approval is a safe no-op |

**Priority:** High · *Flag: concurrency test.*

### S8.5: Approve with email failing (T6)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Approve while Resend is mocked to fail | Ticket created/linked; `ticketEmailSent=false`; admin sees a "ticket email failed — resend" affordance |

**Priority:** High · *Mock: Resend.*

### S8.6: Approve a registration with no proof (edge/guard)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Attempt to approve a reg still `awaiting-payment` (no proof uploaded) | Either blocked or requires explicit override (confirm intended rule) |

**Priority:** Medium · *Flag: confirm whether approval requires a proof present.*

### S8.7: Non-admin cannot approve (security)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Call the approve API without an admin session | 401/403; no state change |

**Priority:** Critical

---

## Coverage Matrix

| Requirement | Happy Path | Edge Cases | Error Handling | Security | Notes |
|------------|-----------|-----------|---------------|----------|-------|
| Story 0 private storage | S0.1 | — | — | S0.2, S0.3, S0.4 | PII exposure is the key risk |
| Story 2 idempotent issuing | S2.1, S2.5 | S2.3 | S2.4 | — | T2/T6 |
| Story 3 token | S3.1 | S3.4, S3.5 | S3.6 | S3.2, S3.3 | T1 |
| Story 6 upload | S6.1, S6.10 | S6.3, S6.6, S6.9, S6.11 | S6.2, S6.11 | S6.4, S6.5, S6.7, S6.8 | highest-risk surface |
| Story 8 approve | S8.1 | S8.4, S8.6 | S8.5 | S8.3, S8.7 | T2/T3/T6 |

Every acceptance criterion in Stories 0/2/3/6/8 maps to ≥1 scenario above.

## Test Data Requirements
- **Events:** one future-dated (valid TTL), one past-dated+buffer (expired TTL), with `price` and `alumniPrice` set.
- **Registrations:** fixtures in each state — `awaiting-payment`, `awaiting-verification` (with proof), `paid` (with linked ticket), `rejected`.
- **Files:** valid JPG (~2 MB) and PDF; exactly-10 MB file; >10 MB file; disallowed type (`.exe`/`.zip`); renamed-extension file; 0-byte/truncated image.
- **Users:** admin account; (if applicable) a non-admin authenticated account.
- **Tokens:** valid, tampered-signature, wrong-id, expired.
- **Mocks:** Resend (force send failure); rate-limiter/load tool; concurrency harness for race scenarios (S2.3, S8.4).
- **Secrets:** ability to rotate `UPLOAD_TOKEN_SECRET` in a test env (S3.5) and unset it (S3.6).

## Flags / spikes
- Confirm the **role model** — are there authenticated non-admin users? (S0.4, drives least-privilege tests.)
- **Concurrency** scenarios (S2.3, S8.4) need a harness and possibly a DB unique constraint on `registration → ticket`.
- **Rate-limit** scenario (S6.8) depends on the chosen rate-limit implementation.
- Confirm the **approve-without-proof** rule (S8.6).
