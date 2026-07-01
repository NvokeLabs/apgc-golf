import { describe, it, expect, vi } from 'vitest'
import { approveTransfer, type ApproveTransferDeps } from '@/utilities/registration/approveTransfer'

/**
 * Story 8 — admin approves a manual transfer. On confirm: mark paid/confirmed,
 * record amountPaid + who/when verified, then issue the ticket via the shared
 * idempotent utility. Re-approving an already-paid registration must not write
 * verification metadata again or issue a second ticket.
 */

const NOW = 1_750_000_000_000

function makeDeps(overrides: Partial<ApproveTransferDeps> = {}) {
  const findByID = vi.fn(async () => ({ id: 42, paymentStatus: 'awaiting-verification' }))
  const update = vi.fn(async (arg: { data: Record<string, unknown> }) => ({ id: 42, ...arg.data }))
  const issueTicket = vi.fn(async (_payload: unknown, _registrationId: number) => ({
    ticket: { id: 555 },
    alreadyIssued: false,
    emailSent: true,
  }))
  const deps = {
    payload: { findByID, update },
    issueTicket,
    now: () => NOW,
    ...overrides,
  } as unknown as ApproveTransferDeps
  return { deps, findByID, update, issueTicket }
}

const input = { registrationId: 42, amountPaid: 500_000, verifiedById: 9 }

describe('approveTransfer', () => {
  it('marks paid/confirmed, records verification metadata, and issues the ticket', async () => {
    const { deps, update, issueTicket } = makeDeps()
    const result = await approveTransfer(deps, input)

    expect(result.success).toBe(true)
    if (!result.success) throw new Error('expected success')
    expect(result.ticketId).toBe(555)

    const data = update.mock.calls[0][0].data
    expect(data.paymentStatus).toBe('paid')
    expect(data.status).toBe('confirmed')
    expect(data.amountPaid).toBe(500_000)
    expect(data.verifiedBy).toBe(9)
    expect(typeof data.paidAt).toBe('string')
    expect(typeof data.verifiedAt).toBe('string')
    expect(issueTicket).toHaveBeenCalledTimes(1)
    expect(issueTicket.mock.calls[0][1]).toBe(42)
  })

  it('is idempotent: re-approving a paid registration issues no second ticket and rewrites nothing', async () => {
    const { deps, update, issueTicket } = makeDeps({
      payload: {
        findByID: vi.fn(async () => ({ id: 42, paymentStatus: 'paid' })),
        update: vi.fn(),
      },
    } as unknown as Partial<ApproveTransferDeps>)
    const result = await approveTransfer(deps, input)

    expect(result.success).toBe(true)
    if (!result.success) throw new Error('expected success')
    expect(result.alreadyIssued).toBe(true)
    expect(update).not.toHaveBeenCalled() // no metadata rewrite
    expect(issueTicket).toHaveBeenCalledTimes(1) // idempotent ensure-exists
  })

  it('returns an error when the registration is missing', async () => {
    const { deps, issueTicket } = makeDeps({
      payload: { findByID: vi.fn(async () => null), update: vi.fn() },
    } as unknown as Partial<ApproveTransferDeps>)
    const result = await approveTransfer(deps, input)
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.error).toMatch(/not found/i)
    expect(issueTicket).not.toHaveBeenCalled()
  })

  it('surfaces a non-fatal email failure (ticket still issued)', async () => {
    const { deps } = makeDeps({
      issueTicket: vi.fn(async () => ({
        ticket: { id: 555 },
        alreadyIssued: false,
        emailSent: false,
      })),
    } as unknown as Partial<ApproveTransferDeps>)
    const result = await approveTransfer(deps, input)
    expect(result.success).toBe(true)
    if (!result.success) throw new Error('expected success')
    expect(result.emailSent).toBe(false)
  })
})
