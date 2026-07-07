# Alumni Fields (Angkatan + Jurusan) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture an alumni registrant's angkatan (class year) and jurusan (major) during event registration — required for alumni only, hidden for general — stored, shown in admin, and surfaced in the transfer-proof WhatsApp alert.

**Architecture:** Two new optional collection fields (`alumniClassYear` number, `alumniMajor` text) on `event-registrations`, conditionally shown in admin. The public form gains client state to reveal + require the fields when category is Alumni; a server guard re-checks. Both fields thread through the manual-registration create path and the WhatsApp message builder.

**Tech Stack:** Payload CMS 3.64, Next.js 15.4 App Router, React 19, PostgreSQL (Supabase), TypeScript, Vitest, bun.

## Global Constraints

- Both collection fields are **optional** (nullable DB columns). "Required for alumni" is enforced at the app layer only (form `required` + server guard) — never via DB `NOT NULL`. This mirrors the existing `tshirtSize` field.
- Admin visibility for both fields: `admin.condition: (data) => data?.category === 'alumni'`.
- Field names: `alumniClassYear` (Payload `number`, label "Angkatan"), `alumniMajor` (Payload `text`, label "Jurusan").
- Year dropdown options: current year (`new Date().getFullYear()`, computed at render) down to **1970**, inclusive, descending.
- WhatsApp lines: `Angkatan: {year}` when `alumniClassYear` set; `Jurusan: {major}` when `alumniMajor` non-empty. Both omitted entirely when unset — never emit "undefined".
- Server guard messages (Bahasa Indonesia): missing angkatan → `Angkatan wajib diisi`; missing/blank jurusan → `Jurusan wajib diisi`.
- **Production DB sync is manual** — production never auto-pushes. After merge, apply additive DDL over the pooler (see Task 6). Local dev/test boot auto-pushes.
- Package manager is **bun**. Run tests with `bun run test:int`.

---

### Task 1: Collection fields + generated types + schema test

**Files:**
- Modify: `src/collections/EventRegistrations/index.ts` (Registrant tab, after the `tshirtSize` field, before `notes`)
- Modify: `tests/int/manual-transfer-schema.int.spec.ts` (add a describe block)
- Regenerate: `src/payload-types.ts` (via `bun run generate:types`)

**Interfaces:**
- Produces: two fields on the `event-registrations` collection — `alumniClassYear` (`number`) and `alumniMajor` (`text`), each with `admin.condition` on `category === 'alumni'`. After `generate:types`, `EventRegistration` in `src/payload-types.ts` gains `alumniClassYear?: number | null` and `alumniMajor?: string | null`, so later tasks can put them in `payload.create` data without tsc errors.

- [ ] **Step 1: Write the failing test**

Add this block to `tests/int/manual-transfer-schema.int.spec.ts`, after the closing `})` of the `describe('Story 1: ...')` block (it reuses the file's existing `regField` helper and booted `payload`):

```ts
describe('Alumni fields (angkatan + jurusan)', () => {
  it('has alumniClassYear (number) and alumniMajor (text), conditional on alumni', () => {
    expect(regField('alumniClassYear')?.type).toBe('number')
    expect(regField('alumniMajor')?.type).toBe('text')

    const yearCond = (regField('alumniClassYear') as { admin?: { condition?: (d: unknown) => unknown } })
      .admin?.condition
    expect(yearCond?.({ category: 'alumni' })).toBeTruthy()
    expect(yearCond?.({ category: 'general' })).toBeFalsy()

    const majorCond = (regField('alumniMajor') as { admin?: { condition?: (d: unknown) => unknown } })
      .admin?.condition
    expect(majorCond?.({ category: 'alumni' })).toBeTruthy()
    expect(majorCond?.({ category: 'general' })).toBeFalsy()
  })

  it('persisted the new alumni columns (DB push verified)', async () => {
    await expect(
      payload.find({
        collection: 'event-registrations',
        where: { alumniClassYear: { equals: 2015 } },
        limit: 1,
      }),
    ).resolves.toBeDefined()
    await expect(
      payload.find({
        collection: 'event-registrations',
        where: { alumniMajor: { exists: true } },
        limit: 1,
      }),
    ).resolves.toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int -- manual-transfer-schema`
Expected: FAIL — `regField('alumniClassYear')` is `undefined` (so `.type` is undefined ≠ 'number'); the `payload.find` on `alumniClassYear` may also reject because the column does not exist yet.

- [ ] **Step 3: Add the two fields to the collection**

In `src/collections/EventRegistrations/index.ts`, inside the Registrant tab, insert these two field objects immediately **after** the `tshirtSize` field object and **before** the `notes` field object:

```ts
{
  name: 'alumniClassYear',
  type: 'number',
  // Optional in the DB (nullable). Required for alumni is enforced on the
  // public form + server guard, not via DB NOT NULL — so existing/general
  // registrations stay valid and dev auto-push never trips on null rows.
  label: 'Angkatan',
  admin: {
    description: 'Tahun angkatan alumni',
    condition: (data) => data?.category === 'alumni',
  },
},
{
  name: 'alumniMajor',
  type: 'text',
  label: 'Jurusan',
  admin: {
    description: 'Jurusan alumni',
    condition: (data) => data?.category === 'alumni',
  },
},
```

- [ ] **Step 4: Regenerate Payload types**

Run: `bun run generate:types`
Expected: `src/payload-types.ts` now contains `alumniClassYear?: number | null` and `alumniMajor?: string | null` on the `EventRegistration` interface.

- [ ] **Step 5: Run the test to verify it passes**

Run: `bun run test:int -- manual-transfer-schema`
Expected: PASS. (Booting Payload for the test dev-pushes the two nullable columns to the LOCAL DB, so the `payload.find` filters resolve.)

- [ ] **Step 6: Commit**

```bash
git add src/collections/EventRegistrations/index.ts src/payload-types.ts tests/int/manual-transfer-schema.int.spec.ts
git commit -m "feat(alumni-fields): add alumniClassYear + alumniMajor to registrations"
```

---

### Task 2: WhatsApp transfer-proof message — angkatan + jurusan lines

**Files:**
- Modify: `src/utilities/whatsapp/messages.ts` (`buildTransferProofMessage`)
- Modify: `tests/int/whatsapp-messages.int.spec.ts`

**Interfaces:**
- Consumes: nothing from other tasks (pure function).
- Produces: `buildTransferProofMessage` input type gains `alumniClassYear?: number` and `alumniMajor?: string`. When set, message includes `Angkatan: {year}` and `Jurusan: {major}` lines (placed after the existing `Ukuran kaos` line, before the `Verifikasi` link).

- [ ] **Step 1: Write the failing test**

Add these two tests inside the `describe('whatsapp message builders', ...)` block in `tests/int/whatsapp-messages.int.spec.ts` (after the existing tshirt tests, before the block's closing `})`):

```ts
  it('transfer proof message includes angkatan + jurusan when present', () => {
    const m = buildTransferProofMessage(
      {
        id: 20,
        playerName: 'Sita',
        eventTitle: 'Polinema Cup',
        amountDue: 4000000,
        alumniClassYear: 2015,
        alumniMajor: 'Teknik Sipil',
      },
      BASE,
    )
    expect(m).toContain('Angkatan: 2015')
    expect(m).toContain('Jurusan: Teknik Sipil')
  })

  it('omits angkatan + jurusan lines (no "undefined") when absent', () => {
    const m = buildTransferProofMessage({ id: 20, playerName: 'Sita' }, BASE)
    expect(m).not.toContain('Angkatan')
    expect(m).not.toContain('Jurusan')
    expect(m).not.toContain('undefined')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int -- whatsapp-messages`
Expected: FAIL — the message has no `Angkatan:`/`Jurusan:` lines yet (and the input type lacks those keys).

- [ ] **Step 3: Implement**

In `src/utilities/whatsapp/messages.ts`, update `buildTransferProofMessage`. First extend its input type — add these two lines to the input object type (after `tshirtSize?: string`):

```ts
    alumniClassYear?: number
    alumniMajor?: string
```

Then, in the body, replace the tshirt/verifikasi tail so the two new lines sit between them:

```ts
  if (input.tshirtSize) lines.push(`Ukuran kaos: ${input.tshirtSize}`)
  if (input.alumniClassYear) lines.push(`Angkatan: ${input.alumniClassYear}`)
  if (input.alumniMajor && input.alumniMajor.trim()) lines.push(`Jurusan: ${input.alumniMajor}`)
  lines.push(`Verifikasi: ${baseUrl}/admin/manual-transfers`)
  return lines.join('\n')
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:int -- whatsapp-messages`
Expected: PASS (all tests in the file, including the existing ones).

- [ ] **Step 5: Commit**

```bash
git add src/utilities/whatsapp/messages.ts tests/int/whatsapp-messages.int.spec.ts
git commit -m "feat(alumni-fields): angkatan + jurusan lines in transfer-proof WA message"
```

---

### Task 3: notifyProofUploaded threads alumni fields into the message

**Files:**
- Modify: `src/utilities/whatsapp/notifyProofUploaded.ts`
- Modify: `tests/int/whatsapp-proof-notifier.int.spec.ts`

**Interfaces:**
- Consumes: `buildTransferProofMessage` from Task 2 (now accepts `alumniClassYear?` / `alumniMajor?`).
- Produces: `notifyProofUploaded` reads `alumniClassYear` / `alumniMajor` off the fetched registration and passes them to the builder.

- [ ] **Step 1: Write the failing test**

Add this test inside the `describe('notifyProofUploaded', ...)` block in `tests/int/whatsapp-proof-notifier.int.spec.ts` (before the block's closing `})`):

```ts
  it('includes the registration angkatan + jurusan in the message', async () => {
    const payload = {
      findByID: vi
        .fn()
        .mockResolvedValueOnce({
          id: 20,
          playerName: 'Sita',
          amountDue: 4000000,
          alumniClassYear: 2015,
          alumniMajor: 'Teknik Sipil',
          event: 10,
        })
        .mockResolvedValueOnce({ title: 'Polinema Cup' }),
    }
    await notifyProofUploaded(payload as never, 20)
    expect(sendMock).toHaveBeenCalledTimes(1)
    const msg = sendMock.mock.calls[0][0]
    expect(msg).toContain('Angkatan: 2015')
    expect(msg).toContain('Jurusan: Teknik Sipil')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int -- whatsapp-proof-notifier`
Expected: FAIL — the message lacks the angkatan/jurusan lines because `notifyProofUploaded` does not read or pass those fields.

- [ ] **Step 3: Implement**

In `src/utilities/whatsapp/notifyProofUploaded.ts`:

1. Extend the `reg` cast type — add these two lines to the cast object type (after `tshirtSize?: string`):

```ts
    alumniClassYear?: number
    alumniMajor?: string
```

2. Pass them into the builder — update the `buildTransferProofMessage({ ... })` argument object (after `tshirtSize: reg.tshirtSize,`):

```ts
        alumniClassYear: reg.alumniClassYear,
        alumniMajor: reg.alumniMajor,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:int -- whatsapp-proof-notifier`
Expected: PASS (all tests in the file).

- [ ] **Step 5: Commit**

```bash
git add src/utilities/whatsapp/notifyProofUploaded.ts tests/int/whatsapp-proof-notifier.int.spec.ts
git commit -m "feat(alumni-fields): pass angkatan + jurusan into proof-uploaded WA notify"
```

---

### Task 4: issueManualRegistration persists alumni fields

**Files:**
- Modify: `src/utilities/registration/issueManualRegistration.ts`
- Modify: `tests/int/manual-registration.int.spec.ts`

**Interfaces:**
- Consumes: `EventRegistration` type with `alumniClassYear` / `alumniMajor` (from Task 1's `generate:types`).
- Produces: `ManualRegistrationInput` gains optional `alumniClassYear?: number` and `alumniMajor?: string`; both are written into the created registration's data (`undefined` for general registrations leaves the columns null). The `actions.ts` caller in Task 5 relies on these input keys.

- [ ] **Step 1: Write the failing test**

Add this test inside the `describe('issueManualRegistration', ...)` block in `tests/int/manual-registration.int.spec.ts` (before the block's closing `})`):

```ts
  it('persists alumni angkatan + jurusan on the created registration', async () => {
    const { deps, create } = makeDeps()
    await issueManualRegistration(deps, {
      ...input,
      category: 'alumni',
      alumniClassYear: 2015,
      alumniMajor: 'Teknik Sipil',
    })

    const created = create.mock.calls[0][0].data
    expect(created).toMatchObject({ alumniClassYear: 2015, alumniMajor: 'Teknik Sipil' })
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int -- manual-registration`
Expected: FAIL — `created` has no `alumniClassYear` / `alumniMajor` (the source does not accept or write them). It may also be a tsc/type error on the extra input keys.

- [ ] **Step 3: Implement**

In `src/utilities/registration/issueManualRegistration.ts`:

1. Extend `ManualRegistrationInput` — add these two lines to the type (after `tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL'`):

```ts
  alumniClassYear?: number
  alumniMajor?: string
```

2. Write them into the create data — add these two lines to the `data: { ... }` object in `payload.create` (after `tshirtSize: input.tshirtSize,`):

```ts
      alumniClassYear: input.alumniClassYear,
      alumniMajor: input.alumniMajor || undefined,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:int -- manual-registration`
Expected: PASS (all tests in the file).

- [ ] **Step 5: Commit**

```bash
git add src/utilities/registration/issueManualRegistration.ts tests/int/manual-registration.int.spec.ts
git commit -m "feat(alumni-fields): persist angkatan + jurusan in manual registration"
```

---

### Task 5: Alumni server guard + actions wiring

**Files:**
- Create: `src/utilities/registration/alumniFieldError.ts`
- Create: `tests/int/alumni-field-error.int.spec.ts`
- Modify: `src/app/(frontend)/register/event/[eventSlug]/actions.ts`

**Interfaces:**
- Consumes: `issueManualRegistration` input keys `alumniClassYear` / `alumniMajor` (Task 4).
- Produces: `alumniFieldError(data)` — a pure validator returning a Bahasa error string or `null`. `RegistrationFormData` gains `alumniClassYear?: number` and `alumniMajor?: string`; the server action rejects an alumni registration missing either, and threads both fields into every create path. The form (Task 6) sets these fields.

- [ ] **Step 1: Write the failing test**

Create `tests/int/alumni-field-error.int.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { alumniFieldError } from '@/utilities/registration/alumniFieldError'

describe('alumniFieldError', () => {
  it('returns null for a general registration (fields irrelevant)', () => {
    expect(alumniFieldError({ category: 'general' })).toBeNull()
    expect(alumniFieldError({ category: 'general', alumniClassYear: undefined })).toBeNull()
  })

  it('requires angkatan for alumni', () => {
    expect(alumniFieldError({ category: 'alumni', alumniMajor: 'Teknik Sipil' })).toBe(
      'Angkatan wajib diisi',
    )
  })

  it('requires jurusan for alumni (blank/whitespace is missing)', () => {
    expect(alumniFieldError({ category: 'alumni', alumniClassYear: 2015 })).toBe(
      'Jurusan wajib diisi',
    )
    expect(
      alumniFieldError({ category: 'alumni', alumniClassYear: 2015, alumniMajor: '   ' }),
    ).toBe('Jurusan wajib diisi')
  })

  it('returns null when an alumni supplies both fields', () => {
    expect(
      alumniFieldError({ category: 'alumni', alumniClassYear: 2015, alumniMajor: 'Teknik Sipil' }),
    ).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int -- alumni-field-error`
Expected: FAIL — module `@/utilities/registration/alumniFieldError` does not exist.

- [ ] **Step 3: Implement the validator**

Create `src/utilities/registration/alumniFieldError.ts`:

```ts
/**
 * App-layer guard for the alumni-only fields. The DB columns are nullable, so
 * "required for alumni" is enforced here (and on the form). Returns a
 * Bahasa Indonesia error string, or null when the input is acceptable.
 */
export function alumniFieldError(data: {
  category: string
  alumniClassYear?: number
  alumniMajor?: string
}): string | null {
  if (data.category !== 'alumni') return null
  if (!data.alumniClassYear) return 'Angkatan wajib diisi'
  if (!data.alumniMajor || !data.alumniMajor.trim()) return 'Jurusan wajib diisi'
  return null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:int -- alumni-field-error`
Expected: PASS.

- [ ] **Step 5: Wire into the server action**

In `src/app/(frontend)/register/event/[eventSlug]/actions.ts`:

1. Add the import (with the other `@/utilities` imports near the top):

```ts
import { alumniFieldError } from '@/utilities/registration/alumniFieldError'
```

2. Extend `RegistrationFormData` — add these two lines (after `tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL'`):

```ts
  alumniClassYear?: number
  alumniMajor?: string
```

3. Add the guard immediately **after** the existing `tshirtSize` guard block (after its closing `}`), before `const method = ...`:

```ts
    // Alumni must supply angkatan + jurusan. The form enforces this client-side
    // when Alumni is chosen; re-check on the server for JS-bypassed callers.
    const alumniErr = alumniFieldError({
      category: data.category,
      alumniClassYear: data.alumniClassYear,
      alumniMajor: data.alumniMajor,
    })
    if (alumniErr) {
      return { success: false, error: alumniErr }
    }
```

4. Thread both fields into the **manual** branch — add these two lines to the `issueManualRegistration(...)` input object (after `tshirtSize: data.tshirtSize,`):

```ts
          alumniClassYear: data.alumniClassYear,
          alumniMajor: data.alumniMajor,
```

5. Thread both fields into the **legacy Xendit** branch — add these two lines to the `payload.create({ collection: 'event-registrations', data: { ... } })` object (after `tshirtSize: data.tshirtSize,`):

```ts
        alumniClassYear: data.alumniClassYear,
        alumniMajor: data.alumniMajor || undefined,
```

- [ ] **Step 6: Verify the full int suite + types**

Run: `bun run test:int`
Expected: PASS (all existing + new tests).
Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(frontend)/register/event/[eventSlug]/actions.ts" src/utilities/registration/alumniFieldError.ts tests/int/alumni-field-error.int.spec.ts
git commit -m "feat(alumni-fields): server guard + thread angkatan/jurusan through create paths"
```

---

### Task 6: Public form — conditional angkatan + jurusan inputs

**Files:**
- Modify: `src/app/(frontend)/register/event/[eventSlug]/EventRegistrationForm.tsx`

**Interfaces:**
- Consumes: `RegistrationFormData.alumniClassYear` / `alumniMajor` and the server guard (Task 5).
- Produces: the rendered form — when category is Alumni, two required inputs (`alumniClassYear` year select, `alumniMajor` text) appear and their values are submitted.

Note on testing: this is a `'use client'` presentational component with no unit harness in the repo. It is verified by `bunx tsc --noEmit` and a manual dev-server check (steps below). No Vitest test is added.

- [ ] **Step 1: Add category state + year list**

In `src/app/(frontend)/register/event/[eventSlug]/EventRegistrationForm.tsx`, inside the component body, after the existing `const [error, setError] = useState<string | null>(null)` line, add:

```tsx
  const [category, setCategory] = useState('general')
  const currentYear = new Date().getFullYear()
  const angkatanYears = Array.from(
    { length: currentYear - 1970 + 1 },
    (_, i) => currentYear - i,
  )
```

- [ ] **Step 2: Send the new fields in handleSubmit**

In `handleSubmit`, update the `createRegistrationWithPayment({ ... })` call — add these lines after `tshirtSize: formData.get('tshirtSize') as RegistrationFormData['tshirtSize'],`:

```tsx
        alumniClassYear: formData.get('alumniClassYear')
          ? Number(formData.get('alumniClassYear'))
          : undefined,
        alumniMajor: (formData.get('alumniMajor') as string) || undefined,
```

- [ ] **Step 3: Wire the category select to state**

In the category `<select>`, add an `onChange` handler and a default value. Change the opening tag from:

```tsx
            <select
              id="category"
              name="category"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
            >
```

to:

```tsx
            <select
              id="category"
              name="category"
              required
              defaultValue="general"
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
            >
```

- [ ] **Step 4: Render the conditional alumni fields**

In the "Registration Details" grid, immediately **after** the closing `</div>` of the `tshirtSize` field block (the `<div className="sm:col-span-2">` that wraps the tshirt select) and **before** the grid's closing `</div>`, insert:

```tsx
          {category === 'alumni' && (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="alumniClassYear" className="mb-2 block text-sm text-gray-600">
                  Angkatan *
                </label>
                <select
                  id="alumniClassYear"
                  name="alumniClassYear"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
                >
                  <option value="" disabled>
                    Pilih angkatan
                  </option>
                  {angkatanYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="alumniMajor" className="mb-2 block text-sm text-gray-600">
                  Jurusan *
                </label>
                <input
                  type="text"
                  id="alumniMajor"
                  name="alumniMajor"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
                  placeholder="Contoh: Teknik Sipil"
                />
              </div>
            </>
          )}
```

- [ ] **Step 5: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual verification (dev server)**

Run: `bun run dev`, open an event registration page. Verify: (a) with **Umum** selected, no angkatan/jurusan fields show; (b) selecting **Alumni** reveals both; (c) the year dropdown starts at the current year and descends to 1970; (d) submitting as Alumni without a year/jurusan is blocked by the browser; (e) a completed alumni submission reaches the upload page. Stop the dev server when done.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(frontend)/register/event/[eventSlug]/EventRegistrationForm.tsx"
git commit -m "feat(alumni-fields): conditional angkatan + jurusan inputs on registration form"
```

---

## Post-implementation: production DB sync (manual, after merge)

Production never auto-pushes schema. After this branch merges and before/right after the deploy, apply additive DDL over the Supabase pooler (strip any `?pgbouncer` param from the connection string):

```sql
ALTER TABLE "event_registrations" ADD COLUMN IF NOT EXISTS "alumni_class_year" integer;
ALTER TABLE "event_registrations" ADD COLUMN IF NOT EXISTS "alumni_major" varchar;
```

Verify the exact generated column names/types against Payload's output first (`bunx payload migrate:create` in a scratch checkout, or inspect the local columns after Task 1). Without this, "lanjut ke pembayaran" 500s in production for any registration. See the `db-schema-push` project memory note.
