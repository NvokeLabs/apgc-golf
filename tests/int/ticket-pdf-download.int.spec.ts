/**
 * Ticket PDF route — public but gated by the ticket code so sequential ids
 * can't be enumerated. Admin tickets list links with ?code={ticketCode}.
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>
  return { ...mod, getPayload: vi.fn().mockResolvedValue(routePayload) }
})

const routeTicket = {
  id: 99,
  ticketCode: 'APGC-42-abcd',
  registration: { id: 42, playerName: 'Budi Santoso', category: 'general' },
  event: {
    id: 10,
    title: 'APGC Open 2026',
    date: '2026-08-15T08:00:00.000Z',
    location: 'Sentul Golf Course',
  },
  qrCodeData: 'data:image/png;base64,QR==',
}
const routePayload = {
  findByID: vi.fn().mockResolvedValue(routeTicket),
  auth: vi.fn().mockResolvedValue({ user: null }),
}

describe('GET /api/tickets/[id]/pdf', () => {
  async function callRoute(url: string) {
    const { GET } = await import('@/app/(payload)/api/tickets/[id]/pdf/route')
    const { NextRequest } = await import('next/server')
    return GET(new NextRequest(url), { params: Promise.resolve({ id: '99' }) })
  }

  it('returns 404 when the code is missing and the request is unauthenticated', async () => {
    routePayload.auth.mockResolvedValueOnce({ user: null })
    const res = await callRoute('http://localhost:3000/api/tickets/99/pdf')
    expect(res.status).toBe(404)
  })

  it('returns 404 when the code does not match and the request is unauthenticated', async () => {
    routePayload.auth.mockResolvedValueOnce({ user: null })
    const res = await callRoute('http://localhost:3000/api/tickets/99/pdf?code=WRONG')
    expect(res.status).toBe(404)
  })

  it('returns the PDF without a code when the request is authenticated', async () => {
    routePayload.auth.mockResolvedValueOnce({ user: { id: 1, email: 'admin@apgc.test' } })
    const res = await callRoute('http://localhost:3000/api/tickets/99/pdf')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/pdf')
  })

  it('returns the PDF when the code matches', async () => {
    const res = await callRoute('http://localhost:3000/api/tickets/99/pdf?code=APGC-42-abcd')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/pdf')
  })
})
