# WhatsApp Admin Notifications (Fonnte) — Design

- **Date:** 2026-07-02
- **Status:** Approved (pending spec review)
- **Branch:** `feat/whatsapp-notifications`

## Goal

Notify the APGC Golf team via a **WhatsApp group** whenever one of four
admin-relevant events occurs, so staff get an instant, checked-often alert (in
addition to the existing Resend emails). Internal alerts only — no
customer-facing WhatsApp in this scope.

Provider: **Fonnte** (Indonesian WhatsApp gateway, unofficial/device-linked).
Acceptable here because messages go only to the team's own group at low volume.
Customer-facing WhatsApp (which would require the official WhatsApp Cloud API) is
explicitly **out of scope**.

## Triggers (4)

All fire on record **creation** (or, for proofs, a specific status flip), and
send one message to the configured group:

| # | Event | Wiring point | Fires when |
|---|-------|--------------|-----------|
| 1 | New sponsorship inquiry | `SponsorRegistrations` collection `afterChange` | `operation === 'create'` |
| 2 | New event registration | `EventRegistrations` collection `afterChange` | `operation === 'create'` |
| 3 | Contact-form submission | form-builder `formSubmissionOverrides.hooks.afterChange` in `src/plugins/index.ts` | `operation === 'create'` |
| 4 | Transfer proof uploaded | inline in `src/utilities/registration/processProofUpload.ts` | after the successful update to `paymentStatus = 'awaiting-verification'` |

**Why hooks at the data layer:** registrations are created from multiple paths
(public Xendit flow, manual-transfer branch, admin), and the contact form posts
straight to `/api/form-submissions` with no custom action. Collection hooks are
the single reliable interception point. The proof upload is a precise status
transition, so it is wired inline in `processProofUpload` rather than via an
`afterChange` watching every update.

## Components (small, isolated, testable)

### 1. `src/utilities/whatsapp/sendWhatsAppNotification.ts`
Thin Fonnte client. One job: deliver a message string to the configured target.

- `POST https://api.fonnte.com/send`
- Header: `Authorization: <FONNTE_TOKEN>`
- Body (form-encoded or JSON per Fonnte): `{ target: <FONNTE_TARGET>, message }`
- Signature: `sendWhatsAppNotification(message: string): Promise<{ success: boolean; error?: string }>`
- **Non-fatal contract** (mirrors `src/utilities/email/*`):
  - Missing `FONNTE_TOKEN` or `FONNTE_TARGET` → log a warning, return
    `{ success: false, error: 'WhatsApp not configured' }`, do **not** call fetch,
    do **not** throw.
  - Non-2xx response or network throw → log, return `{ success: false, error }`,
    never throw.
- Depends on: `process.env` + `fetch`.

### 2. `src/utilities/whatsapp/messages.ts`
Pure builder functions, one per trigger, each returning a Bahasa Indonesia
string. Pure (input data → string) → unit-testable with no mocks.

- `buildSponsorInquiryMessage(doc, baseUrl): string`
- `buildEventRegistrationMessage(doc, baseUrl): string`
- `buildContactMessage(doc, baseUrl): string`
- `buildTransferProofMessage(registration, baseUrl): string`

Each includes an **admin deep-link** built from `BASE_URL`.

### 3. Thin wiring
Each trigger maps `doc → builder → sendWhatsAppNotification`, wrapped in
try/catch so a WhatsApp failure can never reject the write or break the flow.
Hooks stay thin; all formatting lives in the pure builders.

## Config (env vars)

| Var | Purpose |
|-----|---------|
| `FONNTE_TOKEN` | Fonnte device token |
| `FONNTE_TARGET` | WhatsApp **group ID** to receive alerts |

- Added to `.env.example`.
- Set in Vercel (all environments) via CLI, same as prior secrets.
- Ops note: the Fonnte group ID is obtained from the Fonnte dashboard/API after
  the connected number joins the target WhatsApp group.

## Message formats (Bahasa Indonesia, with admin deep-links)

All use `BASE_URL` (= `https://www.polinemagolf.com`) for links. Amounts format
as IDR via `Intl.NumberFormat('id-ID', …)`.

**Sponsorship** → link to the admin doc:
```
🤝 Pengajuan Sponsor Baru
Perusahaan: {companyName}
Narahubung: {contactName} ({phone})
Email: {email}
Tier: {selectedTier}
Lihat: {BASE_URL}/admin/collections/sponsor-registrations/{id}
```

**Event registration**:
```
📝 Pendaftaran Baru
Nama: {playerName}
Acara: {eventTitle}
Kategori: {category}
Metode: {paymentMethod}
Ref: reg-{id}
Lihat: {BASE_URL}/admin/collections/event-registrations/{id}
```

**Contact form** (message body truncated to a safe length, e.g. 500 chars):
```
📩 Pesan Kontak Baru
Nama: {name}
Email: {email}
Pesan: {message… (truncated)}
```

**Transfer proof** → link to the manual-transfer verification queue:
```
💸 Bukti Transfer Masuk
Ref: reg-{id}
Nama: {playerName}
Acara: {eventTitle}
Nominal: Rp {amountDue}
Verifikasi: {BASE_URL}/admin/manual-transfers
```

Field availability is best-effort: builders guard missing fields (e.g. no phone)
and omit or label them gracefully rather than printing `undefined`.

## Error handling

Non-fatal end-to-end. The notification is a side channel; it must never block a
registration, sponsorship, contact submission, or proof upload. Layers:
1. `sendWhatsAppNotification` never throws (see contract above).
2. Every call-site additionally wraps the build+send in try/catch and logs.
3. Missing config degrades to a no-op warning (safe for local/dev/CI without
   Fonnte credentials).

## Testing (TDD)

- **Unit — `sendWhatsAppNotification`** (mock global `fetch`):
  - builds the correct URL, `Authorization` header, and body (`target`, `message`);
  - returns `{ success: true }` on a 2xx response;
  - returns `{ success: false }` **without** calling fetch when env is missing;
  - returns `{ success: false }` (no throw) on non-2xx and on a fetch rejection.
- **Unit — message builders** (pure):
  - each asserts the key fields and the correct admin deep-link are present;
  - contact builder truncates an over-long message body.
- **Hooks** stay thin; coverage focuses on the pure builders + sender. Where
  practical, assert a hook calls the builder + sender with the expected args
  using dependency injection / mocks, following the repo's email-utility test
  style.

Tests live in `tests/int/` (Vitest), run with `bun run test:int`.

## Out of scope

- Customer-facing WhatsApp messages (would require the official WhatsApp Cloud
  API / a BSP; Fonnte's unofficial channel is not appropriate for messaging
  customers).
- Retry queues / delivery-status tracking (YAGNI for low-volume internal alerts).
- Per-event opt-in/routing configuration (single group for all four triggers).

## Open questions / ops

- Confirm Fonnte send payload shape (form vs JSON) and group-target format
  against current Fonnte API docs during implementation.
- Provision `FONNTE_TOKEN` + `FONNTE_TARGET` in Vercel before the first deploy;
  until then the feature safely no-ops.
