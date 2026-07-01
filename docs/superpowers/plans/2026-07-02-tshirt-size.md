# Golf T-Shirt Size Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture a required golf T-shirt size (S/M/L/XL/XXL) on event registration, stored on the registration, shown in admin, and included in the transfer-proof WhatsApp alert.

**Architecture:** A required `select` field `tshirtSize` on `EventRegistrations`, threaded through the registration form and every create path, plus one line in the transfer-proof WhatsApp message. New nullable Postgres enum column, synced to prod manually.

**Tech Stack:** Payload CMS 3, Next.js 15, TypeScript, Vitest (`bun run test:int`), Postgres.

## Global Constraints

- Package manager **bun**. TDD (failing test first). Tests in `tests/int/`.
- Copy is Bahasa Indonesia. Field label "Ukuran Kaos Golf"; WA line "Ukuran kaos: {size}".
- Options S/M/L/XL/XXL, value === label.
- DB column `tshirt_size` is **nullable** (Payload `required` is app-level). Prod DB does NOT auto-push — a manual additive DDL sync is required (Task 6).
- After collection field changes, run `bun run generate:types`.

---

### Task 1: Add the `tshirtSize` collection field + regenerate types

**Files:**
- Modify: `src/collections/EventRegistrations/index.ts` (Registrant tab, after the `phone` field ~line 132)
- Modify: `src/payload-types.ts` (regenerated)

**Interfaces:**
- Produces: `EventRegistration.tshirtSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL' | null` (in `payload-types.ts` after regen), and the `tshirt_size` enum column on next local dev push.

- [ ] **Step 1: Add the field** in `src/collections/EventRegistrations/index.ts`, immediately after the `phone` field object (the `{ name: 'phone', type: 'text' }` block in the Registrant tab):

```ts
            {
              name: 'tshirtSize',
              type: 'select',
              required: true,
              label: 'Ukuran Kaos Golf',
              options: [
                { label: 'S', value: 'S' },
                { label: 'M', value: 'M' },
                { label: 'L', value: 'L' },
                { label: 'XL', value: 'XL' },
                { label: 'XXL', value: 'XXL' },
              ],
              admin: { description: 'Ukuran kaos golf peserta' },
            },
```

- [ ] **Step 2: Regenerate types**

Run: `bun run generate:types`
Expected: completes; `src/payload-types.ts` now contains `tshirtSize?:` on the EventRegistration type.

- [ ] **Step 3: Verify types + typecheck**

Run: `grep -n "tshirtSize" src/payload-types.ts`
Expected: at least one match (the field on `EventRegistration`).
Run: `npx tsc --noEmit 2>&1 | grep -v golf-collections | grep "error TS"`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/collections/EventRegistrations/index.ts src/payload-types.ts
git commit -m "feat(registration): add required tshirtSize select field"
```

---

### Task 2: Add T-shirt size to the transfer-proof WhatsApp message

**Files:**
- Modify: `src/utilities/whatsapp/messages.ts` (`buildTransferProofMessage`)
- Test: `tests/int/whatsapp-messages.int.spec.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `buildTransferProofMessage(input: { id: number|string; playerName?: string; eventTitle?: string; amountDue?: number|null; tshirtSize?: string }, baseUrl: string): string` — adds an `Ukuran kaos: {size}` line only when `tshirtSize` is set.

- [ ] **Step 1: Write the failing tests** (add inside the existing describe in `tests/int/whatsapp-messages.int.spec.ts`):

```ts
  it('transfer proof message includes tshirt size when present', () => {
    const m = buildTransferProofMessage(
      { id: 20, playerName: 'Sita', eventTitle: 'Polinema Cup', amountDue: 4000000, tshirtSize: 'L' },
      BASE,
    )
    expect(m).toContain('Ukuran kaos: L')
  })

  it('transfer proof message omits the tshirt line (no "undefined") when size is absent', () => {
    const m = buildTransferProofMessage({ id: 20, playerName: 'Sita' }, BASE)
    expect(m).not.toContain('Ukuran kaos')
    expect(m).not.toContain('undefined')
  })
```

- [ ] **Step 2: Run to verify they fail**

Run: `bun run test:int tests/int/whatsapp-messages.int.spec.ts`
Expected: FAIL — the "includes tshirt size" test fails (line absent).

- [ ] **Step 3: Implement** — update `buildTransferProofMessage` in `src/utilities/whatsapp/messages.ts`. Change its input type to add `tshirtSize?: string`, and build the lines array conditionally so the size line only appears when set:

```ts
export function buildTransferProofMessage(
  input: { id: number | string; playerName?: string; eventTitle?: string; amountDue?: number | null; tshirtSize?: string },
  baseUrl: string,
): string {
  const lines = [
    '💸 Bukti Transfer Masuk',
    `Ref: reg-${input.id}`,
    `Nama: ${dash(input.playerName)}`,
    `Acara: ${dash(input.eventTitle)}`,
    `Nominal: ${idr(input.amountDue)}`,
  ]
  if (input.tshirtSize) lines.push(`Ukuran kaos: ${input.tshirtSize}`)
  lines.push(`Verifikasi: ${baseUrl}/admin/manual-transfers`)
  return lines.join('\n')
}
```

- [ ] **Step 4: Run to verify pass**

Run: `bun run test:int tests/int/whatsapp-messages.int.spec.ts`
Expected: PASS (all, including the two new tests).

- [ ] **Step 5: Commit**

```bash
git add src/utilities/whatsapp/messages.ts tests/int/whatsapp-messages.int.spec.ts
git commit -m "feat(whatsapp): include tshirt size in transfer-proof alert"
```

---

### Task 3: Pass the size through `notifyProofUploaded`

**Files:**
- Modify: `src/utilities/whatsapp/notifyProofUploaded.ts`
- Test: `tests/int/whatsapp-proof-notifier.int.spec.ts`

**Interfaces:**
- Consumes: `buildTransferProofMessage` with the new `tshirtSize?` (Task 2).
- Produces: `notifyProofUploaded` now reads `tshirtSize` off the fetched registration and passes it to the builder.

- [ ] **Step 1: Write the failing test** (add inside the existing describe in `tests/int/whatsapp-proof-notifier.int.spec.ts`):

```ts
  it('includes the registration tshirt size in the message', async () => {
    const payload = {
      findByID: vi.fn()
        .mockResolvedValueOnce({ id: 20, playerName: 'Sita', amountDue: 4000000, tshirtSize: 'XL', event: 10 })
        .mockResolvedValueOnce({ title: 'Polinema Cup' }),
    }
    await notifyProofUploaded(payload as never, 20)
    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock.mock.calls[0][0]).toContain('Ukuran kaos: XL')
  })
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun run test:int tests/int/whatsapp-proof-notifier.int.spec.ts`
Expected: FAIL — message lacks the tshirt line.

- [ ] **Step 3: Implement** in `src/utilities/whatsapp/notifyProofUploaded.ts`: add `tshirtSize` to the `reg` cast type and pass it to the builder. Change the `reg` type annotation to include `tshirtSize?: string` and the final call:

```ts
  const reg = (await payload.findByID({
    collection: 'event-registrations',
    id: registrationId,
    depth: 0,
  })) as { id: number; playerName?: string; amountDue?: number | null; event?: unknown; tshirtSize?: string } | null
```
```ts
  await sendWhatsAppNotification(
    buildTransferProofMessage(
      { id: reg.id, playerName: reg.playerName, amountDue: reg.amountDue, eventTitle, tshirtSize: reg.tshirtSize },
      baseUrl,
    ),
  )
```

- [ ] **Step 4: Run to verify pass**

Run: `bun run test:int tests/int/whatsapp-proof-notifier.int.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utilities/whatsapp/notifyProofUploaded.ts tests/int/whatsapp-proof-notifier.int.spec.ts
git commit -m "feat(whatsapp): pass tshirt size into proof-upload notifier"
```

---

### Task 4: Thread the size through `issueManualRegistration`

**Files:**
- Modify: `src/utilities/registration/issueManualRegistration.ts`
- Test: `tests/int/manual-registration.int.spec.ts`

**Interfaces:**
- Produces: `issueManualRegistration` input gains `tshirtSize?: 'S'|'M'|'L'|'XL'|'XXL'`; it is written into the `payload.create` data.

- [ ] **Step 1: Write the failing test** — inspect `tests/int/manual-registration.int.spec.ts` for its existing mock/DI pattern, then add a test asserting `tshirtSize` reaches `payload.create`. Use the file's existing helpers; the shape below matches the util's DI:

```ts
  it('persists the tshirt size on the created registration', async () => {
    const created: Record<string, unknown>[] = []
    const payload = {
      findByID: vi.fn().mockResolvedValue({ id: 10, slug: 'e', date: '2026-08-01', price: 1000, alumniPrice: 1000, category: 'general' }),
      create: vi.fn().mockImplementation((args: { data: Record<string, unknown> }) => { created.push(args.data); return Promise.resolve({ id: 1 }) }),
    }
    await issueManualRegistration(
      { payload: payload as never, mintToken: () => 'tok' },
      { eventId: 10, playerName: 'A', email: 'a@b.id', category: 'general', tshirtSize: 'M' },
    )
    expect(created[0]).toMatchObject({ tshirtSize: 'M' })
  })
```

(If the existing tests reference a different event-lookup shape, mirror theirs — the key assertion is `created[0].tshirtSize === 'M'`.)

- [ ] **Step 2: Run to verify it fails**

Run: `bun run test:int tests/int/manual-registration.int.spec.ts`
Expected: FAIL — created data has no `tshirtSize`.

- [ ] **Step 3: Implement** in `src/utilities/registration/issueManualRegistration.ts`: add `tshirtSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL'` to the input type, and add `tshirtSize: input.tshirtSize,` to the `data` object of its `payload.create({ collection: 'event-registrations', data: { ... } })`.

- [ ] **Step 4: Run to verify pass**

Run: `bun run test:int tests/int/manual-registration.int.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utilities/registration/issueManualRegistration.ts tests/int/manual-registration.int.spec.ts
git commit -m "feat(registration): persist tshirt size in manual registration"
```

---

### Task 5: Form field + register-action threading

**Files:**
- Modify: `src/app/(frontend)/register/event/[eventSlug]/actions.ts`
- Modify: `src/app/(frontend)/register/event/[eventSlug]/EventRegistrationForm.tsx`

**Interfaces:**
- Consumes: `issueManualRegistration` with `tshirtSize` (Task 4); `RegistrationFormData`.
- Produces: end-to-end capture — the form's selected size reaches both create paths.

- [ ] **Step 1: Extend `RegistrationFormData` and both create paths** in `actions.ts`:
  - Add to the type (after `category`): `tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL'`
  - In the manual branch `issueManualRegistration(..., { ... })` call, add `tshirtSize: data.tshirtSize,` to the second argument object.
  - In the legacy Xendit `payload.create({ collection: 'event-registrations', data: { ... } })`, add `tshirtSize: data.tshirtSize,` to `data`.

- [ ] **Step 2: Add the select to the form** in `EventRegistrationForm.tsx`, inside the "Detail Pendaftaran" section (after the `category` select block, before or after Notes). It must be a required native select named `tshirtSize`:

```tsx
          <div>
            <label htmlFor="tshirtSize" className="mb-2 block text-sm text-gray-600">
              Ukuran Kaos Golf *
            </label>
            <select
              id="tshirtSize"
              name="tshirtSize"
              required
              defaultValue=""
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Pilih ukuran
              </option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
```
(Match the exact className/label styling of the sibling `category` field in this file rather than the sample above if they differ.)

- [ ] **Step 3: Read it in the submit handler** — in `handleSubmit`, where the object is built for `createRegistrationWithPayment({ ... })`, add:

```ts
        tshirtSize: formData.get('tshirtSize') as RegistrationFormData['tshirtSize'],
```

- [ ] **Step 4: Typecheck + full suite**

Run: `npx tsc --noEmit 2>&1 | grep -v golf-collections | grep "error TS"`
Expected: no output.
Run: `bun run test:int`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(frontend)/register/event/[eventSlug]/actions.ts" "src/app/(frontend)/register/event/[eventSlug]/EventRegistrationForm.tsx"
git commit -m "feat(registration): tshirt size form field + action threading"
```

---

### Task 6: Local schema push + production DB sync + deploy

**Files:** none (ops + DB).

- [ ] **Step 1: Push the column to the LOCAL dev DB**

Run `bun run dev` once (it auto-pushes the schema); wait for it to boot, then stop it. Verify locally:
```bash
psql "$(grep -E '^DATABASE_URI=' .env.local | head -1 | cut -d= -f2- | tr -d '"' | sed -E 's/\?.*$//')" -tA -c "SELECT column_name FROM information_schema.columns WHERE table_name='event_registrations' AND column_name='tshirt_size';"
```
Expected: `tshirt_size`.

- [ ] **Step 2: Confirm the enum type name Payload generated** (so prod DDL matches exactly)

```bash
psql "$(grep -E '^DATABASE_URI=' .env.local | head -1 | cut -d= -f2- | tr -d '"' | sed -E 's/\?.*$//')" -tA -c "SELECT udt_name FROM information_schema.columns WHERE table_name='event_registrations' AND column_name='tshirt_size';"
```
Expected: the enum type name (e.g. `enum_event_registrations_tshirt_size`). Use this exact name in Step 3.

- [ ] **Step 3: Apply additive DDL to PRODUCTION** (nullable column; safe, idempotent). Use the enum name from Step 2:

```bash
PROD_URI=$(grep -E '^DATABASE_URI=' .env | head -1 | cut -d= -f2- | tr -d '"' | sed -E 's/\?.*$//')
psql "$PROD_URI" -v ON_ERROR_STOP=1 -c "
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_event_registrations_tshirt_size') THEN
    CREATE TYPE \"public\".\"enum_event_registrations_tshirt_size\" AS ENUM('S','M','L','XL','XXL');
  END IF;
END \$\$;
ALTER TABLE \"event_registrations\" ADD COLUMN IF NOT EXISTS \"tshirt_size\" \"enum_event_registrations_tshirt_size\";"
```

- [ ] **Step 4: Verify prod**

```bash
psql "$PROD_URI" -tA -c "SELECT column_name FROM information_schema.columns WHERE table_name='event_registrations' AND column_name='tshirt_size';"
```
Expected: `tshirt_size`.

- [ ] **Step 5: Merge to `main` and deploy** (per finishing-a-development-branch). After deploy Ready, smoke-test: register on the live site, choose a size, confirm "lanjut ke pembayaran" works and the size shows on the admin registration doc.

---

## Self-Review

**Spec coverage:**
- Required select field S/M/L/XL/XXL → Task 1 ✓
- Form select (required) → Task 5 ✓
- Threaded through create paths (manual + Xendit) → Tasks 4 (util) + 5 (action/form) ✓
- WhatsApp transfer-proof line → Tasks 2 + 3 ✓
- Types regenerated → Task 1 ✓
- Nullable column, prod manual sync → Task 6 ✓
- Tests (builder, notifier, manual-registration create) → Tasks 2, 3, 4 ✓

**Placeholder scan:** none — concrete code/commands throughout. (Task 4/5 note "mirror existing pattern" but give the exact assertion/field to add.)

**Type consistency:** `tshirtSize` typed `'S'|'M'|'L'|'XL'|'XXL'` in field options (Task 1), issueManualRegistration input (Task 4), and RegistrationFormData (Task 5); the builder/notifier accept the looser `tshirtSize?: string` (Tasks 2-3) since they only render it. Consistent.
