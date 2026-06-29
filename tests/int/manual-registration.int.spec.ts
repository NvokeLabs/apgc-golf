import { describe, it, expect, vi } from 'vitest'
import {
  issueManualRegistration,
  type ManualRegistrationDeps,
} from '@/utilities/registration/issueManualRegistration'

/**
 * Story 5 — manual bank-transfer branch in the registration flow.
 *
 * The core is dependency-injected (payload + token minter) so it can be tested
 * without a DB or Xendit. It must: price by category, create the registration
 * as bank-transfer / awaiting-payment, NEVER call Xendit, and mint an upload
 * token whose TTL is derived from the event date (+ buffer).
 */

const DAY_MS = 86_400_000

const event = {
  id: 7,
  title: 'Spring Open',
  slug: 'spring-open',
  price: 500_000,
  alumniPrice: 300_000,
  date: '2026-09-01T00:00:00.000Z',
  endDate: null as string | null,
}

function makeDeps(overrides: Partial<ManualRegistrationDeps> = {}) {
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 42,
    ...data,
  }))
  const findByID = vi.fn(async () => event)
  const mintToken = vi.fn((rid: number, exp: number) => `token-${rid}-${exp}`)
  const deps = {
    payload: { findByID, create },
    mintToken,
    bufferDays: 3,
    ...overrides,
  } as unknown as ManualRegistrationDeps
  return { deps, create, findByID, mintToken }
}

const input = {
  eventId: 7,
  playerName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '081234',
  category: 'general' as const,
}

describe('issueManualRegistration', () => {
  it('creates a bank-transfer / awaiting-payment registration priced by category', async () => {
    const { deps, create } = makeDeps()
    const result = await issueManualRegistration(deps, input)

    expect(result.success).toBe(true)
    if (!result.success) throw new Error('expected success')
    expect(result.registrationId).toBe(42)
    expect(result.amount).toBe(500_000)

    const created = create.mock.calls[0][0].data
    expect(created.paymentMethod).toBe('bank-transfer')
    expect(created.paymentStatus).toBe('awaiting-payment')
    expect(created.status).toBe('pending')
    expect(created.event).toBe(7)
    expect(created.agreedToTerms).toBe(true)
    expect(created.phone).toBe('+6281234') // leading zero stripped, +62 prefixed
    expect(result.eventSlug).toBe('spring-open') // for building the upload link
  })

  it('NEVER calls Xendit (no checkoutUrl, no xendit fields persisted)', async () => {
    const { deps, create } = makeDeps()
    const result = await issueManualRegistration(deps, input)

    expect(result.success).toBe(true)
    if (!result.success) throw new Error('expected success')
    expect('checkoutUrl' in result).toBe(false)
    const created = create.mock.calls[0][0].data
    expect(created.xenditSessionId).toBeUndefined()
    expect(created.xenditCheckoutUrl).toBeUndefined()
  })

  it('mints an upload token for the new registration id with event-date+buffer TTL', async () => {
    const { deps, mintToken } = makeDeps()
    const result = await issueManualRegistration(deps, input)
    if (!result.success) throw new Error('expected success')

    const expectedExp = new Date(event.date).getTime() + 3 * DAY_MS
    expect(mintToken).toHaveBeenCalledWith(42, expectedExp)
    expect(result.expiresAt).toBe(expectedExp)
    expect(result.uploadToken).toBe(`token-42-${expectedExp}`)
  })

  it('derives TTL from endDate when present', async () => {
    const withEnd = { ...event, endDate: '2026-09-03T00:00:00.000Z' }
    const { deps } = makeDeps({
      payload: {
        findByID: vi.fn(async () => withEnd),
        create: vi.fn(async ({ data }) => ({ id: 1, ...data })),
      },
    } as unknown as Partial<ManualRegistrationDeps>)
    const result = await issueManualRegistration(deps, input)
    if (!result.success) throw new Error('expected success')
    expect(result.expiresAt).toBe(new Date(withEnd.endDate).getTime() + 3 * DAY_MS)
  })

  it('uses alumniPrice for alumni, falling back to price when unset', async () => {
    const { deps } = makeDeps()
    const alumni = await issueManualRegistration(deps, { ...input, category: 'alumni' })
    if (!alumni.success) throw new Error('expected success')
    expect(alumni.amount).toBe(300_000)

    const { deps: deps2 } = makeDeps({
      payload: {
        findByID: vi.fn(async () => ({ ...event, alumniPrice: null })),
        create: vi.fn(async ({ data }) => ({ id: 1, ...data })),
      },
    } as unknown as Partial<ManualRegistrationDeps>)
    const fallback = await issueManualRegistration(deps2, { ...input, category: 'alumni' })
    if (!fallback.success) throw new Error('expected success')
    expect(fallback.amount).toBe(500_000)
  })

  it('returns an error when the event is missing', async () => {
    const { deps } = makeDeps({
      payload: { findByID: vi.fn(async () => null), create: vi.fn() },
    } as unknown as Partial<ManualRegistrationDeps>)
    const result = await issueManualRegistration(deps, input)
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.error).toMatch(/not found/i)
  })

  it('returns an error when the price is not configured', async () => {
    const { deps } = makeDeps({
      payload: {
        findByID: vi.fn(async () => ({ ...event, price: 0, alumniPrice: 0 })),
        create: vi.fn(),
      },
    } as unknown as Partial<ManualRegistrationDeps>)
    const result = await issueManualRegistration(deps, input)
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.error).toMatch(/price/i)
  })

  it('does not create a registration when validation fails', async () => {
    const { deps, create } = makeDeps({
      payload: { findByID: vi.fn(async () => null), create: vi.fn() },
    } as unknown as Partial<ManualRegistrationDeps>)
    await issueManualRegistration(deps, input)
    expect(create).not.toHaveBeenCalled()
  })
})
