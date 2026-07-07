# Restricted "Registration Staff" Role — Design

- **Date:** 2026-07-07
- **Status:** Approved
- **Branch:** `feat/registration-staff-role`

## Goal

Add a restricted admin account (`pendaftaran@polinemagolf.com`) that can ONLY:
open/view tickets, verify payments (manual bank-transfer approve/reject), and
scan tickets (check-in). Everything else is hidden from it. Existing admins keep
full access, unchanged.

## Role model

Add a `role` select to the `Users` collection:
- Options: `admin` (label "Administrator"), `registration-staff` (label "Petugas Pendaftaran").
- `defaultValue: 'admin'`, `saveToJWT: true`.
- The DB column is **nullable** (NOT a `required` field) — same reason as the
  alumni/tshirt columns: a `NOT NULL` alter would fail on existing rows and break
  dev auto-push. Existing rows are backfilled to `'admin'` (see DB section).
- The `role` field's own field-level `access.update` allows a change only for a
  NON-staff user (so a staff account can never self-promote even if it reached
  the Users update endpoint).

**Enforcement posture — default-allow, explicit-deny.** The only restricted
identity is a user whose role is exactly `registration-staff`. Everyone else
(admins, null role, new users) keeps full access. This is safe against a missed
backfill (no existing admin can be locked out) and constrains only the new
account. A single pure helper drives every gate:

```ts
// src/access/roles.ts
export const isRegistrationStaff = (user?: { role?: string | null } | null): boolean =>
  user?.role === 'registration-staff'
```

## Enforcement points (scope: "just hide the tools")

1. **Custom Nav** (`src/components/admin/Nav`): today a hardcoded client array. It
   reads the current user via `useAuth()` from `@payloadcms/ui` and, for a
   `registration-staff` user, filters the menu to a whitelist: **Tickets**,
   **Check-in**, **Manual Transfers**. The filtering is a pure function
   `visibleMenuGroups(groups, role)` (unit-tested); the component stays thin.
2. **Check-in route** (`src/app/(payload)/api/check-in/validate/route.ts`):
   currently has NO auth at all. Add `payload.auth({ headers })`, reject when
   there is no user (401), and set `checkedInBy: user.id` on the ticket update
   (completing the existing TODO). Both roles may scan.
3. **Approve / reject routes** (`api/manual-transfers/approve` + `reject`):
   already require a logged-in user; both roles may verify payments, so their
   existing `!user → 401` guard is sufficient — no role restriction added.
4. **Dashboard API** (`src/app/(payload)/api/admin/dashboard/route.ts`): deny a
   `registration-staff` user (403) so revenue/aggregate stats stay hidden.
5. **Collection admin visibility**: set
   `admin.hidden: ({ user }) => isRegistrationStaff(user)` on every collection
   EXCEPT `tickets` and `event-registrations`, so the staff admin surface shows
   only what the three tasks need. (This is UI hiding, per the chosen "just hide
   the tools" scope; the raw REST API for other collections is intentionally NOT
   locked down — an accepted tradeoff, except Users below.)
6. **Users collection (data-layer exception, security-critical):**
   - `access.create/update/delete`: denied for staff (`!isRegistrationStaff(user)`)
     — prevents creating/editing users and self-promotion.
   - `access.read`: admins read all; a staff user reads only their own record
     (`{ id: { equals: user.id } }`) so they can still load their account menu
     but cannot enumerate other users' PII.
   - `admin.hidden` for staff, and the `role` field update gated as above.
   - `access.admin` stays `authenticated` (both roles may open the panel).

## Data / DB

- New nullable enum column `role` (`enum_users_role`, values `admin`,
  `registration-staff`) on `users`.
- **Local**: dev/test boot auto-pushes it.
- **Production (manual)**: create the enum type + add the nullable column, then
  backfill existing rows:
  ```sql
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_users_role') THEN
      CREATE TYPE "public"."enum_users_role" AS ENUM('admin','registration-staff');
    END IF;
  END $$;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "enum_users_role";
  UPDATE "users" SET "role" = 'admin' WHERE "role" IS NULL;
  ```
  (Verify names/values against Payload's generated migration first.)

## Account creation

After the code + prod column land, create the account against PROD via a Payload
script (so the password is hashed by Payload): email
`pendaftaran@polinemagolf.com`, password `pendaftaran123`, `role:
'registration-staff'`, name "Petugas Pendaftaran". The password can be changed
later in admin. (This is an operational step run by the controller, not part of
the test suite.)

## Testing (TDD)

- `isRegistrationStaff(user)` — true only for role `registration-staff`; false
  for `admin`, null role, undefined user.
- `visibleMenuGroups(groups, role)` — staff gets only the Tickets / Check-in /
  Manual Transfers whitelist; admin (and null) get the full set unchanged.
- Users access functions — staff denied create/update/delete; staff read returns
  the self-constraint object; admin unrestricted. `role` field update denied for
  staff.
- The route/dashboard wiring is verified by `bunx tsc --noEmit` + the existing
  suite (server routes calling `getPayload` are not unit-harnessed here).

## Out of scope

- Full data-layer lockdown of all collections (chosen scope is "just hide the
  tools"; the Users collection is the sole data-layer exception).
- Touching the public ticket-PDF link (intentionally public for registrant
  self-service).
- Any second restricted role or granular per-permission system.
