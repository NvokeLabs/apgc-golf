# Pre-Mortem: Manual Bank-Transfer Payment for Event Tickets

**Date:** 2026-06-29
**Status:** Draft
**Scope:** Risks for the PRD `2026-06-29-manual-transfer-payment-prd.md`

> Framing: it is late July 2026. Manual transfer has been live for a few weeks and it has *failed* — registrants didn't get tickets, money went missing or got double-counted, or admins drowned. Below is why, worked backward.

---

## Risk Summary
- **Tigers:** 9 (4 launch-blocking, 3 fast-follow, 2 track)
- **Paper Tigers:** 3
- **Elephants:** 3

---

## Launch-Blocking Tigers

| # | Risk | Likelihood | Impact | Mitigation | Owner | Deadline |
|---|------|-----------|--------|-----------|-------|----------|
| T1 | **Public write access to registrations.** `event-registrations` is `create: anyone` and the proof-upload / re-upload actions must let an unauthenticated user mutate a specific registration. If the action keys off a raw `registrationId` (sequential integer), anyone can enumerate IDs and overwrite another person's proof, read their PII, or flip status. | High | Critical | Gate proof upload/re-upload behind an **unguessable signed token** (HMAC of reg id + secret) issued at registration, not the raw id. Server action verifies token; never trust client-supplied id alone. Scope the action to only the `transferProof`/status fields. | Eng | Before build |
| T2 | **Double-issue / no-issue on approval (idempotency).** The ticket block extracted from the webhook only guards on `paymentStatus === 'paid'`. If an admin double-clicks Approve, or the email step throws after the ticket is created, you get **two tickets + two emails**, or a `paid` reg with no ticket and no retry. | High | High | `issueTicketForRegistration()` must be idempotent on the **`ticket` relationship existing** (not just paymentStatus): if a ticket is already linked, return it. Wrap status-update + ticket-create so a failed email never blocks ticket creation, and make the approve action safely re-runnable. Disable the Approve button after first click. | Eng | Before build |
| T3 | **Wrong / mismatched / fake amount approved.** Single shared account + human eyeballing proof means a registrant pays the wrong amount, pays for the wrong event, reuses one transfer receipt for two registrations, or uploads a photoshopped slip — and an admin approves it, issuing a real ticket for unpaid money. | Medium | High | Show the **expected amount + reference (`reg-{id}`)** next to the proof in the admin view; require admin to enter `amountPaid` and warn on mismatch (pull P2 #13 forward). Instruct registrants to put the reference in the transfer note. Track approved-vs-banked totals during the first events. | Product + Eng | Before build |
| T4 | **Schema not pushed → prod build/runtime breaks.** New `paymentStatus` values and `transferProof`/`verifiedBy`/etc. fields rely on Payload dev auto-push. If the deploy pipeline runs `build` without the columns existing, prerender/runtime fails with `column … does not exist` (documented project gotcha). | Medium | Critical | Confirm the columns exist in the prod/staging DB before deploy (run `bun run dev` against it once, or script the push). Add a deploy checklist item. Smoke-test the full flow on staging with the real DB. | Eng | Launch |

## Fast-Follow Tigers

| # | Risk | Likelihood | Impact | Planned Response | Owner |
|---|------|-----------|--------|-----------------|-------|
| T5 | **Admin queue neglect → SLA blown.** No automation means tickets only exist when a human approves. Over a weekend or a registration spike, registrants wait days, email support, or pay twice. The PRD's <12h target silently breaks. | Eng/Product | Add the pending-count badge (P1 #9) + an email/Slack notification to admins on each new `awaiting-verification`. Define who's on call for verification per event. |
| T6 | **Silent email failure.** The existing pattern *continues on email failure* (webhook logs and moves on). A registrant can be `paid` with a ticket but never receive it, and nobody notices. | Eng | Surface email-send status on the registration (a `ticketEmailSent` flag + admin "resend ticket" button). Alert on failures rather than only `console.error`. |
| T7 | **Proof files: size/type/storage abuse.** Unbounded uploads (50MB images, HEIC, PDFs with payloads) to Supabase, or proof images that don't render in the admin view, slow review and risk storage/cost issues. | Eng | Enforce allowed types (JPG/PNG/PDF) + max size at the upload action; render a thumbnail/inline preview in the admin view; strip EXIF. |

## Track Tigers
- **T8 — Expiry / stale registrations.** Without auto-expiry (P2 #11), `awaiting-payment` regs that never pay accumulate and clutter the queue/counts. *Trigger to act:* queue noise or seat-count confusion at the first sold-out-ish event → ship the cron expiry.
- **T9 — Capacity/oversell.** Tickets are issued on approval, not on registration, so seats aren't held during the pending window; a popular event could approve more than capacity. *Trigger:* first event that approaches its cap → add a capacity check at approval.

## Paper Tigers
- **"We must hide Xendit perfectly or users will pay through a broken gateway."** Manageable — manual-only means the form simply doesn't render the Xendit option; the action branch skips invoice creation. The webhook route can stay deployed but unreferenced. *Becomes a real Tiger only if* a stale link or cached page still routes users into the Xendit action — verify no UI path reaches it.
- **"Re-upload loop could spam admins."** Low impact — rejection requires an admin action in the first place, and re-uploads just re-enter the same queue. A per-registration re-upload count is enough if it ever matters.
- **"PDF/QR generation won't scale."** Already proven in the Xendit path; manual approval is lower volume (human-gated), so the ticketing pipeline is not the bottleneck. The bottleneck is human review (T5), not compute.

## Elephants in the Room
- **E1 — Manual transfer may become permanent, not a stopgap.** If Xendit approval drags (or never comes), this "temporary" flow is your real payment system indefinitely. Are we comfortable running event revenue on manual reconciliation for months? *Conversation starter:* "What's our actual deadline/owner for Xendit approval, and what's our plan if it's still not approved by the next event?"
- **E2 — Who is financially accountable for approvals?** A wrong approval issues a real ticket for money that may not have arrived. That's a finance/trust responsibility, not just a UI click. *Starter:* "Who owns the bank reconciliation, and what's the process when approved tickets don't match banked funds?"
- **E3 — Handling money + PII + payment screenshots raises a compliance question.** We're storing transfer slips (names, account numbers, amounts) in Supabase with `anyone`-create access nearby. *Starter:* "Do we have a retention/access policy for proof images, and is the access model on `event-registrations` tight enough for storing financial PII?"

---

## Go/No-Go Checklist
- [ ] T1 mitigated — proof/re-upload actions use signed tokens, field-scoped, not raw ids
- [ ] T2 mitigated — `issueTicketForRegistration()` idempotent on linked ticket; approve is re-runnable; button disables
- [ ] T3 mitigated — expected amount + reference shown to admin; `amountPaid` entry + mismatch warning
- [ ] T4 mitigated — prod DB columns confirmed; deploy checklist updated; staging smoke test passed
- [ ] Fast-follow plan (T5–T7) documented and assigned
- [ ] Monitoring/triggers defined for Track Tigers (T8, T9)
- [ ] Rollback plan defined (can we revert to "registration only, pay offline" if the flow misbehaves?)
- [ ] Admin/treasurer briefed on verification process and accountability (E2)
- [ ] Proof-image retention/access policy decided (E3)
