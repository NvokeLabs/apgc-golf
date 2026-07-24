/**
 * Ticket PDF overlay layout — measured against `ticket-bg.jpg`.
 *
 * The background image is the full standalone ticket artwork rendered from
 * `public/Direktur Polinema Cup Ticket - standalone.html` (Playwright, dsf 2),
 * with the PLAYER/FROM lines blank and the QR box empty.
 *
 * `TICKET_BG` is the artwork's REFERENCE (CSS-px) size — used only for the page
 * aspect ratio; the JPG itself is 2× that. `SLOTS` are NORMALIZED rects
 * (fractions 0..1 of width/height) where the dynamic content is drawn:
 *   - player: the blank line under "PLAYER"
 *   - from:   the blank line under "FROM"
 *   - qr:     inside the cream "QR CODE" box in the green stub
 * Measured + visually verified 2026-07-07 (red-box overlay check).
 */
export const TICKET_BG = { width: 1200, height: 1819 } as const

export type SlotRect = { x: number; y: number; w: number; h: number }

export const SLOTS: { player: SlotRect; from: SlotRect; qr: SlotRect; number: SlotRect } = {
  // value text sits just above each underline
  player: { x: 0.1, y: 0.168, w: 0.2567, h: 0.015 },
  from: { x: 0.385, y: 0.168, w: 0.2567, h: 0.015 },
  // square QR inset inside the rounded cream box
  qr: { x: 0.7642, y: 0.0825, w: 0.0817, h: 0.0539 },
  // over the "NO. ___" underscores at the top of the green stub
  number: { x: 0.885, y: 0.0405, w: 0.03, h: 0.008 },
}
