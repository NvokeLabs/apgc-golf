import { getPayload, type Payload } from 'payload'
import type { Field } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

/**
 * Foundation schema tests for the manual bank-transfer feature.
 *
 * Story 0 — payment proofs live in a PRIVATE, access-controlled `proofs`
 *           collection (never the public `media` bucket).
 * Story 1 — EventRegistrations carries the manual-transfer lifecycle fields.
 *
 * These boot a real Payload against the LOCAL Supabase Postgres (see
 * docs/local-supabase-setup.md). Booting with the postgres adapter's dev
 * `push` also syncs the schema, so the `payload.find` queries below double as
 * proof that the new columns/joins actually exist on the DB (mitigates T4).
 */

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

/** Recursively flatten Payload fields through tabs / rows / collapsibles / groups. */
function flattenFields(fields: Field[]): Field[] {
  const out: Field[] = []
  for (const field of fields) {
    out.push(field)
    if (field.type === 'tabs') {
      for (const tab of field.tabs) out.push(...flattenFields(tab.fields))
    } else if ('fields' in field && Array.isArray(field.fields)) {
      out.push(...flattenFields(field.fields))
    }
  }
  return out
}

function regField(name: string): Field | undefined {
  const fields = payload.collections['event-registrations'].config.fields
  return flattenFields(fields).find((f) => 'name' in f && f.name === name)
}

describe('Story 0: private proofs collection', () => {
  it('registers a "proofs" collection', () => {
    expect(payload.collections['proofs']).toBeDefined()
  })

  it('denies anonymous read but allows an authenticated admin', async () => {
    const read = payload.collections['proofs'].config.access.read
    expect(typeof read).toBe('function')
    // anonymous → denied
    expect(await read!({ req: { user: undefined } } as never)).toBeFalsy()
    // authenticated → allowed
    expect(await read!({ req: { user: { id: 1 } } } as never)).toBeTruthy()
  })

  it('is NOT publicly readable like the media collection', () => {
    const proofsRead = payload.collections['proofs'].config.access.read
    const mediaRead = payload.collections['media'].config.access.read
    // media read is `anyone` (returns true with no user); proofs must not be
    expect(mediaRead!({ req: { user: undefined } } as never)).toBeTruthy()
    expect(proofsRead!({ req: { user: undefined } } as never)).toBeFalsy()
  })

  it('restricts uploads to jpeg/png/pdf', () => {
    const upload = payload.collections['proofs'].config.upload
    expect(upload).toBeTruthy()
    expect((upload as { mimeTypes?: string[] }).mimeTypes).toEqual(
      expect.arrayContaining(['image/jpeg', 'image/png', 'application/pdf']),
    )
  })
})

describe('Story 1: EventRegistrations manual-transfer fields', () => {
  it('paymentStatus gains awaiting-payment / awaiting-verification / rejected', () => {
    const field = regField('paymentStatus')
    expect(field?.type).toBe('select')
    const values = (field as { options: { value: string }[] }).options.map((o) => o.value)
    expect(values).toEqual(
      expect.arrayContaining([
        'unpaid',
        'pending',
        'paid',
        'expired',
        'failed',
        'awaiting-payment',
        'awaiting-verification',
        'rejected',
      ]),
    )
  })

  it('has a transferProof upload pointing at the private proofs collection', () => {
    const field = regField('transferProof')
    expect(field?.type).toBe('upload')
    expect((field as { relationTo: string }).relationTo).toBe('proofs')
  })

  it('has rejectionReason, verifiedBy, verifiedAt, ticketEmailSent and amountDue fields', () => {
    expect(regField('rejectionReason')?.type).toBe('textarea')
    expect(regField('verifiedBy')?.type).toBe('relationship')
    expect((regField('verifiedBy') as { relationTo: string }).relationTo).toBe('users')
    expect(regField('verifiedAt')?.type).toBe('date')
    expect(regField('ticketEmailSent')?.type).toBe('checkbox')
    expect((regField('ticketEmailSent') as { defaultValue: boolean }).defaultValue).toBe(false)
    expect(regField('amountDue')?.type).toBe('number')
  })

  it('locks the trust-critical fields against anonymous writes (field-level access)', () => {
    // The collection is `create: anyone` (public form submissions), so the
    // verification fields and paymentStatus must each deny writes from an
    // unauthenticated REST caller — otherwise a registrant could self-verify.
    type AccessFn = (args: unknown) => unknown
    for (const name of ['paymentStatus', 'verifiedBy', 'verifiedAt', 'ticketEmailSent']) {
      const field = regField(name) as { access?: { create?: AccessFn; update?: AccessFn } }
      expect(field.access?.create, `${name}.access.create`).toBeTypeOf('function')
      expect(field.access?.update, `${name}.access.update`).toBeTypeOf('function')
      expect(field.access!.create!({ req: { user: undefined } } as never)).toBeFalsy()
      expect(field.access!.update!({ req: { user: undefined } } as never)).toBeFalsy()
      expect(field.access!.create!({ req: { user: { id: 1 } } } as never)).toBeTruthy()
      expect(field.access!.update!({ req: { user: { id: 1 } } } as never)).toBeTruthy()
    }
  })

  it('persisted the new columns (DB push verified — T4)', async () => {
    // Each filter touches a new column/join; if the schema was not pushed these
    // queries throw at the DB layer instead of resolving.
    await expect(
      payload.find({
        collection: 'event-registrations',
        where: { paymentStatus: { equals: 'awaiting-verification' } },
        limit: 1,
      }),
    ).resolves.toBeDefined()
    await expect(
      payload.find({
        collection: 'event-registrations',
        where: { ticketEmailSent: { equals: true } },
        limit: 1,
      }),
    ).resolves.toBeDefined()
    await expect(
      payload.find({
        collection: 'event-registrations',
        where: { rejectionReason: { exists: true } },
        limit: 1,
      }),
    ).resolves.toBeDefined()
    await expect(
      payload.find({
        collection: 'event-registrations',
        where: { transferProof: { exists: true } },
        limit: 1,
      }),
    ).resolves.toBeDefined()
  })
})
