# WhatsApp Admin Notifications (Fonnte) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send a WhatsApp-group alert to the team on four events (sponsorship inquiry, event registration, contact submission, transfer-proof upload) via Fonnte.

**Architecture:** A non-fatal Fonnte client (`sendWhatsAppNotification`) plus pure Bahasa-Indonesia message builders. Triggers are wired at the data layer — collection `afterChange` hooks for sponsor + event registrations, the form-builder submission hook for contact, and an injected notifier in `processProofUpload` for proofs. Every trigger is guarded so a WhatsApp failure never blocks the primary write.

**Tech Stack:** TypeScript, Payload CMS 3, Next.js 15, Vitest (`bun run test:int`), Fonnte REST API.

## Global Constraints

- Package manager: **bun** (`bun add`, `bun run test:int`). Never npm/yarn/pnpm.
- **TDD**: failing test first (RED) → minimal impl (GREEN) → commit. Tests in `tests/int/`.
- All copy is **Bahasa Indonesia**. Money formats as IDR via `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`.
- **Non-fatal**: notification code must never throw into a primary flow. `sendWhatsAppNotification` never throws; every call-site also try/catches.
- Admin links use `const baseUrl = process.env.BASE_URL || getServerSideURL()` (from `@/utilities/getURL`). Production `BASE_URL = https://www.polinemagolf.com`.
- Fonnte API: `POST https://api.fonnte.com/send`, header `Authorization: <FONNTE_TOKEN>`, urlencoded body `target=<FONNTE_TARGET>&message=<msg>`.
- After adding collection fields nothing is needed here (no new DB columns). No `generate:types` required — no schema changes.

---

### Task 1: Fonnte client `sendWhatsAppNotification`

**Files:**
- Create: `src/utilities/whatsapp/sendWhatsAppNotification.ts`
- Test: `tests/int/whatsapp-send.int.spec.ts`
- Modify: `.env.example` (add the two vars)

**Interfaces:**
- Produces: `sendWhatsAppNotification(message: string): Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/whatsapp-send.int.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'

describe('sendWhatsAppNotification', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })
  afterEach(() => vi.restoreAllMocks())

  it('no-ops (no fetch, no throw) when env is missing', async () => {
    vi.stubEnv('FONNTE_TOKEN', '')
    vi.stubEnv('FONNTE_TARGET', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const r = await sendWhatsAppNotification('hi')
    expect(r.success).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('POSTs to Fonnte with token + target + message and succeeds on ok', async () => {
    vi.stubEnv('FONNTE_TOKEN', 'tok')
    vi.stubEnv('FONNTE_TARGET', '120363-group')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const r = await sendWhatsAppNotification('halo tim')
    expect(r.success).toBe(true)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.fonnte.com/send')
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ Authorization: 'tok' })
    const body = init.body as URLSearchParams
    expect(body.get('target')).toBe('120363-group')
    expect(body.get('message')).toBe('halo tim')
  })

  it('is non-fatal on non-2xx', async () => {
    vi.stubEnv('FONNTE_TOKEN', 'tok')
    vi.stubEnv('FONNTE_TARGET', 'g')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => 'bad' }))
    const r = await sendWhatsAppNotification('x')
    expect(r.success).toBe(false)
  })

  it('is non-fatal on network error', async () => {
    vi.stubEnv('FONNTE_TOKEN', 'tok')
    vi.stubEnv('FONNTE_TARGET', 'g')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const r = await sendWhatsAppNotification('x')
    expect(r.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int tests/int/whatsapp-send.int.spec.ts`
Expected: FAIL — cannot find module `sendWhatsAppNotification`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/utilities/whatsapp/sendWhatsAppNotification.ts

/**
 * Thin Fonnte client for internal admin alerts. Non-fatal by contract: never
 * throws, and no-ops with a warning when unconfigured (so local/dev/CI without
 * Fonnte credentials keeps working). Mirrors the Resend email utilities.
 */
export async function sendWhatsAppNotification(
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.FONNTE_TOKEN
  const target = process.env.FONNTE_TARGET
  if (!token || !target) {
    console.warn('WhatsApp notification skipped: FONNTE_TOKEN/FONNTE_TARGET not configured')
    return { success: false, error: 'WhatsApp not configured' }
  }

  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: token },
      body: new URLSearchParams({ target, message }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`Fonnte send failed: ${res.status} ${text}`)
      return { success: false, error: `HTTP ${res.status}` }
    }
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Fonnte send error:', msg)
    return { success: false, error: msg }
  }
}
```

- [ ] **Step 4: Add the env vars to `.env.example`**

Append these two lines to `.env.example`:

```
# Fonnte WhatsApp gateway (admin alerts). Group ID as target.
FONNTE_TOKEN=YOUR_FONNTE_DEVICE_TOKEN
FONNTE_TARGET=YOUR_WHATSAPP_GROUP_ID
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun run test:int tests/int/whatsapp-send.int.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/utilities/whatsapp/sendWhatsAppNotification.ts tests/int/whatsapp-send.int.spec.ts .env.example
git commit -m "feat(whatsapp): non-fatal Fonnte client for admin alerts"
```

---

### Task 2: Message builders

**Files:**
- Create: `src/utilities/whatsapp/messages.ts`
- Test: `tests/int/whatsapp-messages.int.spec.ts`

**Interfaces:**
- Produces:
  - `buildSponsorInquiryMessage(input: { id: number|string; companyName?: string; contactName?: string; phone?: string; email?: string; selectedTier?: string }, baseUrl: string): string`
  - `buildEventRegistrationMessage(input: { id: number|string; playerName?: string; category?: string; paymentMethod?: string; eventTitle?: string }, baseUrl: string): string`
  - `buildContactMessage(input: { id: number|string; submissionData?: Array<{ field: string; value: unknown }> }, baseUrl: string): string`
  - `buildTransferProofMessage(input: { id: number|string; playerName?: string; eventTitle?: string; amountDue?: number | null }, baseUrl: string): string`

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/whatsapp-messages.int.spec.ts
import { describe, it, expect } from 'vitest'
import {
  buildSponsorInquiryMessage,
  buildEventRegistrationMessage,
  buildContactMessage,
  buildTransferProofMessage,
} from '@/utilities/whatsapp/messages'

const BASE = 'https://www.polinemagolf.com'

describe('whatsapp message builders', () => {
  it('sponsor message has key fields + admin doc link', () => {
    const m = buildSponsorInquiryMessage(
      { id: 7, companyName: 'Acme', contactName: 'Budi', phone: '0812', email: 'b@acme.id', selectedTier: 'EAGLE' },
      BASE,
    )
    expect(m).toContain('Pengajuan Sponsor Baru')
    expect(m).toContain('Acme')
    expect(m).toContain('Budi')
    expect(m).toContain('EAGLE')
    expect(m).toContain(`${BASE}/admin/collections/sponsor-registrations/7`)
  })

  it('event registration message has ref + admin doc link', () => {
    const m = buildEventRegistrationMessage(
      { id: 20, playerName: 'Sita', category: 'alumni', paymentMethod: 'bank-transfer', eventTitle: 'Polinema Cup' },
      BASE,
    )
    expect(m).toContain('Pendaftaran Baru')
    expect(m).toContain('Sita')
    expect(m).toContain('Polinema Cup')
    expect(m).toContain('reg-20')
    expect(m).toContain(`${BASE}/admin/collections/event-registrations/20`)
  })

  it('contact message lists fields + links to the submission doc', () => {
    const m = buildContactMessage(
      { id: 3, submissionData: [
        { field: 'name', value: 'Rama' },
        { field: 'email', value: 'r@x.id' },
        { field: 'message', value: 'Tanya tiket' },
      ] },
      BASE,
    )
    expect(m).toContain('Pesan Kontak Baru')
    expect(m).toContain('Rama')
    expect(m).toContain('r@x.id')
    expect(m).toContain('Tanya tiket')
    expect(m).toContain(`${BASE}/admin/collections/form-submissions/3`)
  })

  it('contact message truncates an over-long value', () => {
    const long = 'x'.repeat(2000)
    const m = buildContactMessage({ id: 1, submissionData: [{ field: 'message', value: long }] }, BASE)
    expect(m.length).toBeLessThan(1200)
    expect(m).toContain('…')
  })

  it('transfer proof message has ref, IDR amount + manual-transfers link', () => {
    const m = buildTransferProofMessage(
      { id: 20, playerName: 'Sita', eventTitle: 'Polinema Cup', amountDue: 4000000 },
      BASE,
    )
    expect(m).toContain('Bukti Transfer Masuk')
    expect(m).toContain('reg-20')
    expect(m).toContain('4.000.000')
    expect(m).toContain(`${BASE}/admin/manual-transfers`)
  })

  it('builders degrade gracefully on missing fields (no "undefined")', () => {
    const m = buildTransferProofMessage({ id: 9 }, BASE)
    expect(m).not.toContain('undefined')
    expect(m).toContain('reg-9')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int tests/int/whatsapp-messages.int.spec.ts`
Expected: FAIL — cannot find module `messages`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/utilities/whatsapp/messages.ts

const idr = (n?: number | null): string =>
  typeof n === 'number'
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
    : '-'

const dash = (v?: string | null): string => (v && String(v).trim() ? String(v) : '-')

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s
}

export function buildSponsorInquiryMessage(
  input: { id: number | string; companyName?: string; contactName?: string; phone?: string; email?: string; selectedTier?: string },
  baseUrl: string,
): string {
  const contact = input.phone ? `${dash(input.contactName)} (${input.phone})` : dash(input.contactName)
  return [
    '🤝 Pengajuan Sponsor Baru',
    `Perusahaan: ${dash(input.companyName)}`,
    `Narahubung: ${contact}`,
    `Email: ${dash(input.email)}`,
    `Tier: ${dash(input.selectedTier)}`,
    `Lihat: ${baseUrl}/admin/collections/sponsor-registrations/${input.id}`,
  ].join('\n')
}

export function buildEventRegistrationMessage(
  input: { id: number | string; playerName?: string; category?: string; paymentMethod?: string; eventTitle?: string },
  baseUrl: string,
): string {
  return [
    '📝 Pendaftaran Baru',
    `Nama: ${dash(input.playerName)}`,
    `Acara: ${dash(input.eventTitle)}`,
    `Kategori: ${dash(input.category)}`,
    `Metode: ${dash(input.paymentMethod)}`,
    `Ref: reg-${input.id}`,
    `Lihat: ${baseUrl}/admin/collections/event-registrations/${input.id}`,
  ].join('\n')
}

export function buildContactMessage(
  input: { id: number | string; submissionData?: Array<{ field: string; value: unknown }> },
  baseUrl: string,
): string {
  const lines = (input.submissionData ?? []).map(
    ({ field, value }) => `${field}: ${truncate(String(value ?? ''), 500)}`,
  )
  return truncate(
    ['📩 Pesan Kontak Baru', ...lines, `Lihat: ${baseUrl}/admin/collections/form-submissions/${input.id}`].join('\n'),
    1000,
  )
}

export function buildTransferProofMessage(
  input: { id: number | string; playerName?: string; eventTitle?: string; amountDue?: number | null },
  baseUrl: string,
): string {
  return [
    '💸 Bukti Transfer Masuk',
    `Ref: reg-${input.id}`,
    `Nama: ${dash(input.playerName)}`,
    `Acara: ${dash(input.eventTitle)}`,
    `Nominal: ${idr(input.amountDue)}`,
    `Verifikasi: ${baseUrl}/admin/manual-transfers`,
  ].join('\n')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:int tests/int/whatsapp-messages.int.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utilities/whatsapp/messages.ts tests/int/whatsapp-messages.int.spec.ts
git commit -m "feat(whatsapp): Indonesian message builders with admin deep-links"
```

---

### Task 3: Sponsorship trigger (`SponsorRegistrations` afterChange)

**Files:**
- Create: `src/collections/SponsorRegistrations/hooks/notifyWhatsApp.ts`
- Modify: `src/collections/SponsorRegistrations/index.ts` (register the hook)
- Test: `tests/int/whatsapp-sponsor-hook.int.spec.ts`

**Interfaces:**
- Consumes: `sendWhatsAppNotification` (Task 1), `buildSponsorInquiryMessage` (Task 2).
- Produces: `notifySponsorInquiry` (a Payload `CollectionAfterChangeHook`).

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/whatsapp-sponsor-hook.int.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utilities/whatsapp/sendWhatsAppNotification', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}))

import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { notifySponsorInquiry } from '@/collections/SponsorRegistrations/hooks/notifyWhatsApp'

const sendMock = vi.mocked(sendWhatsAppNotification)

describe('notifySponsorInquiry', () => {
  beforeEach(() => sendMock.mockClear())

  it('sends a sponsor message on create', async () => {
    const doc = { id: 7, companyName: 'Acme', contactName: 'Budi', email: 'b@acme.id', selectedTier: 'EAGLE' }
    // @ts-expect-error partial hook args for unit test
    await notifySponsorInquiry({ doc, operation: 'create', req: {} })
    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock.mock.calls[0][0]).toContain('Acme')
    expect(sendMock.mock.calls[0][0]).toContain('Pengajuan Sponsor Baru')
  })

  it('does nothing on update', async () => {
    // @ts-expect-error partial hook args for unit test
    await notifySponsorInquiry({ doc: { id: 7 }, operation: 'update', req: {} })
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('never throws even if the sender rejects', async () => {
    sendMock.mockRejectedValueOnce(new Error('boom'))
    // @ts-expect-error partial hook args for unit test
    await expect(notifySponsorInquiry({ doc: { id: 1 }, operation: 'create', req: {} })).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int tests/int/whatsapp-sponsor-hook.int.spec.ts`
Expected: FAIL — cannot find module `notifyWhatsApp`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/collections/SponsorRegistrations/hooks/notifyWhatsApp.ts
import type { CollectionAfterChangeHook } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { buildSponsorInquiryMessage } from '@/utilities/whatsapp/messages'

export const notifySponsorInquiry: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation !== 'create') return
  try {
    const baseUrl = process.env.BASE_URL || getServerSideURL()
    await sendWhatsAppNotification(buildSponsorInquiryMessage(doc as never, baseUrl))
  } catch (err) {
    console.error('Sponsor WhatsApp notify failed:', err instanceof Error ? err.message : err)
  }
}
```

- [ ] **Step 4: Register the hook** in `src/collections/SponsorRegistrations/index.ts`

Add the import at the top (after the existing imports):

```ts
import { notifySponsorInquiry } from './hooks/notifyWhatsApp'
```

Add a `hooks` key to the collection config object (alongside `slug`, `fields`, `access`, etc.):

```ts
  hooks: {
    afterChange: [notifySponsorInquiry],
  },
```

- [ ] **Step 5: Run tests + typecheck**

Run: `bun run test:int tests/int/whatsapp-sponsor-hook.int.spec.ts`
Expected: PASS (3 tests).
Run: `npx tsc --noEmit` — Expected: no new errors in the touched files.

- [ ] **Step 6: Commit**

```bash
git add src/collections/SponsorRegistrations tests/int/whatsapp-sponsor-hook.int.spec.ts
git commit -m "feat(whatsapp): alert on new sponsorship inquiry"
```

---

### Task 4: Event-registration trigger (`EventRegistrations` afterChange)

**Files:**
- Create: `src/collections/EventRegistrations/hooks/notifyWhatsApp.ts`
- Modify: `src/collections/EventRegistrations/index.ts` (register the hook)
- Test: `tests/int/whatsapp-registration-hook.int.spec.ts`

**Interfaces:**
- Consumes: `sendWhatsAppNotification` (Task 1), `buildEventRegistrationMessage` (Task 2).
- Produces: `notifyEventRegistration` (a Payload `CollectionAfterChangeHook`). Resolves the event title best-effort via `req.payload`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/whatsapp-registration-hook.int.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utilities/whatsapp/sendWhatsAppNotification', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}))

import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { notifyEventRegistration } from '@/collections/EventRegistrations/hooks/notifyWhatsApp'

const sendMock = vi.mocked(sendWhatsAppNotification)

describe('notifyEventRegistration', () => {
  beforeEach(() => sendMock.mockClear())

  it('sends a registration message on create, resolving the event title', async () => {
    const req = { payload: { findByID: vi.fn().mockResolvedValue({ title: 'Polinema Cup' }) } }
    const doc = { id: 20, playerName: 'Sita', category: 'alumni', paymentMethod: 'bank-transfer', event: 10 }
    // @ts-expect-error partial hook args for unit test
    await notifyEventRegistration({ doc, operation: 'create', req })
    expect(sendMock).toHaveBeenCalledTimes(1)
    const msg = sendMock.mock.calls[0][0]
    expect(msg).toContain('reg-20')
    expect(msg).toContain('Sita')
    expect(msg).toContain('Polinema Cup')
  })

  it('does nothing on update', async () => {
    // @ts-expect-error partial hook args for unit test
    await notifyEventRegistration({ doc: { id: 1 }, operation: 'update', req: {} })
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('still sends (title omitted) if event lookup fails', async () => {
    const req = { payload: { findByID: vi.fn().mockRejectedValue(new Error('no')) } }
    // @ts-expect-error partial hook args for unit test
    await notifyEventRegistration({ doc: { id: 5, playerName: 'X', event: 99 }, operation: 'create', req })
    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock.mock.calls[0][0]).toContain('reg-5')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int tests/int/whatsapp-registration-hook.int.spec.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/collections/EventRegistrations/hooks/notifyWhatsApp.ts
import type { CollectionAfterChangeHook } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { buildEventRegistrationMessage } from '@/utilities/whatsapp/messages'

async function resolveEventTitle(req: { payload?: { findByID: Function } }, event: unknown): Promise<string | undefined> {
  if (event && typeof event === 'object' && 'title' in event) return String((event as { title: unknown }).title)
  const id = typeof event === 'number' || typeof event === 'string' ? event : undefined
  if (id == null || !req.payload) return undefined
  try {
    const ev = await req.payload.findByID({ collection: 'events', id, depth: 0 })
    return ev?.title ? String(ev.title) : undefined
  } catch {
    return undefined
  }
}

export const notifyEventRegistration: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return
  try {
    const baseUrl = process.env.BASE_URL || getServerSideURL()
    const eventTitle = await resolveEventTitle(req as never, (doc as { event?: unknown }).event)
    await sendWhatsAppNotification(buildEventRegistrationMessage({ ...(doc as never), eventTitle }, baseUrl))
  } catch (err) {
    console.error('Registration WhatsApp notify failed:', err instanceof Error ? err.message : err)
  }
}
```

- [ ] **Step 4: Register the hook** in `src/collections/EventRegistrations/index.ts`

Add import after existing imports:

```ts
import { notifyEventRegistration } from './hooks/notifyWhatsApp'
```

Add (or extend) the `hooks` key on the collection config:

```ts
  hooks: {
    afterChange: [notifyEventRegistration],
  },
```

If a `hooks` key already exists, append `notifyEventRegistration` to its `afterChange` array instead of adding a second key.

- [ ] **Step 5: Run tests + typecheck**

Run: `bun run test:int tests/int/whatsapp-registration-hook.int.spec.ts`
Expected: PASS (3 tests).
Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add src/collections/EventRegistrations tests/int/whatsapp-registration-hook.int.spec.ts
git commit -m "feat(whatsapp): alert on new event registration"
```

---

### Task 5: Contact-form trigger (form-builder submission hook)

**Files:**
- Create: `src/hooks/notifyContactSubmission.ts`
- Modify: `src/plugins/index.ts` (add `formSubmissionOverrides.hooks.afterChange`)
- Test: `tests/int/whatsapp-contact-hook.int.spec.ts`

**Interfaces:**
- Consumes: `sendWhatsAppNotification` (Task 1), `buildContactMessage` (Task 2).
- Produces: `notifyContactSubmission` (a Payload `CollectionAfterChangeHook`).

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/whatsapp-contact-hook.int.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utilities/whatsapp/sendWhatsAppNotification', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}))

import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { notifyContactSubmission } from '@/hooks/notifyContactSubmission'

const sendMock = vi.mocked(sendWhatsAppNotification)

describe('notifyContactSubmission', () => {
  beforeEach(() => sendMock.mockClear())

  it('sends a contact message on create with submission fields', async () => {
    const doc = { id: 3, submissionData: [{ field: 'name', value: 'Rama' }, { field: 'message', value: 'Tanya tiket' }] }
    // @ts-expect-error partial hook args for unit test
    await notifyContactSubmission({ doc, operation: 'create', req: {} })
    expect(sendMock).toHaveBeenCalledTimes(1)
    const msg = sendMock.mock.calls[0][0]
    expect(msg).toContain('Pesan Kontak Baru')
    expect(msg).toContain('Rama')
    expect(msg).toContain('Tanya tiket')
  })

  it('does nothing on update', async () => {
    // @ts-expect-error partial hook args for unit test
    await notifyContactSubmission({ doc: { id: 3 }, operation: 'update', req: {} })
    expect(sendMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int tests/int/whatsapp-contact-hook.int.spec.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/hooks/notifyContactSubmission.ts
import type { CollectionAfterChangeHook } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { buildContactMessage } from '@/utilities/whatsapp/messages'

export const notifyContactSubmission: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation !== 'create') return
  try {
    const baseUrl = process.env.BASE_URL || getServerSideURL()
    await sendWhatsAppNotification(buildContactMessage(doc as never, baseUrl))
  } catch (err) {
    console.error('Contact WhatsApp notify failed:', err instanceof Error ? err.message : err)
  }
}
```

- [ ] **Step 4: Wire into the form-builder plugin** in `src/plugins/index.ts`

Add the import at the top:

```ts
import { notifyContactSubmission } from '@/hooks/notifyContactSubmission'
```

Add `formSubmissionOverrides` to the existing `formBuilderPlugin({ ... })` call (sibling of `fields` and `formOverrides`):

```ts
    formSubmissionOverrides: {
      hooks: {
        afterChange: [notifyContactSubmission],
      },
    },
```

- [ ] **Step 5: Run tests + typecheck**

Run: `bun run test:int tests/int/whatsapp-contact-hook.int.spec.ts`
Expected: PASS (2 tests).
Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/notifyContactSubmission.ts src/plugins/index.ts tests/int/whatsapp-contact-hook.int.spec.ts
git commit -m "feat(whatsapp): alert on contact form submission"
```

---

### Task 6: Transfer-proof trigger (injected notifier in `processProofUpload`)

**Files:**
- Modify: `src/utilities/registration/processProofUpload.ts` (add optional `notifyProofUploaded` dep; call after success)
- Modify: `src/app/(frontend)/register/event/[eventSlug]/upload/actions.ts` (pass a real notifier)
- Create: `src/utilities/whatsapp/notifyProofUploaded.ts` (real notifier used by the action)
- Test: `tests/int/proof-upload.int.spec.ts` (extend), `tests/int/whatsapp-proof-notifier.int.spec.ts` (new)

**Interfaces:**
- Consumes: `sendWhatsAppNotification` (Task 1), `buildTransferProofMessage` (Task 2).
- Produces:
  - `ProofUploadDeps.notifyProofUploaded?: (registrationId: number) => Promise<void>` (optional; called after the successful update).
  - `notifyProofUploaded(payload, registrationId): Promise<void>` (real impl: fetches the registration + event, builds + sends).

- [ ] **Step 1: Write the failing test — processProofUpload calls the injected notifier on success only**

Add to `tests/int/proof-upload.int.spec.ts` (reuse the file's existing `payload` mock/DI helpers; add a fresh test):

```ts
it('calls notifyProofUploaded after a successful upload, not on a guard failure', async () => {
  const notify = vi.fn().mockResolvedValue(undefined)
  const verifyToken = () => ({ valid: true as const, registrationId: 42 })
  const payload = {
    findByID: vi.fn().mockResolvedValue({ id: 42, paymentStatus: 'awaiting-payment', status: 'pending' }),
    create: vi.fn().mockResolvedValue({ id: 100 }),
    update: vi.fn().mockResolvedValue({ id: 42 }),
  }
  const okRes = await processProofUpload(
    { payload: payload as never, verifyToken, notifyProofUploaded: notify },
    { token: 't', file: { filename: 'p.png', mimeType: 'image/png', size: 1024, data: Buffer.from('x') } },
  )
  expect(okRes.success).toBe(true)
  expect(notify).toHaveBeenCalledWith(42)

  // guard failure (expired) → notifier NOT called
  notify.mockClear()
  const expired = await processProofUpload(
    { payload: payload as never, verifyToken: () => ({ valid: false as const, reason: 'expired' }), notifyProofUploaded: notify },
    { token: 't', file: { filename: 'p.png', mimeType: 'image/png', size: 1024, data: Buffer.from('x') } },
  )
  expect(expired.success).toBe(false)
  expect(notify).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int tests/int/proof-upload.int.spec.ts`
Expected: FAIL — `notifyProofUploaded` not part of deps / not called.

- [ ] **Step 3: Implement in `processProofUpload.ts`**

Add to the `ProofUploadDeps` type:

```ts
  notifyProofUploaded?: (registrationId: number) => Promise<void>
```

At the very end, after the successful `payload.update({...})` and before `return { success: true, ... }`, add:

```ts
  try {
    await deps.notifyProofUploaded?.(registrationId)
  } catch (err) {
    console.error('Proof WhatsApp notify failed:', err instanceof Error ? err.message : err)
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:int tests/int/proof-upload.int.spec.ts`
Expected: PASS (existing tests + the new one).

- [ ] **Step 5: Write the failing test for the real notifier**

```ts
// tests/int/whatsapp-proof-notifier.int.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utilities/whatsapp/sendWhatsAppNotification', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}))

import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { notifyProofUploaded } from '@/utilities/whatsapp/notifyProofUploaded'

const sendMock = vi.mocked(sendWhatsAppNotification)

describe('notifyProofUploaded', () => {
  beforeEach(() => sendMock.mockClear())

  it('fetches the registration + event and sends a transfer-proof message', async () => {
    const payload = {
      findByID: vi.fn()
        .mockResolvedValueOnce({ id: 20, playerName: 'Sita', amountDue: 4000000, event: 10 }) // event-registrations
        .mockResolvedValueOnce({ title: 'Polinema Cup' }), // events
    }
    await notifyProofUploaded(payload as never, 20)
    expect(sendMock).toHaveBeenCalledTimes(1)
    const msg = sendMock.mock.calls[0][0]
    expect(msg).toContain('reg-20')
    expect(msg).toContain('4.000.000')
    expect(msg).toContain('Polinema Cup')
  })
})
```

- [ ] **Step 6: Run to verify it fails**

Run: `bun run test:int tests/int/whatsapp-proof-notifier.int.spec.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 7: Implement the real notifier**

```ts
// src/utilities/whatsapp/notifyProofUploaded.ts
import type { Payload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { buildTransferProofMessage } from '@/utilities/whatsapp/messages'

export async function notifyProofUploaded(
  payload: Pick<Payload, 'findByID'>,
  registrationId: number,
): Promise<void> {
  const baseUrl = process.env.BASE_URL || getServerSideURL()
  const reg = (await payload.findByID({
    collection: 'event-registrations',
    id: registrationId,
    depth: 0,
  })) as { id: number; playerName?: string; amountDue?: number | null; event?: unknown } | null
  if (!reg) return

  let eventTitle: string | undefined
  const ev = reg.event
  if (ev != null && (typeof ev === 'number' || typeof ev === 'string')) {
    try {
      const e = await payload.findByID({ collection: 'events', id: ev, depth: 0 })
      eventTitle = e?.title ? String(e.title) : undefined
    } catch {
      /* best-effort */
    }
  }

  await sendWhatsAppNotification(
    buildTransferProofMessage(
      { id: reg.id, playerName: reg.playerName, amountDue: reg.amountDue, eventTitle },
      baseUrl,
    ),
  )
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `bun run test:int tests/int/whatsapp-proof-notifier.int.spec.ts`
Expected: PASS.

- [ ] **Step 9: Wire the real notifier into the upload action**

In `src/app/(frontend)/register/event/[eventSlug]/upload/actions.ts`, add the import:

```ts
import { notifyProofUploaded } from '@/utilities/whatsapp/notifyProofUploaded'
```

In `submitTransferProof`, pass it into the `processProofUpload` deps (the object currently `{ payload, verifyToken: verifyUploadToken }`):

```ts
  const result = await processProofUpload(
    {
      payload,
      verifyToken: verifyUploadToken,
      notifyProofUploaded: (registrationId) => notifyProofUploaded(payload, registrationId),
    },
    {
      token,
      file: { filename: file.name, mimeType: file.type, size: file.size, data: buffer },
    },
  )
```

- [ ] **Step 10: Full typecheck + touched suites**

Run: `npx tsc --noEmit` — Expected: no new errors.
Run: `bun run test:int tests/int/proof-upload.int.spec.ts tests/int/whatsapp-proof-notifier.int.spec.ts`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add src/utilities/registration/processProofUpload.ts src/utilities/whatsapp/notifyProofUploaded.ts "src/app/(frontend)/register/event/[eventSlug]/upload/actions.ts" tests/int/proof-upload.int.spec.ts tests/int/whatsapp-proof-notifier.int.spec.ts
git commit -m "feat(whatsapp): alert on transfer-proof upload"
```

---

### Task 7: Verify full suite + deployment checklist

**Files:** none (verification + ops).

- [ ] **Step 1: Run the whole integration suite**

Run: `bun run test:int`
Expected: all WhatsApp specs pass; no previously-passing test regressed. (Pre-existing type errors in `tests/int/golf-collections.int.spec.ts` are unrelated and out of scope.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -v golf-collections`
Expected: no errors in WhatsApp/notification files.

- [ ] **Step 3: Provision Fonnte env vars in Vercel** (all environments)

```bash
printf '%s' "<FONNTE_DEVICE_TOKEN>" | npx vercel env add FONNTE_TOKEN production
printf '%s' "<WHATSAPP_GROUP_ID>"   | npx vercel env add FONNTE_TARGET production
# repeat for preview + development
```

Note: until these are set the feature safely no-ops (logs a warning, sends nothing). Set them, then redeploy so runtime picks them up.

- [ ] **Step 4: Final commit if anything adjusted during verification** (otherwise skip)

---

## Self-Review

**Spec coverage:**
- Trigger 1 sponsorship → Task 3 ✓
- Trigger 2 event registration → Task 4 ✓
- Trigger 3 contact submission → Task 5 ✓
- Trigger 4 transfer proof → Task 6 ✓
- Non-fatal Fonnte client → Task 1 ✓
- Pure Indonesian builders + admin deep-links → Task 2 ✓
- Env vars in `.env.example` + Vercel → Task 1 (example) + Task 7 (Vercel) ✓
- IDR formatting, BASE_URL links, truncation → Task 2 ✓
- TDD + non-fatal guards at every call-site → all tasks ✓

**Placeholder scan:** none — every step has concrete code/commands.

**Type consistency:** `sendWhatsAppNotification(message) → {success,error?}` used consistently; builder signatures in Task 2 match their call-sites in Tasks 3–6; `ProofUploadDeps.notifyProofUploaded?: (registrationId: number) => Promise<void>` matches the action wiring and the real `notifyProofUploaded(payload, registrationId)` (the action adapts via `(registrationId) => notifyProofUploaded(payload, registrationId)`).
