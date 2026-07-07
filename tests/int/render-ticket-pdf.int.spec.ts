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

  it('renders as a single page (background + overlays must not spill onto page 2)', async () => {
    const buffer = await renderTicketPdf({
      playerName: 'Budi Santoso',
      category: 'alumni',
      alumniMajor: 'Teknik Sipil',
      alumniClassYear: 2015,
      qrCodeDataUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
    })
    // Each page object is `/Type /Page` (the tree node is `/Type /Pages`).
    const pageCount = (buffer.toString('latin1').match(/\/Type\s*\/Page(?![s])/g) || []).length
    expect(pageCount).toBe(1)
  })
})
