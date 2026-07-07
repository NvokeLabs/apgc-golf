# Ticket PDF Redesign (Standalone Artwork) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do TDD: write the failing test first, watch it fail, then implement.

**Goal:** Replace the hand-built react-pdf ticket layout with an **overlay-on-artwork** PDF. A committed full-document background image (`ticket-bg.jpg`) is rendered full-bleed; three dynamic slots are overlaid on top — **PLAYER** (`playerName`), **FROM** (alumni → `"{alumniMajor} · {alumniClassYear}"`, else `"Non Alumni"`), and the **QR code** (`qrCodeDataUrl`) in the stub. A single shared `renderTicketPdf(params): Promise<Buffer>` powers BOTH the on-demand download route (`/api/tickets/[id]/pdf`) and the confirmation email, and the email now attaches the FULL PDF (today it attaches none).

**Architecture:** Pure FROM formatter (`formatTicketFrom`) → rewritten `TicketPDF` component (background `<Image>` + absolutely-positioned overlays driven by controller-provided `layout.ts` `TICKET_BG` dims + normalized `SLOTS` fractions) → shared `renderTicketPdf` wrapper around `renderToBuffer(TicketPDF(...))` → consumed by the download route and threaded through `issueTicketForRegistration` into `sendTicketEmail`'s already-supported `pdfBuffer`. No DB changes; the alumni columns already shipped.

**Tech Stack:** Payload CMS 3.64, Next.js 15.4 App Router, React 19, `@react-pdf/renderer` ^4.3.2, TypeScript, Vitest 3.2, bun.

## Global Constraints

- **Overlay-on-artwork, no runtime headless browser.** The PDF is produced entirely by `@react-pdf/renderer` at runtime. Playwright/HTML→PDF at request time is out of scope (rejected for serverless weight).
- **FROM format:** `formatTicketFrom` returns `` `${alumniMajor} · ${alumniClassYear}` `` **only** when `category === 'alumni' && alumniMajor && alumniClassYear`; otherwise `"Non Alumni"`. The separator is a middle dot `·` (U+00B7) with a single space on each side. Use the exact helper from the design spec — do not paraphrase.
- **The emailed PDF is the FULL document** (the whole artwork: admit ticket + Rundown & Categories + Door Prize & Grand Prize). There is no cropped/partial variant.
- **One shared generator.** `renderTicketPdf` is the single source of PDF bytes. The download route and the email path both call it so they never drift.
- **Controller-provided assets are inputs, not tasks.** `src/components/TicketPDF/assets/ticket-bg.jpg` and `src/components/TicketPDF/layout.ts` (exporting `TICKET_BG = { width, height }` and `SLOTS = { player, from, qr }` where each slot is `{ x, y, w, h }` as fractions 0..1) are committed by the controller. Reference the exported names; never invent pixel numbers or coordinates.
- **Visual calibration is the controller's responsibility.** react-pdf rendering fidelity (exact font size/colour/position sitting on the blank PLAYER/FROM lines) is verified by the controller eyeballing a sample render against the artwork. For these tasks the automated bar is: the `%PDF` smoke test passes and `bunx tsc --noEmit` is clean.
- **Test discovery:** Vitest `include` is `tests/int/**/*.int.spec.ts` (see `vitest.config.mts`). ALL new tests live under `tests/int/` with the `.int.spec.ts` suffix — co-located `src/**/*.spec.ts` files are NOT picked up. Run with `bun run test:int`; filter by path substring with `bun run test:int -- <filter>`.
- **Package manager is bun.** Never invoke pnpm/npm/yarn directly.
- **Per-task commit.** Each task ends with a single focused commit once its tests and `bunx tsc --noEmit` are green.

---

### Task 1: Pure `formatTicketFrom` helper + unit tests

**Files:**
- Create: `src/utilities/ticketing/formatTicketFrom.ts`
- Create: `tests/int/format-ticket-from.int.spec.ts`

**Interfaces:**
- Produces: `formatTicketFrom(category?: string | null, alumniMajor?: string | null, alumniClassYear?: number | null): string`. Consumed by `TicketPDF` (Task 2) and `issueTicketForRegistration` (Task 4, indirectly via `renderTicketPdf`).

- [ ] **Step 1: Write the failing test**

Create `tests/int/format-ticket-from.int.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { formatTicketFrom } from '@/utilities/ticketing/formatTicketFrom'

describe('formatTicketFrom', () => {
  it('alumni with both fields → "{major} · {year}"', () => {
    expect(formatTicketFrom('alumni', 'Teknik Sipil', 2015)).toBe('Teknik Sipil · 2015')
  })

  it('alumni missing major → "Non Alumni"', () => {
    expect(formatTicketFrom('alumni', null, 2015)).toBe('Non Alumni')
    expect(formatTicketFrom('alumni', '', 2015)).toBe('Non Alumni')
  })

  it('alumni missing class year → "Non Alumni"', () => {
    expect(formatTicketFrom('alumni', 'Teknik Sipil', null)).toBe('Non Alumni')
    expect(formatTicketFrom('alumni', 'Teknik Sipil', undefined)).toBe('Non Alumni')
  })

  it('non-alumni (general) → "Non Alumni" even with fields present', () => {
    expect(formatTicketFrom('general', 'Teknik Sipil', 2015)).toBe('Non Alumni')
  })

  it('undefined/null category → "Non Alumni"', () => {
    expect(formatTicketFrom(undefined, undefined, undefined)).toBe('Non Alumni')
    expect(formatTicketFrom(null, null, null)).toBe('Non Alumni')
  })
})
```

Run and watch it fail (module does not exist yet):

```
bun run test:int -- format-ticket-from
```

Expected: the file fails to import / all cases error because `formatTicketFrom` is not found.

- [ ] **Step 2: Implement**

Create `src/utilities/ticketing/formatTicketFrom.ts` — the EXACT helper from the design spec:

```ts
/**
 * Build the ticket "FROM" line.
 * Alumni with both a major and a class year → "{major} · {year}" (e.g. "Teknik Sipil · 2015").
 * Everyone else (general, or alumni missing a field) → "Non Alumni".
 */
export function formatTicketFrom(
  category?: string | null,
  alumniMajor?: string | null,
  alumniClassYear?: number | null,
): string {
  if (category === 'alumni' && alumniMajor && alumniClassYear) {
    return `${alumniMajor} · ${alumniClassYear}`
  }
  return 'Non Alumni'
}
```

- [ ] **Step 3: Verify**

```
bun run test:int -- format-ticket-from
bunx tsc --noEmit
```

Expected: the `format-ticket-from` suite passes (all cases green); tsc reports no errors.

- [ ] **Step 4: Commit** — `feat(ticket-pdf): add formatTicketFrom helper`

---

### Task 2: Rewrite `TicketPDF` to overlay on the background artwork

**Files:**
- Rewrite: `src/components/TicketPDF/TicketPDF.tsx`
- Consumes (controller-provided, assume present): `src/components/TicketPDF/assets/ticket-bg.jpg`, `src/components/TicketPDF/layout.ts` (`TICKET_BG`, `SLOTS`)
- Modify: `next.config.mjs` (trace the jpg into the serverless bundle)

**Interfaces:**
- Produces: new `TicketPDFProps = { playerName: string; category?: string | null; alumniMajor?: string | null; alumniClassYear?: number | null; qrCodeDataUrl: string }` and a `TicketPDF(props)` function returning a `<Document>` element. The old props (`playerEmail`, `eventName`, `eventDate`, `eventLocation`, `ticketCode`) are REMOVED — that content now lives baked into the artwork. Consumed by `renderTicketPdf` (Task 3).

**Notes / resolved decisions:**
- **Font:** use `@react-pdf/renderer`'s built-in serif family **`'Times-Roman'`** for overlay text. It ships with the library, so no external `.ttf` asset is required and nothing can go missing in the bundle. (If the controller later supplies a branded serif TTF under `assets/`, swap to `Font.register(...)` — not needed for this task.)
- **Background loading:** read the committed jpg once at module load with `fs.readFileSync`, resolved from `process.cwd()`, and pass it as a base64 data URL to `<Image>`. This keeps the asset out of webpack's module graph while staying deterministic on the server. Add `experimental.outputFileTracingIncludes` in `next.config.mjs` so Vercel ships the jpg with the route bundle.
- **Page sizing:** the page is a fixed portrait width (`PAGE_WIDTH = 595` pt, A4 width) with height derived from the artwork aspect ratio: `PAGE_HEIGHT = PAGE_WIDTH * (TICKET_BG.height / TICKET_BG.width)`. Every overlay position/size is `fraction * PAGE_WIDTH` (x/w) or `fraction * PAGE_HEIGHT` (y/h), so `SLOTS` stay resolution-independent.

- [ ] **Step 1: Rewrite `TicketPDF.tsx`**

```tsx
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { TICKET_BG, SLOTS } from './layout'
import { formatTicketFrom } from '@/utilities/ticketing/formatTicketFrom'

// Read the committed artwork once at module load and embed it as a data URL so it
// is available in the serverless bundle (see next.config.mjs outputFileTracingIncludes).
const BG_PATH = path.join(process.cwd(), 'src/components/TicketPDF/assets/ticket-bg.jpg')
const BG_DATA_URL = `data:image/jpeg;base64,${readFileSync(BG_PATH).toString('base64')}`

// Fixed portrait page width; height follows the artwork's aspect ratio.
const PAGE_WIDTH = 595
const PAGE_HEIGHT = PAGE_WIDTH * (TICKET_BG.height / TICKET_BG.width)

const px = (fx: number) => fx * PAGE_WIDTH
const py = (fy: number) => fy * PAGE_HEIGHT

const styles = StyleSheet.create({
  page: { position: 'relative' },
  bg: { position: 'absolute', top: 0, left: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT },
  overlayText: {
    position: 'absolute',
    fontFamily: 'Times-Roman',
    color: '#1a1a1a',
    textAlign: 'center',
    justifyContent: 'center',
  },
  qr: { position: 'absolute' },
})

export type TicketPDFProps = {
  playerName: string
  category?: string | null
  alumniMajor?: string | null
  alumniClassYear?: number | null
  qrCodeDataUrl: string
}

export function TicketPDF({
  playerName,
  category,
  alumniMajor,
  alumniClassYear,
  qrCodeDataUrl,
}: TicketPDFProps) {
  const fromText = formatTicketFrom(category, alumniMajor, alumniClassYear)

  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        {/* Full-bleed artwork */}
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt */}
        <Image src={BG_DATA_URL} style={styles.bg} />

        {/* PLAYER slot */}
        <Text
          style={[
            styles.overlayText,
            {
              left: px(SLOTS.player.x),
              top: py(SLOTS.player.y),
              width: px(SLOTS.player.w),
              height: py(SLOTS.player.h),
              fontSize: py(SLOTS.player.h) * 0.6,
            },
          ]}
        >
          {playerName}
        </Text>

        {/* FROM slot */}
        <Text
          style={[
            styles.overlayText,
            {
              left: px(SLOTS.from.x),
              top: py(SLOTS.from.y),
              width: px(SLOTS.from.w),
              height: py(SLOTS.from.h),
              fontSize: py(SLOTS.from.h) * 0.6,
            },
          ]}
        >
          {fromText}
        </Text>

        {/* QR slot */}
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt */}
        <Image
          src={qrCodeDataUrl}
          style={[
            styles.qr,
            {
              left: px(SLOTS.qr.x),
              top: py(SLOTS.qr.y),
              width: px(SLOTS.qr.w),
              height: py(SLOTS.qr.h),
            },
          ]}
        />
      </Page>
    </Document>
  )
}
```

- [ ] **Step 2: Trace the artwork into the bundle**

In `next.config.mjs`, add to the existing `experimental` block (alongside `serverActions`):

```js
  experimental: {
    serverActions: {
      bodySizeLimit: '11mb',
    },
    outputFileTracingIncludes: {
      '/api/tickets/[id]/pdf': ['./src/components/TicketPDF/assets/ticket-bg.jpg'],
    },
  },
```

- [ ] **Step 3: Verify (type + lint only — render is exercised in Task 3)**

```
bunx tsc --noEmit
```

Expected: no errors. In particular the download route (`route.ts`) will now FAIL tsc because it still passes the removed props — that is expected and fixed in Task 3. If you want a clean intermediate tsc, do Task 2 and Task 3 back-to-back before running `tsc` and committing.

> Rendering fidelity (font size, colour, exact placement on the blank lines) is NOT asserted here — that is the controller's visual calibration against `ticket-bg.jpg`. The automated proof that the component renders is the `%PDF` smoke test in Task 3.

- [ ] **Step 4: Commit** (combine with Task 3 if you prefer a green tsc at commit time) — `feat(ticket-pdf): overlay PLAYER/FROM/QR on background artwork`

---

### Task 3: Extract shared `renderTicketPdf` + `%PDF` smoke test + update download route

**Files:**
- Create: `src/utilities/ticketing/renderTicketPdf.ts`
- Create: `tests/int/render-ticket-pdf.int.spec.ts`
- Modify: `src/app/(payload)/api/tickets/[id]/pdf/route.ts`

**Interfaces:**
- Produces: `renderTicketPdf(params: RenderTicketPdfParams): Promise<Buffer>` where `RenderTicketPdfParams = TicketPDFProps` (`{ playerName, category?, alumniMajor?, alumniClassYear?, qrCodeDataUrl }`). Consumed by the download route (this task) and `issueTicketForRegistration` (Task 4).

- [ ] **Step 1: Write the failing smoke test**

Create `tests/int/render-ticket-pdf.int.spec.ts`. This depends on the controller-provided `ticket-bg.jpg` + `layout.ts` being present:

```ts
import { describe, it, expect } from 'vitest'
import { renderTicketPdf } from '@/utilities/ticketing/renderTicketPdf'

describe('renderTicketPdf', () => {
  it('returns a non-empty Buffer whose first bytes are the %PDF magic', async () => {
    const buffer = await renderTicketPdf({
      playerName: 'Budi Santoso',
      category: 'alumni',
      alumniMajor: 'Teknik Sipil',
      alumniClassYear: 2015,
      qrCodeDataUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
    })

    expect(Buffer.isBuffer(buffer)).toBe(true)
    expect(buffer.length).toBeGreaterThan(0)
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  })

  it('renders the non-alumni FROM path without throwing', async () => {
    const buffer = await renderTicketPdf({
      playerName: 'Siti',
      category: 'general',
      alumniMajor: null,
      alumniClassYear: null,
      qrCodeDataUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
    })
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  })
})
```

Run and watch it fail (module missing):

```
bun run test:int -- render-ticket-pdf
```

Expected: import failure — `renderTicketPdf` not found.

- [ ] **Step 2: Implement `renderTicketPdf.ts`**

```ts
import { renderToBuffer } from '@react-pdf/renderer'
import { TicketPDF } from '@/components/TicketPDF/TicketPDF'
import type { TicketPDFProps } from '@/components/TicketPDF/TicketPDF'

export type RenderTicketPdfParams = TicketPDFProps

/**
 * Single source of ticket PDF bytes. Used by the on-demand download route AND the
 * confirmation email so the two paths never drift.
 */
export async function renderTicketPdf(params: RenderTicketPdfParams): Promise<Buffer> {
  return renderToBuffer(TicketPDF(params))
}
```

- [ ] **Step 3: Update the download route** — replace the inline `renderToBuffer(TicketPDF({...}))` call so it uses the shared generator and the new props derived from the registration.

In `src/app/(payload)/api/tickets/[id]/pdf/route.ts`:
- Remove the `import { renderToBuffer } from '@react-pdf/renderer'` and `import { TicketPDF } from '@/components/TicketPDF/TicketPDF'` lines.
- Add `import { renderTicketPdf } from '@/utilities/ticketing/renderTicketPdf'`.
- The ticket is fetched at `depth: 2`, so `registration` is a full `EventRegistration` exposing `category`, `alumniMajor`, `alumniClassYear`. Replace the PDF generation block (the `eventDate` formatting is no longer needed for the PDF — the artwork is static — so it can be dropped) with:

```ts
    const pdfBuffer = await renderTicketPdf({
      playerName: registration.playerName,
      category: registration.category,
      alumniMajor: registration.alumniMajor,
      alumniClassYear: registration.alumniClassYear,
      qrCodeDataUrl: ticket.qrCodeData || '',
    })
```

The response block (`new NextResponse(pdfBuffer, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': ... } })`) is unchanged; keep the `ticket.ticketCode` filename.

- [ ] **Step 4: Verify**

```
bun run test:int -- render-ticket-pdf
bunx tsc --noEmit
```

Expected: both `render-ticket-pdf` cases pass (Buffers start with `%PDF-`); tsc clean (the route no longer references removed `TicketPDF` props).

- [ ] **Step 5: Commit** — `feat(ticket-pdf): shared renderTicketPdf powers download route`

---

### Task 4: Thread the generated PDF through `issueTicketForRegistration` → `sendTicketEmail`

**Files:**
- Modify: `src/utilities/ticketing/issueTicketForRegistration.ts`
- Modify: `tests/int/issue-ticket.int.spec.ts`

**Interfaces:**
- Consumes: `renderTicketPdf` (Task 3), `formatTicketFrom`-derived FROM data from the registration.
- Produces: `IssueTicketDeps` gains `renderTicketPdf: (params: RenderTicketPdfParams) => Promise<Buffer>`; the inline `sendTicketEmail` param type gains `pdfBuffer?: Buffer`. `issueTicketForRegistration` now generates a PDF buffer from the registration's `playerName`/`category`/`alumniMajor`/`alumniClassYear`/`qrCodeData` and passes it as `pdfBuffer` to `sendTicketEmail`. The email path must remain **email-safe**: a PDF-render failure must NEVER prevent the ticket from being created/linked.

- [ ] **Step 1: Extend the failing tests**

In `tests/int/issue-ticket.int.spec.ts`:

1. Extend `makeFakeDeps` to inject a fake `renderTicketPdf` and (so the new `pdfBuffer` assertions are meaningful) surface it via the fake `sendTicketEmail`:

```ts
function makeFakeDeps(overrides: Partial<IssueTicketDeps> = {}): IssueTicketDeps {
  return {
    generateTicketCode: vi.fn().mockReturnValue('APGC-42-abcd'),
    generateQRCode: vi.fn().mockResolvedValue('data:image/png;base64,QR=='),
    renderTicketPdf: vi.fn().mockResolvedValue(Buffer.from('%PDF-FAKE')),
    sendTicketEmail: vi.fn().mockResolvedValue({ success: true }),
    ...overrides,
  }
}
```

2. Add a new describe block asserting the PDF is generated from the registration and passed to the email. Put it inside the top-level `describe('issueTicketForRegistration', ...)`:

```ts
  // S2.5 — PDF attachment: buffer generated from the registration and passed to email
  describe('S2.5 PDF attachment', () => {
    it('renders a PDF from the registration FROM data (alumni)', async () => {
      const payload = makeFakePayload({
        category: 'alumni',
        alumniMajor: 'Teknik Sipil',
        alumniClassYear: 2015,
      })
      const deps = makeFakeDeps()

      await issueTicketForRegistration(payload as any, 42, deps)

      expect(deps.renderTicketPdf).toHaveBeenCalledOnce()
      const pdfArgs = (deps.renderTicketPdf as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(pdfArgs).toMatchObject({
        playerName: 'Budi Santoso',
        category: 'alumni',
        alumniMajor: 'Teknik Sipil',
        alumniClassYear: 2015,
        qrCodeDataUrl: 'data:image/png;base64,QR==',
      })
    })

    it('passes the generated pdfBuffer to sendTicketEmail', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps()

      await issueTicketForRegistration(payload as any, 42, deps)

      const emailArgs = (deps.sendTicketEmail as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(Buffer.isBuffer(emailArgs.pdfBuffer)).toBe(true)
      expect(emailArgs.pdfBuffer.toString('latin1')).toBe('%PDF-FAKE')
    })

    it('is email-safe: a PDF render failure still creates the ticket and does not throw', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps({
        renderTicketPdf: vi.fn().mockRejectedValue(new Error('render boom')),
      })

      const result = await issueTicketForRegistration(payload as any, 42, deps)

      expect(payload.create).toHaveBeenCalledOnce()
      expect(result.alreadyIssued).toBe(false)
      // Ticket exists; email may have been skipped/failed but nothing propagates.
      expect(result.ticket).toMatchObject({ id: fakeTicket.id })
    })
  })
```

Run and watch it fail:

```
bun run test:int -- issue-ticket
```

Expected: the new S2.5 cases fail — `deps.renderTicketPdf` is undefined / never called and `emailArgs.pdfBuffer` is undefined. Existing S2.1–S2.4c cases still pass.

- [ ] **Step 2: Implement in `issueTicketForRegistration.ts`**

1. Add the import:

```ts
import { renderTicketPdf as defaultRenderTicketPdf } from './renderTicketPdf'
import type { RenderTicketPdfParams } from './renderTicketPdf'
```

2. Extend `IssueTicketDeps`: add the `renderTicketPdf` dep and add `pdfBuffer?: Buffer` to the inline `sendTicketEmail` param type:

```ts
export type IssueTicketDeps = {
  generateTicketCode: (registrationId: number | string) => string
  generateQRCode: (data: string) => Promise<string>
  renderTicketPdf: (params: RenderTicketPdfParams) => Promise<Buffer>
  sendTicketEmail: (params: {
    to: string
    playerName: string
    eventName: string
    eventDate: string
    eventLocation: string
    ticketCode: string
    qrCodeDataUrl: string
    pdfBuffer?: Buffer
  }) => Promise<{ success: boolean; error?: string }>
}
```

3. Resolve the new default near the other deps:

```ts
  const renderTicketPdf = deps?.renderTicketPdf ?? defaultRenderTicketPdf
```

4. Generate the buffer email-safely and thread it into the send. Replace the "Send ticket email" block (step 7) so the PDF is rendered inside the try, and a render failure degrades to sending without an attachment rather than throwing:

```ts
  // 7. Render the ticket PDF (email-safe) and send the ticket email — never throw
  let emailSent = false
  try {
    let pdfBuffer: Buffer | undefined
    try {
      pdfBuffer = await renderTicketPdf({
        playerName: registration.playerName,
        category: registration.category,
        alumniMajor: registration.alumniMajor,
        alumniClassYear: registration.alumniClassYear,
        qrCodeDataUrl: qrCodeData,
      })
    } catch (pdfErr) {
      const msg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr)
      console.error(`[issueTicketForRegistration] PDF render failed: ${msg}`)
      pdfBuffer = undefined
    }

    const emailResult = await sendTicketEmail({
      to: registration.email,
      playerName: registration.playerName,
      eventName: typeof event === 'object' ? event.title : String(event),
      eventDate,
      eventLocation: typeof event === 'object' ? event.location || 'TBD' : 'TBD',
      ticketCode,
      qrCodeDataUrl: qrCodeData,
      pdfBuffer,
    })
    emailSent = emailResult.success
    if (!emailSent) {
      console.error(`[issueTicketForRegistration] Email failed: ${emailResult.error}`)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[issueTicketForRegistration] Email threw: ${msg}`)
    emailSent = false
  }
```

> Note the `registration` object here is fetched at `depth:1`, and `category`/`alumniMajor`/`alumniClassYear` are plain scalar columns on `EventRegistration` — available directly without extra depth.

- [ ] **Step 3: Verify**

```
bun run test:int -- issue-ticket
bun run test:int -- format-ticket-from
bun run test:int -- render-ticket-pdf
bunx tsc --noEmit
```

Expected: the full `issue-ticket` suite (S2.1–S2.5) passes, including the new PDF assertions; `format-ticket-from` and `render-ticket-pdf` still pass; tsc clean.

- [ ] **Step 4: Full suite + commit**

```
bun run test:int
bunx tsc --noEmit
```

Expected: whole integration suite green, tsc clean. Commit — `feat(ticket-pdf): attach generated ticket PDF to confirmation email`

---

## Sequencing & dependencies

1. **Task 1** (`formatTicketFrom`) — no dependencies.
2. **Task 2** (rewrite `TicketPDF`) — depends on Task 1 + controller assets (`ticket-bg.jpg`, `layout.ts`). Leaves the download route temporarily red on tsc; pair with Task 3 for a clean intermediate commit.
3. **Task 3** (`renderTicketPdf` + route) — depends on Task 2. First point where the `%PDF` smoke test can run end-to-end.
4. **Task 4** (email wiring) — depends on Task 3.

## Verification summary

- Unit-precise: `formatTicketFrom` (Task 1), `issueTicketForRegistration` dep threading (Task 4).
- Smoke (render pipeline runs, asset loads): `renderTicketPdf` returns a Buffer starting with `%PDF-` (Task 3).
- Not unit-tested (by design): react-pdf visual fidelity / overlay alignment — controller calibrates against `ticket-bg.jpg`; the automated bar is the `%PDF` smoke test + clean `bunx tsc --noEmit`.
