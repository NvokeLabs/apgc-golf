# Ticket PDF Redesign (Standalone Artwork) — Design

- **Date:** 2026-07-07
- **Status:** Approved
- **Branch:** `feat/ticket-pdf-redesign`

## Goal

Make the confirmation email's ticket PDF match the designed
`public/Direktur Polinema Cup Ticket - standalone.html` artwork, with three
dynamic slots filled: **PLAYER** (name), **FROM** (alumni →
`{jurusan} · {angkatan}`, e.g. "Teknik Sipil · 2015"; non-alumni → "Non
Alumni"), and the **QR code** in the stub. The emailed PDF is the FULL document
(admit ticket + Rundown & Categories + Door Prize & Grand Prize sections).

Note: today the ticket email attaches NO pdf (`issueTicketForRegistration` calls
`sendTicketEmail` with only the inline QR). This work both builds the new PDF and
starts attaching it. The on-demand download route `/api/tickets/[id]/pdf`
already renders the react-pdf `TicketPDF` and switches to the same generator.

## Approach: overlay on the artwork (no runtime headless browser)

**Prep (one-time, committed by the controller):** using Playwright (already a
dep), render the standalone HTML and produce two committed artifacts:
1. `src/components/TicketPDF/assets/ticket-bg.jpg` — the full document rendered
   at print-adequate DPI, compressed JPG, with PLAYER/FROM blank and the QR box
   empty. This IS the design; nothing is re-implemented.
2. Overlay coordinates as normalized fractions (of the background's width/height)
   for the PLAYER value line, the FROM value line, and the QR box, plus the
   background's pixel dimensions/aspect ratio. Stored as a constants module
   `src/components/TicketPDF/layout.ts`. Coordinates are measured against the
   exported image and VERIFIED by rendering a sample ticket and eyeballing
   alignment before the feature is wired to email.

**Runtime `TicketPDF` (`@react-pdf/renderer`), rewritten:**
- One `<Page>` sized to the artwork's aspect ratio (portrait, tall — the full
  document).
- A full-bleed `<Image src={ticketBg}>` covering the page.
- Overlays positioned absolutely from the normalized coordinates:
  - `<Text>` PLAYER = `playerName`.
  - `<Text>` FROM = `formatTicketFrom(category, alumniMajor, alumniClassYear)`.
  - `<Image>` QR = `qrCodeDataUrl` placed in the QR box rect.
- A serif font approximating the design is registered for the overlay text
  (colour/size chosen to sit on the blank PLAYER/FROM lines).
- The background asset is embedded so it loads in the Vercel serverless bundle
  (import as a module asset / base64 constant — chosen in the plan to keep the
  bundle reasonable; JPG kept small).

**Shared generator:** extract `renderTicketPdf(params): Promise<Buffer>` (wraps
`renderToBuffer(TicketPDF(...))`). Used by BOTH the download route and the email
path so they never drift.

**FROM helper (pure):**
```ts
// src/utilities/ticketing/formatTicketFrom.ts
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

**Email wiring:** thread the generated buffer through
`issueTicketForRegistration` (add a `renderTicketPdf` dep / call) →
`sendTicketEmail` (already accepts `pdfBuffer`). The registration is already
fetched at `depth:1`, exposing `category`, `alumniMajor`, `alumniClassYear` for
FROM.

## Data / DB

None. The alumni columns already shipped. Pure code + one committed image asset.

## Testing (TDD)

- `formatTicketFrom(...)` — alumni with both fields → `"{major} · {year}"`;
  alumni missing a field → `"Non Alumni"`; non-alumni → `"Non Alumni"`.
- `renderTicketPdf(...)` — returns a non-empty `Buffer` whose first bytes are the
  `%PDF` magic (smoke test that the background asset loads and the pipeline runs).
- `issueTicketForRegistration` — with fake deps, assert it now produces a
  `pdfBuffer` and passes it to `sendTicketEmail` (today it passes none), and that
  FROM data is derived from the registration.

## Out of scope

- The headless-browser HTML→PDF approach (rejected for serverless weight).
- Editing the Rundown/Door-Prize content or the artwork itself.
- The `NO. ___` stub field (left as the design has it).
- Any change to the check-in QR semantics (same `qrCodeData`).
