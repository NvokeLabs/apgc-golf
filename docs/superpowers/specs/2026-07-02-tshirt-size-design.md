# Golf T-Shirt Size on Event Registration — Design

- **Date:** 2026-07-02
- **Status:** Approved (pending spec review)
- **Branch:** `feat/tshirt-size`

## Goal

Capture the registrant's golf T-shirt size (S/M/L/XL/XXL) during event
registration so the organizer can prep shirts. Required on the public form,
stored on the registration, visible in admin, and surfaced in the transfer-proof
WhatsApp alert.

## Field

- Name: `tshirtSize` on the `event-registrations` collection (Registrant tab).
- Type: `select`, `required: true`.
- Label: **"Ukuran Kaos Golf"**. `admin.description`: "Ukuran kaos golf peserta".
- Options (value === label): `S`, `M`, `L`, `XL`, `XXL`.

## Where it's wired

1. **Collection** — `src/collections/EventRegistrations/index.ts`: add the select
   field in the Registrant tab (near `phone`/`notes`).
2. **Form** — `src/app/(frontend)/register/event/[eventSlug]/EventRegistrationForm.tsx`:
   a required `<select name="tshirtSize">` in the "Detail Pendaftaran" section
   (mirror the existing `category` select), placeholder "Pilih ukuran", options
   S–XXL. HTML `required` for client-side validation.
3. **Create paths** — thread `tshirtSize` through EVERY registration-create path
   so it persists regardless of payment method:
   - `src/app/(frontend)/register/event/[eventSlug]/actions.ts`: add
     `tshirtSize` to `RegistrationFormData` and pass it in every `payload.create`
     / branch (card + manual).
   - `src/utilities/registration/issueManualRegistration.ts`: accept `tshirtSize`
     in its input and include it in its `payload.create`.
4. **WhatsApp** — `src/utilities/whatsapp/messages.ts`: `buildTransferProofMessage`
   input gains optional `tshirtSize?: string`; when present, add a line
   `Ukuran kaos: {size}`. `src/utilities/whatsapp/notifyProofUploaded.ts` already
   fetches the registration — read `tshirtSize` from it and pass to the builder.
5. **Types** — run `bun run generate:types` after the field is added so
   `payload-types.ts` includes `tshirtSize`.

## Data / DB

- Payload generates a Postgres enum column `tshirt_size` of type
  `enum_event_registrations_tshirt_size` (values S,M,L,XL,XXL).
- The DB column is **nullable** — Payload enforces `required` at the app layer,
  not via DB `NOT NULL`. Existing registrations predate the field and keep
  `NULL`; only new registrations must choose. No data backfill.
- **Production DB sync is required and manual.** Local dev auto-pushes the
  column; production does NOT (see the `db-schema-push` project note). After the
  field lands, apply additive DDL to prod via `psql` over the pooler:
  ```sql
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_event_registrations_tshirt_size') THEN
      CREATE TYPE "public"."enum_event_registrations_tshirt_size" AS ENUM('S','M','L','XL','XXL');
    END IF;
  END $$;
  ALTER TABLE "event_registrations" ADD COLUMN IF NOT EXISTS "tshirt_size" "enum_event_registrations_tshirt_size";
  ```
  (Verify the exact type name/values against Payload's generated migration before
  applying; the values above match the field options.) Without this, "lanjut ke
  pembayaran" 500s in production.

## Testing (TDD)

- `buildTransferProofMessage`: asserts the `Ukuran kaos: {size}` line appears
  when `tshirtSize` is set, and is absent (no "undefined") when it is not.
- `notifyProofUploaded`: the fetched registration's `tshirtSize` flows into the
  sent message.
- Registration create: extend `tests/int/manual-registration.int.spec.ts` (and
  the card path where covered) to assert `tshirtSize` is passed into
  `payload.create`.

## Out of scope

- Backfilling shirt size for existing registrations.
- Size on the sponsor-registration flow (this is player/event registration only).
- Inventory/stock tracking of shirts.
