# Alumni Fields (Angkatan + Jurusan) on Event Registration — Design

- **Date:** 2026-07-07
- **Status:** Approved (pending spec review)
- **Branch:** `feat/alumni-fields`

## Goal

When a registrant picks the **Alumni** category, capture their **angkatan**
(class/entry year) and **jurusan** (major, freetext) during event registration.
Both are required for alumni, hidden for general registrants, stored on the
registration, visible in admin, and surfaced in the transfer-proof WhatsApp
alert.

## Fields

Two new fields on the `event-registrations` collection (Registrant tab), placed
after `tshirtSize`:

| Field | Type | Notes |
|---|---|---|
| `alumniClassYear` | `number` | The "angkatan" year. Label **"Angkatan"**. `admin.description`: "Tahun angkatan alumni". |
| `alumniMajor` | `text` | The "jurusan", freetext. Label **"Jurusan"**. `admin.description`: "Jurusan alumni". |

- Both collection fields are **optional** (nullable DB columns) — `required` is
  enforced at the app layer (form + server), not via DB `NOT NULL`. This mirrors
  the `tshirtSize` decision: existing/general registrations that never had these
  stay valid, and dev auto-push never trips on a NOT-NULL alter over null rows.
- **Admin visibility:** both fields carry
  `admin.condition: (data) => data?.category === 'alumni'`, so they render only
  for alumni registrations in the admin panel.

## Form (public registration)

`src/app/(frontend)/register/event/[eventSlug]/EventRegistrationForm.tsx`

- The form is currently uncontrolled (`FormData`). Add a `useState<string>` for
  the selected category, wired to the existing category `<select>` via
  `onChange`, initialized to `'general'`.
- When `category === 'alumni'`, conditionally render two fields inside the
  "Detail Pendaftaran" section (mirroring the existing selects):
  - **Angkatan** — a `<select name="alumniClassYear">` whose options are the
    years from the current year down to **1970**, inclusive. The current year is
    computed at render (`new Date().getFullYear()`), so "latest" is always this
    year. Placeholder `<option value="" disabled>` reading "Pilih angkatan".
    `required` (only rendered when alumni, so it only binds then).
  - **Jurusan** — a `<input type="text" name="alumniMajor">`, placeholder
    "Contoh: Teknik Sipil". `required` (only rendered when alumni).
- `handleSubmit` reads `formData.get('alumniClassYear')` and
  `formData.get('alumniMajor')`. `alumniClassYear` is parsed to a number
  (`Number(...)`), passed as `undefined` when empty/absent (general path).

## Create paths (server)

`src/app/(frontend)/register/event/[eventSlug]/actions.ts`

- Extend `RegistrationFormData`:
  - `alumniClassYear?: number`
  - `alumniMajor?: string`
- **Server guard** in `createRegistrationWithPayment`: when
  `data.category === 'alumni'`, reject with a clear message if either is missing:
  - missing `alumniClassYear` → `{ success: false, error: 'Angkatan wajib diisi' }`
  - missing `alumniMajor` (empty/whitespace) → `{ success: false, error: 'Jurusan wajib diisi' }`
  - Runs alongside the existing `tshirtSize` guard, before branching on payment
    method, so it protects a JS-bypassed / non-form caller.
- Thread both fields into **every** create path:
  - Manual/default branch → `issueManualRegistration(...)` input.
  - Legacy Xendit branch → the `payload.create` data object.

`src/utilities/registration/issueManualRegistration.ts`

- Extend the input type with `alumniClassYear?: number` and `alumniMajor?: string`.
- Include both in its `payload.create` data (pass through as-is; `undefined`
  for general registrations leaves the columns null).

## WhatsApp alert

`src/utilities/whatsapp/messages.ts`

- `buildTransferProofMessage` input gains optional `alumniClassYear?: number` and
  `alumniMajor?: string`.
- When `alumniClassYear` is set, push a line `Angkatan: {year}`.
- When `alumniMajor` is set (non-empty), push a line `Jurusan: {major}`.
- Both lines are omitted entirely when unset — no "undefined" text — consistent
  with how the `Ukuran kaos` line behaves.

`src/utilities/whatsapp/notifyProofUploaded.ts`

- The `reg` cast type gains `alumniClassYear?: number` and `alumniMajor?: string`.
- Pass `alumniClassYear: reg.alumniClassYear` and `alumniMajor: reg.alumniMajor`
  into `buildTransferProofMessage`.

## Types

- After the collection fields are added, run `bun run generate:types` so
  `src/payload-types.ts` includes `alumniClassYear` and `alumniMajor`.

## Data / DB

- Payload generates a nullable `integer` column `alumni_class_year` and a
  nullable `varchar` column `alumni_major` on `event_registrations`.
- **Local** dev auto-pushes both columns on the next `bun run dev`.
- **Production DB sync is required and manual** (see the `db-schema-push` project
  note). Production never auto-pushes. After the fields land, apply additive DDL
  over the pooler:
  ```sql
  ALTER TABLE "event_registrations" ADD COLUMN IF NOT EXISTS "alumni_class_year" integer;
  ALTER TABLE "event_registrations" ADD COLUMN IF NOT EXISTS "alumni_major" varchar;
  ```
  (Verify the exact column names/types against Payload's generated migration
  before applying.) Without this, "lanjut ke pembayaran" 500s in production.

## Testing (TDD)

- `buildTransferProofMessage`:
  - asserts the `Angkatan: {year}` line appears when `alumniClassYear` is set and
    is absent (no "undefined") when it is not.
  - asserts the `Jurusan: {major}` line appears when `alumniMajor` is set and is
    absent when it is not.
- `notifyProofUploaded`: the fetched registration's `alumniClassYear` /
  `alumniMajor` flow into the sent message.
- Registration create: assert `alumniClassYear` + `alumniMajor` are passed into
  `payload.create` for an alumni registration.
- Server guard: `createRegistrationWithPayment` with `category: 'alumni'` and a
  missing angkatan (and, separately, a missing jurusan) returns
  `{ success: false }` with the respective message, and does NOT create a
  registration.

## Out of scope

- Backfilling angkatan/jurusan for existing alumni registrations.
- Validating the freetext major against a controlled list of majors.
- Alumni fields on the sponsor-registration flow (player/event registration only).
- Making angkatan/jurusan visible on tickets or the PDF.
