import { describe, it, expect, vi } from 'vitest'
import { rejectTransfer, type RejectTransferDeps } from '@/utilities/registration/rejectTransfer'

/**
 * Story 9 — admin rejects a transfer. Sets paymentStatus=rejected with a
 * reason, issues NO ticket, and emails the registrant the reason + a fresh
 * signed re-upload link. An email failure is surfaced, not swallowed.
 */

const DAY_MS = 86_400_000
const registration = {
  id: 42,
  email: 'jane@example.com',
  playerName: 'Jane Doe',
  event: { slug: 'spring-open', date: '2026-09-01T00:00:00.000Z', endDate: null as string | null },
}

function makeDeps(overrides: Partial<RejectTransferDeps> = {}) {
  const findByID = vi.fn(async () => registration)
  const update = vi.fn(async (arg: { data: Record<string, unknown> }) => ({ id: 42, ...arg.data }))
  const mintToken = vi.fn((rid: number, exp: number) => `tok-${rid}-${exp}`)
  const sendRejectionEmail = vi.fn(
    async (_args: { to: string; playerName: string; reason: string; uploadUrl: string }) => ({
      success: true,
    }),
  )
  const deps = {
    payload: { findByID, update },
    mintToken,
    sendRejectionEmail,
    baseUrl: 'https://apgc.test',
    bufferDays: 3,
    ...overrides,
  } as unknown as RejectTransferDeps
  return { deps, findByID, update, mintToken, sendRejectionEmail }
}

const input = { registrationId: 42, rejectionReason: 'Amount did not match.' }

describe('rejectTransfer', () => {
  it('marks rejected with a reason and issues no ticket', async () => {
    const { deps, update } = makeDeps()
    const result = await rejectTransfer(deps, input)
    expect(result.success).toBe(true)

    const data = update.mock.calls[0][0].data
    expect(data.paymentStatus).toBe('rejected')
    expect(data.rejectionReason).toBe('Amount did not match.')
    expect('ticket' in data).toBe(false)
  })

  it('emails the reason and a fresh signed re-upload link (event-date+buffer TTL)', async () => {
    const { deps, mintToken, sendRejectionEmail } = makeDeps()
    await rejectTransfer(deps, input)

    const expectedExp = new Date(registration.event.date).getTime() + 3 * DAY_MS
    expect(mintToken).toHaveBeenCalledWith(42, expectedExp)

    const emailArg = sendRejectionEmail.mock.calls[0][0]
    expect(emailArg.to).toBe('jane@example.com')
    expect(emailArg.reason).toBe('Amount did not match.')
    expect(emailArg.uploadUrl).toBe(
      `https://apgc.test/register/event/spring-open/upload?token=${encodeURIComponent(
        `tok-42-${expectedExp}`,
      )}`,
    )
  })

  it('requires a rejection reason', async () => {
    const { deps, update } = makeDeps()
    const result = await rejectTransfer(deps, { registrationId: 42, rejectionReason: '  ' })
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.error).toMatch(/reason/i)
    expect(update).not.toHaveBeenCalled()
  })

  it('returns an error when the registration is missing', async () => {
    const { deps } = makeDeps({
      payload: { findByID: vi.fn(async () => null), update: vi.fn() },
    } as unknown as Partial<RejectTransferDeps>)
    const result = await rejectTransfer(deps, input)
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.error).toMatch(/not found/i)
  })

  it('surfaces an email send failure (rejection still applied)', async () => {
    const { deps, update } = makeDeps({
      sendRejectionEmail: vi.fn(async () => ({ success: false, error: 'smtp down' })),
    } as unknown as Partial<RejectTransferDeps>)
    const result = await rejectTransfer(deps, input)
    expect(result.success).toBe(true)
    if (!result.success) throw new Error('expected success')
    expect(result.emailSent).toBe(false)
    expect(result.emailError).toBe('smtp down')
    expect(update).toHaveBeenCalled() // status still set
  })
})
