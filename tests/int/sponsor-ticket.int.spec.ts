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
