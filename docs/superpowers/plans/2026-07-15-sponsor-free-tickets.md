# Sponsor Free Tickets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin or registration-staff user issue a free event ticket to a sponsor's guest from the admin panel — selecting a sponsor instead of uploading a payment proof.

**Architecture:** A sponsor ticket is a normal `EventRegistration` with `paymentMethod: 'sponsor'`, `paymentStatus: 'paid'`, `amountDue: 0`, and a new `sponsor` relationship. A new utility `issueSponsorRegistration` creates that registration and delegates to the existing `issueTicketForRegistration` (QR + PDF + Resend email + `ticketEmailSent`). A new `POST /api/sponsor-tickets` route (auth-gated) drives it, and a new admin view `/admin/sponsor-tickets` provides the form. Check-in, ticket PDF, dashboard counts and every list view keep working untouched.

**Tech Stack:** Payload CMS 3.64, Next.js 15.4 App Router, React 19, PostgreSQL (Supabase), TypeScript, Vitest (`bun run test:int`), bun.

Spec: `docs/superpowers/specs/2026-07-15-sponsor-free-tickets-design.md`
Branch: `feat/sponsor-free-tickets` (already created, spec already committed).

## Global Constraints

- **Package manager is bun.** `bun install`, `bun add`, `bun run <script>`. Never npm/yarn/pnpm.
- **No Payload migrations.** Schema syncs via dev auto-push: after changing a collection field you MUST run `bun run dev` once (let it boot, then Ctrl-C) to push the column before `bun run build` or the int tests will fail with `column <x> does not exist`.
- **After any collection/field change**, run `bun run generate:types` to regenerate `src/payload-types.ts`.
- **After adding an admin component/view**, run `bun run generate:importmap`.
- **All Payload IDs in this codebase are `number`, not `string`.** Every signature below uses `number`.
- **TDD.** Failing test first, minimal implementation, then commit. Tests live in `tests/int/*.int.spec.ts`, run with `bun run test:int`.
- Int tests boot a real Payload against local Supabase Postgres (see `docs/local-supabase-setup.md`). It must be running.
- Prettier runs on commit via lint-staged. Don't fight it.

---

### Task 1: Schema — `sponsor` relationship + `sponsor` payment method

**Files:**
- Modify: `src/collections/EventRegistrations/index.ts:195-205` (the `paymentMethod` select, inside the `Payment` tab)
- Modify: `src/collections/EventRegistrations/index.ts` (add the `sponsor` field right after `paymentMethod`)
- Test: `tests/int/sponsor-ticket-schema.int.spec.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: the `event-registrations.sponsor` relationship field (`relationTo: 'sponsors'`) and the `sponsor` option on `paymentMethod`. Tasks 2 and 4 write/read these.

- [ ] **Step 1: Write the failing test**

Create `tests/int/sponsor-ticket-schema.int.spec.ts`. It mirrors `tests/int/manual-transfer-schema.int.spec.ts` — booting Payload with the postgres adapter also pushes the schema, so the `payload.find` query at the end doubles as proof the column exists.

```ts
import { getPayload, type Payload } from 'payload'
import type { Field } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

/**
 * Sponsor free tickets — schema foundation.
 *
 * A sponsor ticket is a normal EventRegistration with paymentMethod 'sponsor'
 * and a `sponsor` relationship. No quota field exists anywhere by design.
 */

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

/** Recursively flatten Payload fields through tabs / rows / collapsibles / groups. */
function flattenFields(fields: Field[]): Field[] {
  const out: Field[] = []
  for (const field of fields) {
    out.push(field)
    if (field.type === 'tabs') {
      for (const tab of field.tabs) out.push(...flattenFields(tab.fields))
    } else if ('fields' in field && Array.isArray(field.fields)) {
      out.push(...flattenFields(field.fields))
    }
  }
  return out
}

function regField(name: string): Field | undefined {
  const fields = payload.collections['event-registrations'].config.fields
  return flattenFields(fields).find((f) => 'name' in f && f.name === name)
}

describe('EventRegistrations sponsor fields', () => {
  it('paymentMethod gains a "sponsor" option alongside the existing ones', () => {
    const field = regField('paymentMethod')
    expect(field?.type).toBe('select')
    const values = (field as { options: { value: string }[] }).options.map((o) => o.value)
    expect(values).toEqual(
      expect.arrayContaining(['bank-transfer', 'credit-card', 'cash', 'sponsor']),
    )
  })

  it('has a sponsor relationship pointing at the sponsors collection', () => {
    const field = regField('sponsor')
    expect(field?.type).toBe('relationship')
    expect((field as { relationTo: string }).relationTo).toBe('sponsors')
  })

  it('shows the sponsor field only when paymentMethod is sponsor', () => {
    const condition = (regField('sponsor') as { admin?: { condition?: (d: unknown) => unknown } })
      .admin?.condition
    expect(condition?.({ paymentMethod: 'sponsor' })).toBeTruthy()
    expect(condition?.({ paymentMethod: 'bank-transfer' })).toBeFalsy()
  })

  it('persisted the sponsor column (DB push verified)', async () => {
    // Touches the new join column; without the push this throws at the DB layer.
    await expect(
      payload.find({
        collection: 'event-registrations',
        where: { sponsor: { exists: true } },
        limit: 1,
      }),
    ).resolves.toBeDefined()
    await expect(
      payload.find({
        collection: 'event-registrations',
        where: { paymentMethod: { equals: 'sponsor' } },
        limit: 1,
      }),
    ).resolves.toBeDefined()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:int -- sponsor-ticket-schema`
Expected: FAIL — `expected [ 'bank-transfer', 'credit-card', 'cash' ] to include 'sponsor'` and `expected undefined to be 'relationship'`.

- [ ] **Step 3: Add the option and the field**

In `src/collections/EventRegistrations/index.ts`, inside the `Payment` tab, extend `paymentMethod`'s options and add the `sponsor` field immediately after it:

```ts
            {
              name: 'paymentMethod',
              type: 'select',
              options: [
                { label: 'Bank Transfer', value: 'bank-transfer' },
                { label: 'Credit Card', value: 'credit-card' },
                { label: 'Cash', value: 'cash' },
                { label: 'Sponsor (Complimentary)', value: 'sponsor' },
              ],
              admin: {
                description: 'How the registrant intends to pay',
              },
            },
            {
              name: 'sponsor',
              type: 'relationship',
              relationTo: 'sponsors',
              // Complimentary ticket handed out under a sponsor's allocation.
              // No quota is enforced — the tier allowance is a business
              // agreement, not a system rule.
              access: {
                create: authenticatedFieldAccess,
                update: authenticatedFieldAccess,
              },
              admin: {
                description: 'Sponsor this complimentary ticket is issued under',
                condition: (data) => data?.paymentMethod === 'sponsor',
              },
            },
```

`authenticatedFieldAccess` is already imported at the top of this file (used by `paymentStatus`, `amountDue`, `verifiedBy`). The field access matters: the collection is `create: anyone` for the public form, so an anonymous caller must not be able to attach a sponsor to their own registration.

- [ ] **Step 4: Push the schema and regenerate types**

Run: `bun run dev`
Wait for `[INFO] Starting Next.js` / the schema push to complete, then Ctrl-C.
Then run: `bun run generate:types`
Expected: `src/payload-types.ts` now has `sponsor?: (number | null) | Sponsor;` on `EventRegistration` and `'sponsor'` in the `paymentMethod` union.

- [ ] **Step 5: Run the test to verify it passes**

Run: `bun run test:int -- sponsor-ticket-schema`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/collections/EventRegistrations/index.ts src/payload-types.ts tests/int/sponsor-ticket-schema.int.spec.ts
git commit -m "feat(sponsor-tickets): add sponsor relationship + sponsor payment method"
```

---

### Task 2: `issueSponsorRegistration` utility

**Files:**
- Create: `src/utilities/registration/issueSponsorRegistration.ts`
- Test: `tests/int/sponsor-ticket.int.spec.ts` (create)

**Interfaces:**
- Consumes: the `sponsor` field + `paymentMethod: 'sponsor'` from Task 1. `IssueTicketResult` from `@/utilities/ticketing/issueTicketForRegistration` (shape: `{ ticket: Ticket; alreadyIssued: boolean; emailSent: boolean }`).
- Produces:

```ts
issueSponsorRegistration(deps: SponsorTicketDeps, input: SponsorTicketInput): Promise<SponsorTicketResult>

type SponsorTicketDeps = {
  payload: Pick<Payload, 'create'>
  issueTicket: (payload: Payload, registrationId: number) => Promise<IssueTicketResult>
  now?: () => number
}
type SponsorTicketInput = {
  eventId: number
  sponsorId: number
  playerName: string
  email: string
  phone?: string
  category: 'general' | 'alumni'
  tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL'
  alumniClassYear?: number
  alumniMajor?: string
  notes?: string
  issuedById: number
}
type SponsorTicketResult =
  | { success: true; registrationId: number; ticketId: number; ticketCode: string; emailSent: boolean }
  | { success: false; error: string }
```

Task 3 (the route) calls this. There is deliberately **no** `findByID` on deps — the utility does not pre-check that the event/sponsor exist; `payload.create` fails on a bad relationship id, and the route surfaces that.

- [ ] **Step 1: Write the failing test**

Create `tests/int/sponsor-ticket.int.spec.ts`. Pure unit test with stubbed `payload.create` and a stubbed `issueTicket` — same DI style as `tests/int/approve-transfer.int.spec.ts`, no DB.

```ts
import { describe, it, expect, vi } from 'vitest'
import {
  issueSponsorRegistration,
  type SponsorTicketDeps,
  type SponsorTicketInput,
} from '@/utilities/registration/issueSponsorRegistration'

/**
 * Sponsor free tickets — an admin issues a complimentary ticket by selecting a
 * sponsor instead of uploading a transfer proof. The registration is written as
 * already-paid at zero, and the ticket is issued through the shared utility so
 * the guest gets the same QR + PDF + email as a paying registrant.
 */

const NOW = 1_750_000_000_000

function makeDeps(overrides: Partial<SponsorTicketDeps> = {}) {
  const create = vi.fn(async (arg: { data: Record<string, unknown> }) => ({
    id: 77,
    ...arg.data,
  }))
  const issueTicket = vi.fn(async (_payload: unknown, _registrationId: number) => ({
    ticket: { id: 555, ticketCode: 'APGC-77-ab12' },
    alreadyIssued: false,
    emailSent: true,
  }))
  const deps = {
    payload: { create },
    issueTicket,
    now: () => NOW,
    ...overrides,
  } as unknown as SponsorTicketDeps
  return { deps, create, issueTicket }
}

const input: SponsorTicketInput = {
  eventId: 3,
  sponsorId: 12,
  playerName: 'Budi Santoso',
  email: 'budi@example.com',
  phone: '081234567890',
  category: 'general',
  tshirtSize: 'L',
  issuedById: 9,
}

describe('issueSponsorRegistration', () => {
  it('writes a paid, zero-cost registration linked to the sponsor and issues the ticket', async () => {
    const { deps, create, issueTicket } = makeDeps()
    const result = await issueSponsorRegistration(deps, input)

    expect(result.success).toBe(true)
    if (!result.success) throw new Error('expected success')
    expect(result.registrationId).toBe(77)
    expect(result.ticketId).toBe(555)
    expect(result.ticketCode).toBe('APGC-77-ab12')
    expect(result.emailSent).toBe(true)

    const data = create.mock.calls[0][0].data
    expect(data.event).toBe(3)
    expect(data.sponsor).toBe(12)
    expect(data.paymentMethod).toBe('sponsor')
    expect(data.paymentStatus).toBe('paid')
    expect(data.status).toBe('confirmed')
    expect(data.amountDue).toBe(0)
    expect(data.amountPaid).toBe(0)
    expect(data.agreedToTerms).toBe(true)
    expect(data.verifiedBy).toBe(9)
    expect(data.paidAt).toBe(new Date(NOW).toISOString())
    expect(data.verifiedAt).toBe(new Date(NOW).toISOString())
    expect(data.phone).toBe('+6281234567890')

    expect(issueTicket).toHaveBeenCalledTimes(1)
    expect(issueTicket.mock.calls[0][1]).toBe(77)
  })

  it('never sets payment-proof or Xendit fields', async () => {
    const { deps, create } = makeDeps()
    await issueSponsorRegistration(deps, input)

    const data = create.mock.calls[0][0].data
    expect(data.transferProof).toBeUndefined()
    expect(data.xenditSessionId).toBeUndefined()
    expect(data.xenditCheckoutUrl).toBeUndefined()
    expect(data.rejectionReason).toBeUndefined()
  })

  it('passes alumni fields through when the category is alumni', async () => {
    const { deps, create } = makeDeps()
    await issueSponsorRegistration(deps, {
      ...input,
      category: 'alumni',
      alumniClassYear: 2015,
      alumniMajor: 'Teknik Informatika',
    })

    const data = create.mock.calls[0][0].data
    expect(data.category).toBe('alumni')
    expect(data.alumniClassYear).toBe(2015)
    expect(data.alumniMajor).toBe('Teknik Informatika')
  })

  it.each([
    ['eventId', { eventId: 0 }],
    ['sponsorId', { sponsorId: 0 }],
    ['playerName', { playerName: '  ' }],
    ['email', { email: '' }],
    ['tshirtSize', { tshirtSize: undefined }],
  ])('rejects a missing %s without creating anything', async (field, patch) => {
    const { deps, create, issueTicket } = makeDeps()
    const result = await issueSponsorRegistration(deps, {
      ...input,
      ...patch,
    } as SponsorTicketInput)

    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.error).toContain(field)
    expect(create).not.toHaveBeenCalled()
    expect(issueTicket).not.toHaveBeenCalled()
  })

  it('surfaces a non-fatal email failure (ticket still issued)', async () => {
    const { deps } = makeDeps({
      issueTicket: vi.fn(async () => ({
        ticket: { id: 555, ticketCode: 'APGC-77-ab12' },
        alreadyIssued: false,
        emailSent: false,
      })),
    } as unknown as Partial<SponsorTicketDeps>)
    const result = await issueSponsorRegistration(deps, input)

    expect(result.success).toBe(true)
    if (!result.success) throw new Error('expected success')
    expect(result.ticketId).toBe(555)
    expect(result.emailSent).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:int -- sponsor-ticket.int`
Expected: FAIL — `Failed to resolve import "@/utilities/registration/issueSponsorRegistration"`.

- [ ] **Step 3: Write the implementation**

Create `src/utilities/registration/issueSponsorRegistration.ts`:

```ts
import type { Payload } from 'payload'

import type { IssueTicketResult } from '@/utilities/ticketing/issueTicketForRegistration'

export type SponsorTicketDeps = {
  payload: Pick<Payload, 'create'>
  issueTicket: (payload: Payload, registrationId: number) => Promise<IssueTicketResult>
  /** Injectable clock; defaults to Date.now. */
  now?: () => number
}

export type SponsorTicketInput = {
  eventId: number
  sponsorId: number
  playerName: string
  email: string
  phone?: string
  category: 'general' | 'alumni'
  tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL'
  alumniClassYear?: number
  alumniMajor?: string
  notes?: string
  issuedById: number
}

export type SponsorTicketResult =
  | {
      success: true
      registrationId: number
      ticketId: number
      ticketCode: string
      emailSent: boolean
    }
  | { success: false; error: string }

/**
 * Issue a complimentary sponsor ticket.
 *
 * Collapses "create the registration" and "approve it" into one step: the
 * registration is written already paid at zero cost, attributed to a sponsor,
 * with no transfer proof and no upload token — there is nothing to pay and
 * nothing to upload. Ticket creation (code + QR + PDF + email) is delegated to
 * the shared idempotent utility, so the guest receives exactly the same ticket
 * as a paying registrant.
 *
 * No quota is enforced. A sponsor's ticket allowance follows from their tier as
 * a business agreement; the system only records who the ticket was issued under.
 *
 * Dependency-injected (payload + issueTicket) so it is unit-testable without a
 * DB or a mail provider.
 */
export async function issueSponsorRegistration(
  deps: SponsorTicketDeps,
  input: SponsorTicketInput,
): Promise<SponsorTicketResult> {
  const { payload, issueTicket } = deps
  const now = deps.now ?? Date.now

  const missing: string[] = []
  if (!input.eventId) missing.push('eventId')
  if (!input.sponsorId) missing.push('sponsorId')
  if (!input.playerName?.trim()) missing.push('playerName')
  if (!input.email?.trim()) missing.push('email')
  if (!input.tshirtSize) missing.push('tshirtSize')
  if (missing.length > 0) {
    return { success: false, error: `Missing required field(s): ${missing.join(', ')}` }
  }

  const timestamp = new Date(now()).toISOString()

  const registration = await payload.create({
    collection: 'event-registrations',
    overrideAccess: true,
    data: {
      event: input.eventId,
      sponsor: input.sponsorId,
      playerName: input.playerName.trim(),
      email: input.email.trim(),
      phone: input.phone ? `+62${input.phone.replace(/^0+/, '')}` : undefined,
      category: input.category,
      tshirtSize: input.tshirtSize,
      alumniClassYear: input.alumniClassYear,
      alumniMajor: input.alumniMajor || undefined,
      notes: input.notes || undefined,
      agreedToTerms: true,
      status: 'confirmed',
      paymentMethod: 'sponsor',
      paymentStatus: 'paid',
      amountDue: 0,
      amountPaid: 0,
      paidAt: timestamp,
      verifiedBy: input.issuedById,
      verifiedAt: timestamp,
    },
  })

  const issued = await issueTicket(payload as Payload, registration.id)

  return {
    success: true,
    registrationId: registration.id,
    ticketId: issued.ticket.id,
    ticketCode: issued.ticket.ticketCode,
    emailSent: issued.emailSent,
  }
}
```

Note the `phone` normalization (`+62` + leading zeros stripped) is copied verbatim from `issueManualRegistration.ts:85` so sponsor guests are stored the same way as everyone else.

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:int -- sponsor-ticket.int`
Expected: PASS (9 tests — the `it.each` block counts as 5).

- [ ] **Step 5: Commit**

```bash
git add src/utilities/registration/issueSponsorRegistration.ts tests/int/sponsor-ticket.int.spec.ts
git commit -m "feat(sponsor-tickets): issueSponsorRegistration utility"
```

---

### Task 3: `POST /api/sponsor-tickets` route

**Files:**
- Create: `src/app/(payload)/api/sponsor-tickets/route.ts`
- Modify: `next.config.js:62-66` (`outputFileTracingIncludes`)

**Interfaces:**
- Consumes: `issueSponsorRegistration` (Task 2), `issueTicketForRegistration` from `@/utilities/ticketing/issueTicketForRegistration`.
- Produces: `POST /api/sponsor-tickets` accepting JSON `{ eventId, sponsorId, playerName, email, phone?, category, tshirtSize, alumniClassYear?, alumniMajor?, notes? }` and returning `{ success: true, registrationId, ticketId, ticketCode, emailSent }` or `{ success: false, error }` with 400/401. Task 4's client component calls it.

No new test: the route is a thin auth + parse shell over `issueSponsorRegistration`, whose validation is already covered in Task 2. This mirrors `api/manual-transfers/approve/route.ts`, which has no route-level test either.

- [ ] **Step 1: Write the route**

Create `src/app/(payload)/api/sponsor-tickets/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

import { issueSponsorRegistration } from '@/utilities/registration/issueSponsorRegistration'
import { issueTicketForRegistration } from '@/utilities/ticketing/issueTicketForRegistration'

/**
 * Admin endpoint to issue a complimentary sponsor ticket. Any authenticated
 * staff user (admin or registration-staff) may issue — they already run manual
 * transfers and check-in. No payment proof, no quota check.
 */
export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))

  const category = body.category === 'alumni' ? 'alumni' : 'general'
  const alumniClassYear =
    category === 'alumni' && body.alumniClassYear ? Number(body.alumniClassYear) : undefined

  const result = await issueSponsorRegistration(
    { payload, issueTicket: (p, id) => issueTicketForRegistration(p, id) },
    {
      eventId: Number(body.eventId),
      sponsorId: Number(body.sponsorId),
      playerName: String(body.playerName ?? ''),
      email: String(body.email ?? ''),
      phone: body.phone ? String(body.phone) : undefined,
      category,
      tshirtSize: body.tshirtSize,
      alumniClassYear,
      alumniMajor: category === 'alumni' && body.alumniMajor ? String(body.alumniMajor) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      issuedById: user.id,
    },
  )

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  try {
    revalidatePath('/events')
  } catch {
    // best-effort cache refresh
  }

  return NextResponse.json(result)
}
```

The `Number(...)` coercion of `eventId`/`sponsorId` turns a missing value into `NaN`, which is falsy-checked by the utility's `if (!input.eventId)` guard and returns a 400 — no bad write reaches the DB.

- [ ] **Step 2: Ship the ticket artwork to this route's bundle**

This route renders the ticket PDF, which reads `src/components/TicketPDF/assets/ticket-bg.jpg` off disk at runtime. Serverless bundles only include traced files, so the asset must be declared — the same fix commit a45f9a7 applied to the other two issuance routes.

In `next.config.js`, add the new route to `outputFileTracingIncludes` alongside the existing three entries:

```js
  outputFileTracingIncludes: {
    '/api/tickets/[id]/pdf': ['./src/components/TicketPDF/assets/ticket-bg.jpg'],
    '/api/manual-transfers/approve': ['./src/components/TicketPDF/assets/ticket-bg.jpg'],
    '/api/payments/webhook': ['./src/components/TicketPDF/assets/ticket-bg.jpg'],
    '/api/sponsor-tickets': ['./src/components/TicketPDF/assets/ticket-bg.jpg'],
  },
```

Only the last line is new — leave the other three entries and the explanatory comment above them untouched.

- [ ] **Step 3: Verify the route rejects an unauthenticated call**

Run: `bun run dev` in one terminal, then in another:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/api/sponsor-tickets \
  -H 'Content-Type: application/json' -d '{}'
```

Expected: `401`

- [ ] **Step 4: Commit**

```bash
git add src/app/\(payload\)/api/sponsor-tickets/route.ts next.config.js
git commit -m "feat(sponsor-tickets): POST /api/sponsor-tickets issuance route"
```

---

### Task 4: Admin view `/admin/sponsor-tickets`

**Files:**
- Create: `src/components/admin/views/SponsorTicketsView.tsx`
- Create: `src/components/admin/views/SponsorTicketsClient.tsx`
- Modify: `src/payload.config.ts:82-91` (`admin.components.views`)

**Interfaces:**
- Consumes: `POST /api/sponsor-tickets` (Task 3). Payload's REST endpoints `/api/events`, `/api/sponsors`, `/api/event-registrations` (cookie auth, `credentials: 'include'`).
- Produces: the admin view registered at path `/sponsor-tickets` (URL `/admin/sponsor-tickets`). Task 5 links to it.

- [ ] **Step 1: Write the server view wrapper**

Create `src/components/admin/views/SponsorTicketsView.tsx` — identical shape to `ManualTransfersView.tsx`:

```tsx
import type { AdminViewServerProps } from 'payload'

import { Gutter } from '@payloadcms/ui'
import { DefaultTemplate } from '@payloadcms/next/templates'
import React from 'react'

import { SponsorTicketsClient } from './SponsorTicketsClient'

export function SponsorTicketsView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <SponsorTicketsClient />
      </Gutter>
    </DefaultTemplate>
  )
}

export default SponsorTicketsView
```

- [ ] **Step 2: Write the client form**

Create `src/components/admin/views/SponsorTicketsClient.tsx`. Read `SponsorTicketsClient`'s sibling `ManualTransfersClient.tsx` first and match its conventions: `'use client'`, plain `fetch` with `credentials: 'include'`, local `useState`, inline styles / existing class names — do not introduce a form library.

```tsx
'use client'

import { useCallback, useEffect, useState } from 'react'

type EventRow = { id: number; title?: string | null }
type TierRel = { id: number; name?: string | null }
type SponsorRow = { id: number; name?: string | null; tier?: TierRel | number | null }

const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const

function tierNameOf(sponsor: SponsorRow): string {
  return sponsor.tier && typeof sponsor.tier === 'object' ? sponsor.tier.name || '' : ''
}

export function SponsorTicketsClient() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [sponsors, setSponsors] = useState<SponsorRow[]>([])
  const [issuedCounts, setIssuedCounts] = useState<Record<number, number>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [eventId, setEventId] = useState('')
  const [sponsorId, setSponsorId] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tshirtSize, setTshirtSize] = useState('')
  const [category, setCategory] = useState<'general' | 'alumni'>('general')
  const [alumniClassYear, setAlumniClassYear] = useState('')
  const [alumniMajor, setAlumniMajor] = useState('')

  useEffect(() => {
    async function load() {
      const [eventsRes, sponsorsRes] = await Promise.all([
        fetch('/api/events?limit=100&sort=-date', { credentials: 'include' }),
        fetch('/api/sponsors?limit=200&depth=1&sort=name', { credentials: 'include' }),
      ])
      const eventsData = await eventsRes.json()
      const sponsorsData = await sponsorsRes.json()
      setEvents(eventsData.docs || [])
      setSponsors(sponsorsData.docs || [])
    }
    load().catch(() => setNotice('Failed to load events or sponsors.'))
  }, [])

  // Informational only — how many complimentary tickets this sponsor already
  // has. Never blocks issuance; there is no quota in the system.
  const loadIssuedCount = useCallback(async (id: number) => {
    const res = await fetch(
      `/api/event-registrations?where[sponsor][equals]=${id}&limit=0&depth=0`,
      { credentials: 'include' },
    )
    const data = await res.json()
    setIssuedCounts((prev) => ({ ...prev, [id]: data.totalDocs ?? 0 }))
  }, [])

  useEffect(() => {
    const id = Number(sponsorId)
    if (id) loadIssuedCount(id).catch(() => {})
  }, [sponsorId, loadIssuedCount])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setNotice(null)
    try {
      const res = await fetch('/api/sponsor-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventId: Number(eventId),
          sponsorId: Number(sponsorId),
          playerName,
          email,
          phone: phone || undefined,
          category,
          tshirtSize,
          alumniClassYear: alumniClassYear ? Number(alumniClassYear) : undefined,
          alumniMajor: alumniMajor || undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setNotice(`Failed: ${data.error}`)
      } else {
        setNotice(
          data.emailSent === false
            ? `Ticket ${data.ticketCode} issued, but the email failed to send. Download the PDF from the Tickets list.`
            : `Ticket ${data.ticketCode} issued and emailed to ${email}.`,
        )
        setPlayerName('')
        setEmail('')
        setPhone('')
        setTshirtSize('')
        setAlumniClassYear('')
        setAlumniMajor('')
        if (Number(sponsorId)) await loadIssuedCount(Number(sponsorId))
      }
    } catch {
      setNotice('Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCount = Number(sponsorId) ? issuedCounts[Number(sponsorId)] : undefined

  return (
    <div>
      <h1>Sponsor Tickets</h1>
      <p>
        Issue a complimentary ticket under a sponsor. No payment or transfer proof is required —
        the guest receives the same ticket email, PDF and QR code as a paying registrant.
      </p>

      {notice && <p role="status">{notice}</p>}

      <form onSubmit={submit}>
        <label>
          Event
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} required>
            <option value="">Select an event…</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title || `Event ${ev.id}`}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sponsor
          <select value={sponsorId} onChange={(e) => setSponsorId(e.target.value)} required>
            <option value="">Select a sponsor…</option>
            {sponsors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || `Sponsor ${s.id}`}
                {tierNameOf(s) ? ` — ${tierNameOf(s)}` : ''}
              </option>
            ))}
          </select>
        </label>

        {selectedCount !== undefined && (
          <p>
            {selectedCount} ticket{selectedCount === 1 ? '' : 's'} issued to this sponsor so far.
          </p>
        )}

        <label>
          Guest name
          <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} required />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Phone (optional)
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>

        <label>
          T-shirt size
          <select value={tshirtSize} onChange={(e) => setTshirtSize(e.target.value)} required>
            <option value="">Select a size…</option>
            {TSHIRT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'general' | 'alumni')}
          >
            <option value="general">General</option>
            <option value="alumni">Alumni</option>
          </select>
        </label>

        {category === 'alumni' && (
          <>
            <label>
              Angkatan (class year)
              <input
                type="number"
                value={alumniClassYear}
                onChange={(e) => setAlumniClassYear(e.target.value)}
              />
            </label>
            <label>
              Jurusan (major)
              <input value={alumniMajor} onChange={(e) => setAlumniMajor(e.target.value)} />
            </label>
          </>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Issuing…' : 'Issue ticket'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Register the view**

In `src/payload.config.ts`, add to `admin.components.views` alongside `checkIn` and `manualTransfers`:

```ts
        sponsorTickets: {
          Component: '@/components/admin/views/SponsorTicketsView#SponsorTicketsView',
          path: '/sponsor-tickets',
        },
```

- [ ] **Step 4: Regenerate the import map**

Run: `bun run generate:importmap`
Expected: `src/app/(payload)/admin/importMap.js` now imports `SponsorTicketsView`.

- [ ] **Step 5: Verify the view renders and issues a ticket**

Run: `bun run dev`, log in as an admin, open `http://localhost:3000/admin/sponsor-tickets`.
Fill the form with a real event + sponsor and your own email address. Submit.
Expected: notice reads `Ticket APGC-<id>-<hash> issued and emailed to <email>.`; the ticket appears in `/admin/collections/tickets`; the registration in `/admin/collections/event-registrations` shows Payment Method `Sponsor (Complimentary)`, Payment Status `paid`, Amount Due `0`, an empty Transfer Proof, and the sponsor set. The sponsor's issued count on the form increments.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/views/SponsorTicketsView.tsx src/components/admin/views/SponsorTicketsClient.tsx src/payload.config.ts "src/app/(payload)/admin/importMap.js"
git commit -m "feat(sponsor-tickets): admin view at /admin/sponsor-tickets"
```

---

### Task 5: Nav entry + registration-staff access

**Files:**
- Modify: `src/components/admin/Nav/visibleMenuGroups.ts:20-24` (`REGISTRATION_STAFF_ALLOWED_HREFS`)
- Modify: `src/components/admin/Nav/index.tsx:71` (the Registrations group, next to `Manual Transfers`)
- Test: `tests/int/visible-menu-groups.int.spec.ts` (modify)

**Interfaces:**
- Consumes: the admin view path `/admin/sponsor-tickets` from Task 4.
- Produces: nothing downstream.

- [ ] **Step 1: Write the failing test**

`tests/int/visible-menu-groups.int.spec.ts` already defines a module-level `icon` stub (line 4) and a shared `groups` fixture (lines 6-22) whose `Registrations` group lists Event Registrations, Tickets, Manual Transfers and Check-In Scanner.

Make three edits to that file:

1. Extend the import on line 2 to pull in the whitelist:

```ts
import {
  visibleMenuGroups,
  REGISTRATION_STAFF_ALLOWED_HREFS,
  type MenuGroup,
} from '@/components/admin/Nav/visibleMenuGroups'
```

2. Add `Sponsor Tickets` to the shared `groups` fixture's `Registrations` items, after `Tickets`:

```ts
      { name: 'Sponsor Tickets', href: '/admin/sponsor-tickets', icon },
```

3. Add this test inside the existing top-level `describe('visibleMenuGroups', ...)`:

```ts
  it('lets registration staff reach the sponsor tickets view', () => {
    expect(REGISTRATION_STAFF_ALLOWED_HREFS).toContain('/admin/sponsor-tickets')

    const visible = visibleMenuGroups(groups, 'registration-staff')
    const hrefs = visible.flatMap((group) => group.items.map((item) => item.href))
    expect(hrefs).toContain('/admin/sponsor-tickets')
    // still hidden: the full registrations collection
    expect(hrefs).not.toContain('/admin/collections/event-registrations')
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:int -- visible-menu-groups`
Expected: FAIL — `expected [ '/admin/collections/tickets', '/admin/manual-transfers', '/admin/check-in' ] to contain '/admin/sponsor-tickets'`.

- [ ] **Step 3: Whitelist the href and add the nav item**

In `src/components/admin/Nav/visibleMenuGroups.ts`:

```ts
/**
 * Hrefs a registration-staff user is allowed to see in the Nav: Tickets,
 * Sponsor Tickets, Manual Transfers, Check-In. Every other role sees the full
 * menu.
 */
export const REGISTRATION_STAFF_ALLOWED_HREFS: readonly string[] = [
  '/admin/collections/tickets',
  '/admin/sponsor-tickets',
  '/admin/manual-transfers',
  '/admin/check-in',
]
```

In `src/components/admin/Nav/index.tsx`, add the item to the Registrations group directly after `Manual Transfers` (line 71). Use the `Gift` icon from `lucide-react` and add it to the existing `lucide-react` import at the top of the file:

```tsx
      { name: 'Sponsor Tickets', href: '/admin/sponsor-tickets', icon: Gift },
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:int -- visible-menu-groups`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/Nav/visibleMenuGroups.ts src/components/admin/Nav/index.tsx tests/int/visible-menu-groups.int.spec.ts
git commit -m "feat(sponsor-tickets): nav entry + registration-staff access"
```

---

### Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the whole int suite**

Run: `bun run test:int`
Expected: all suites PASS, including the pre-existing ones (`issue-ticket`, `approve-transfer`, `manual-registration`, `collection-admin-hidden`, …). Nothing in this feature changes their behaviour — if one breaks, it's a regression, fix it before continuing.

- [ ] **Step 2: Lint**

Run: `bun run lint`
Expected: no errors.

- [ ] **Step 3: Build**

Run: `bun run build`
Expected: build succeeds. A `column "sponsor_id" does not exist` at the prerender step means the Task 1 schema push never happened — run `bun run dev` once and rebuild.

- [ ] **Step 4: End-to-end check as registration staff**

Log into the admin as the `registration-staff` user (`pendaftaran@polinemagolf.com`). Confirm:
- `Sponsor Tickets` appears in the Nav.
- Issuing a ticket from `/admin/sponsor-tickets` succeeds and the guest email arrives with the PDF attached.
- Scanning that ticket's QR in `/admin/check-in` validates and marks it checked in.

- [ ] **Step 5: Commit any fixes and open the PR**

```bash
git push -u origin feat/sponsor-free-tickets
```

---

## Out of scope (deliberate)

- **Quota enforcement.** The issued count is displayed; nothing is blocked. Add a `ticketQuota` number field on `SponsorshipTiers` only if a sponsor actually overdraws.
- **Per-ticket "skip email" toggle.** The guest always gets the email.
- **Bulk / CSV issuance.** One guest per submission.
- **Cancelling or refunding a sponsor ticket.** Use the existing ticket `status: cancelled` in the Tickets collection.
