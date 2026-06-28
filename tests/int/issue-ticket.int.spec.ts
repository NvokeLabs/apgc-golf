/**
 * Unit tests for issueTicketForRegistration utility.
 * Uses a fake payload object (no real DB) and fake deps (vi.fn).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { issueTicketForRegistration } from '@/utilities/ticketing/issueTicketForRegistration'
import type { IssueTicketDeps } from '@/utilities/ticketing/issueTicketForRegistration'

// ---------------------------------------------------------------------------
// Fake data
// ---------------------------------------------------------------------------
const fakeEvent = {
  id: 10,
  title: 'APGC Open 2026',
  date: '2026-08-15T08:00:00.000Z',
  location: 'Sentul Golf Course',
  slug: 'apgc-open-2026',
}

const fakeRegistrationBase = {
  id: 42,
  event: fakeEvent,
  playerName: 'Budi Santoso',
  email: 'budi@example.com',
  category: 'general' as const,
  agreedToTerms: true,
  updatedAt: '2026-06-28T00:00:00.000Z',
  createdAt: '2026-06-28T00:00:00.000Z',
}

const fakeTicket = {
  id: 99,
  ticketCode: 'APGC-42-abcd',
  registration: 42,
  event: 10,
  qrCodeData: 'data:image/png;base64,QR==',
  status: 'pending' as const,
  updatedAt: '2026-06-28T00:00:00.000Z',
  createdAt: '2026-06-28T00:00:00.000Z',
}

// ---------------------------------------------------------------------------
// Helpers to build fake payload + deps
// ---------------------------------------------------------------------------
function makeFakeDeps(overrides: Partial<IssueTicketDeps> = {}): IssueTicketDeps {
  return {
    generateTicketCode: vi.fn().mockReturnValue('APGC-42-abcd'),
    generateQRCode: vi.fn().mockResolvedValue('data:image/png;base64,QR=='),
    sendTicketEmail: vi.fn().mockResolvedValue({ success: true }),
    ...overrides,
  }
}

function makeFakePayload(registrationOverride: Record<string, unknown> = {}) {
  const registration = { ...fakeRegistrationBase, ticket: null, ...registrationOverride }
  return {
    findByID: vi.fn().mockResolvedValue(registration),
    create: vi.fn().mockResolvedValue(fakeTicket),
    update: vi.fn().mockResolvedValue({}),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('issueTicketForRegistration', () => {
  // S2.1 — happy path: no existing ticket
  describe('S2.1 happy path (no existing ticket)', () => {
    it('creates exactly one ticket with the right shape', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps()

      await issueTicketForRegistration(payload as any, 42, deps)

      expect(payload.create).toHaveBeenCalledOnce()
      const createArgs = payload.create.mock.calls[0][0]
      expect(createArgs.collection).toBe('tickets')
      expect(createArgs.data).toMatchObject({
        ticketCode: 'APGC-42-abcd',
        registration: 42,
        event: fakeEvent.id,
        qrCodeData: 'data:image/png;base64,QR==',
        status: 'pending',
      })
    })

    it('links the ticket to the registration via update', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps()

      await issueTicketForRegistration(payload as any, 42, deps)

      const updateCalls = payload.update.mock.calls
      const linkCall = updateCalls.find((c: any[]) => c[0].data && c[0].data.ticket !== undefined)
      expect(linkCall).toBeDefined()
      expect(linkCall![0].data.ticket).toBe(fakeTicket.id)
    })

    it('sends the ticket email exactly once', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps()

      await issueTicketForRegistration(payload as any, 42, deps)

      expect(deps.sendTicketEmail).toHaveBeenCalledOnce()
      const emailArgs = (deps.sendTicketEmail as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(emailArgs.to).toBe('budi@example.com')
      expect(emailArgs.playerName).toBe('Budi Santoso')
      expect(emailArgs.eventName).toBe('APGC Open 2026')
      expect(emailArgs.ticketCode).toBe('APGC-42-abcd')
    })

    it('returns { alreadyIssued:false, emailSent:true }', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps()

      const result = await issueTicketForRegistration(payload as any, 42, deps)

      expect(result.alreadyIssued).toBe(false)
      expect(result.emailSent).toBe(true)
      expect(result.ticket).toMatchObject({ id: fakeTicket.id })
    })

    it('sets ticketEmailSent:true on the registration', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps()

      await issueTicketForRegistration(payload as any, 42, deps)

      const updateCalls = payload.update.mock.calls
      const emailSentCall = updateCalls.find(
        (c: any[]) => c[0].data && 'ticketEmailSent' in c[0].data,
      )
      expect(emailSentCall).toBeDefined()
      expect(emailSentCall![0].data.ticketEmailSent).toBe(true)
    })

    it('generates QR code from the ticket code produced by generateTicketCode', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps()

      await issueTicketForRegistration(payload as any, 42, deps)

      const generatedCode = (deps.generateTicketCode as ReturnType<typeof vi.fn>).mock.results[0]
        .value
      expect(deps.generateQRCode).toHaveBeenCalledWith(generatedCode)
    })
  })

  // S2.2 — idempotency: registration already has a linked ticket
  describe('S2.2 idempotency (ticket already linked)', () => {
    it('does NOT call create', async () => {
      const payload = makeFakePayload({ ticket: fakeTicket })
      const deps = makeFakeDeps()

      await issueTicketForRegistration(payload as any, 42, deps)

      expect(payload.create).not.toHaveBeenCalled()
    })

    it('does NOT call sendTicketEmail', async () => {
      const payload = makeFakePayload({ ticket: fakeTicket })
      const deps = makeFakeDeps()

      await issueTicketForRegistration(payload as any, 42, deps)

      expect(deps.sendTicketEmail).not.toHaveBeenCalled()
    })

    it('returns { alreadyIssued:true, emailSent:false } with the existing ticket', async () => {
      const payload = makeFakePayload({ ticket: fakeTicket })
      const deps = makeFakeDeps()

      const result = await issueTicketForRegistration(payload as any, 42, deps)

      expect(result.alreadyIssued).toBe(true)
      expect(result.emailSent).toBe(false)
      expect(result.ticket).toMatchObject({ id: fakeTicket.id })
    })

    it('also handles idempotency when ticket is an id (number)', async () => {
      const payload = makeFakePayload({ ticket: 99 })
      const deps = makeFakeDeps()

      const result = await issueTicketForRegistration(payload as any, 42, deps)

      expect(result.alreadyIssued).toBe(true)
      expect(payload.create).not.toHaveBeenCalled()
    })
  })

  // S2.4 — email failure: sendTicketEmail returns success:false
  describe('S2.4 email failure (returns success:false)', () => {
    it('does NOT throw', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps({
        sendTicketEmail: vi.fn().mockResolvedValue({ success: false, error: 'SMTP error' }),
      })

      await expect(issueTicketForRegistration(payload as any, 42, deps)).resolves.not.toThrow()
    })

    it('still creates and links the ticket', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps({
        sendTicketEmail: vi.fn().mockResolvedValue({ success: false, error: 'SMTP error' }),
      })

      await issueTicketForRegistration(payload as any, 42, deps)

      expect(payload.create).toHaveBeenCalledOnce()
      const linkCall = payload.update.mock.calls.find(
        (c: any[]) => c[0].data && c[0].data.ticket !== undefined,
      )
      expect(linkCall).toBeDefined()
    })

    it('returns emailSent:false and sets ticketEmailSent:false', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps({
        sendTicketEmail: vi.fn().mockResolvedValue({ success: false, error: 'SMTP error' }),
      })

      const result = await issueTicketForRegistration(payload as any, 42, deps)

      expect(result.emailSent).toBe(false)
      const emailSentCall = payload.update.mock.calls.find(
        (c: any[]) => c[0].data && 'ticketEmailSent' in c[0].data,
      )
      expect(emailSentCall![0].data.ticketEmailSent).toBe(false)
    })
  })

  // S2.4b — email throws
  describe('S2.4b email throws', () => {
    it('does NOT propagate the throw', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps({
        sendTicketEmail: vi.fn().mockRejectedValue(new Error('network timeout')),
      })

      await expect(issueTicketForRegistration(payload as any, 42, deps)).resolves.toBeDefined()
    })

    it('ticket is still created, emailSent is false', async () => {
      const payload = makeFakePayload()
      const deps = makeFakeDeps({
        sendTicketEmail: vi.fn().mockRejectedValue(new Error('network timeout')),
      })

      const result = await issueTicketForRegistration(payload as any, 42, deps)

      expect(payload.create).toHaveBeenCalledOnce()
      expect(result.emailSent).toBe(false)
    })
  })
})
