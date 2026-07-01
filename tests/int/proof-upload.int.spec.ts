import { describe, it, expect, vi } from 'vitest'
import {
  processProofUpload,
  type ProofUploadDeps,
  MAX_PROOF_BYTES,
} from '@/utilities/registration/processProofUpload'

/**
 * Story 6 — guarded proof upload (the highest-risk public surface, T1).
 *
 * The handler is dependency-injected (payload + token verifier) so the guard
 * logic is unit-testable without a DB or real storage. It MUST:
 *  - verify the signed token and reject a bare/forged/expired one,
 *  - be status-gated: reject once the registration is `paid` (read-only),
 *  - validate file type/size server-side,
 *  - write to the private proofs collection and move status to
 *    awaiting-verification, clearing any prior rejection reason,
 *  - be field-scoped: only transferProof / paymentStatus / rejectionReason
 *    are ever written on the registration.
 */

const VALID = { valid: true as const, registrationId: 42 }

function pngFile(size = 1024) {
  return { filename: 'proof.png', mimeType: 'image/png', size, data: Buffer.from('x') }
}

type CreateArg = {
  collection: string
  data: Record<string, unknown>
  file?: { mimetype?: string }
  overrideAccess?: boolean
}
type UpdateArg = {
  collection: string
  id: number
  data: Record<string, unknown>
  overrideAccess?: boolean
}

function makeDeps(overrides: Partial<ProofUploadDeps> = {}) {
  const findByID = vi.fn(async () => ({ id: 42, paymentStatus: 'awaiting-payment' }))
  const create = vi.fn(async (_arg: CreateArg) => ({ id: 900 }))
  const update = vi.fn(async (arg: UpdateArg) => ({ id: 42, ...arg.data }))
  const verifyToken = vi.fn(() => VALID)
  const deps = {
    payload: { findByID, create, update },
    verifyToken,
    ...overrides,
  } as unknown as ProofUploadDeps
  return { deps, findByID, create, update, verifyToken }
}

const input = { token: 'good.token', file: pngFile() }

describe('processProofUpload', () => {
  it('stores the proof privately and moves status to awaiting-verification', async () => {
    const { deps, create, update } = makeDeps()
    const result = await processProofUpload(deps, input)

    expect(result.success).toBe(true)
    if (!result.success) throw new Error('expected success')
    expect(result.status).toBe('awaiting-verification')

    // Proof created in the private `proofs` collection, linked to the registration.
    const createArg = create.mock.calls[0][0]
    expect(createArg.collection).toBe('proofs')
    expect(createArg.data.registration).toBe(42)
    expect(createArg.file).toMatchObject({ mimetype: 'image/png' })
    expect(createArg.overrideAccess).toBe(true)

    // Registration updated field-scoped: only the three allowed fields.
    const updateArg = update.mock.calls[0][0]
    expect(updateArg.collection).toBe('event-registrations')
    expect(updateArg.id).toBe(42)
    expect(Object.keys(updateArg.data).sort()).toEqual(
      ['paymentStatus', 'rejectionReason', 'transferProof'].sort(),
    )
    expect(updateArg.data.transferProof).toBe(900)
    expect(updateArg.data.paymentStatus).toBe('awaiting-verification')
    expect(updateArg.data.rejectionReason).toBeNull()
  })

  it('rejects a forged/bare token and changes nothing', async () => {
    const { deps, create, update } = makeDeps({
      verifyToken: vi.fn(() => ({ valid: false as const, reason: 'bad-signature' as const })),
    } as Partial<ProofUploadDeps>)
    const result = await processProofUpload(deps, input)
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.code).toBe('invalid-token')
    expect(create).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('reports an expired token distinctly', async () => {
    const { deps } = makeDeps({
      verifyToken: vi.fn(() => ({ valid: false as const, reason: 'expired' as const })),
    } as Partial<ProofUploadDeps>)
    const result = await processProofUpload(deps, input)
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.code).toBe('expired')
  })

  it('rejects when the registration no longer exists', async () => {
    const { deps, create } = makeDeps({
      payload: { findByID: vi.fn(async () => null), create: vi.fn(), update: vi.fn() },
    } as unknown as Partial<ProofUploadDeps>)
    const result = await processProofUpload(deps, input)
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.code).toBe('not-found')
    expect(create).not.toHaveBeenCalled()
  })

  it('is read-only after approval: rejects when already paid', async () => {
    const { deps, create, update } = makeDeps({
      payload: {
        findByID: vi.fn(async () => ({ id: 42, paymentStatus: 'paid' })),
        create: vi.fn(),
        update: vi.fn(),
      },
    } as unknown as Partial<ProofUploadDeps>)
    const result = await processProofUpload(deps, input)
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.code).toBe('already-confirmed')
    expect(create).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a cancelled registration (cannot be resurrected via upload)', async () => {
    const create = vi.fn()
    const update = vi.fn()
    const deps = {
      payload: {
        findByID: vi.fn(async () => ({
          id: 42,
          paymentStatus: 'awaiting-payment',
          status: 'cancelled',
        })),
        create,
        update,
      },
      verifyToken: vi.fn(() => VALID),
    } as unknown as ProofUploadDeps
    const result = await processProofUpload(deps, input)
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.code).toBe('already-confirmed')
    expect(create).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects an unsupported file type before storing', async () => {
    const { deps, create } = makeDeps()
    const result = await processProofUpload(deps, {
      token: 'good.token',
      file: { filename: 'x.gif', mimeType: 'image/gif', size: 100, data: Buffer.from('x') },
    })
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.code).toBe('invalid-file')
    expect(create).not.toHaveBeenCalled()
  })

  it('rejects a file over the 10MB limit', async () => {
    const { deps, create } = makeDeps()
    const result = await processProofUpload(deps, {
      token: 'good.token',
      file: pngFile(MAX_PROOF_BYTES + 1),
    })
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.code).toBe('invalid-file')
    expect(create).not.toHaveBeenCalled()
  })

  it('allows overwrite while awaiting-verification (stays queued)', async () => {
    const create = vi.fn(async () => ({ id: 901 }))
    const deps = {
      payload: {
        findByID: vi.fn(async () => ({ id: 42, paymentStatus: 'awaiting-verification' })),
        create,
        update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 42, ...data })),
      },
      verifyToken: vi.fn(() => VALID),
    } as unknown as ProofUploadDeps
    const result = await processProofUpload(deps, input)
    expect(result.success).toBe(true)
    expect(create).toHaveBeenCalled()
  })

  it('allows re-upload after rejection and clears the rejection reason', async () => {
    const update = vi.fn(async (arg: UpdateArg) => ({ id: 42, ...arg.data }))
    const deps = {
      payload: {
        findByID: vi.fn(async () => ({ id: 42, paymentStatus: 'rejected' })),
        create: vi.fn(async () => ({ id: 902 })),
        update,
      },
      verifyToken: vi.fn(() => VALID),
    } as unknown as ProofUploadDeps
    const result = await processProofUpload(deps, input)
    expect(result.success).toBe(true)
    expect(update.mock.calls[0][0].data.rejectionReason).toBeNull()
    expect(update.mock.calls[0][0].data.paymentStatus).toBe('awaiting-verification')
  })
})
