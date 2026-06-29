import { describe, it, beforeAll, expect } from 'vitest'
import { getPayload, type Payload } from 'payload'
import type { Field } from 'payload'
import config from '@/payload.config'
import { getPaymentSettings } from '@/utilities/payments/getPaymentSettings'

/**
 * Story 4 — bank-account configuration.
 *
 * `getPaymentSettings` reads the Payment Settings group off the `site-labels`
 * global server-side and MUST degrade gracefully: an unconfigured (or partially
 * configured) global yields `configured: false` and never throws, so the
 * registration confirmation screen can fall back instead of breaking.
 */

// A minimal fake Payload whose findGlobal returns whatever we inject.
function fakePayload(global: unknown): Payload {
  return {
    findGlobal: async ({ slug }: { slug: string }) => {
      if (slug !== 'site-labels') throw new Error(`unexpected global ${slug}`)
      return global
    },
  } as unknown as Payload
}

describe('getPaymentSettings', () => {
  it('returns configured settings when all bank fields are present', async () => {
    const settings = await getPaymentSettings(
      fakePayload({
        paymentSettings: {
          bankName: 'BCA',
          accountNumber: '1234567890',
          accountHolder: 'APGC Golf',
          instructions: 'Transfer the exact amount.',
        },
      }),
    )
    expect(settings).toEqual({
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolder: 'APGC Golf',
      instructions: 'Transfer the exact amount.',
      configured: true,
    })
  })

  it('is NOT configured when a required bank field is blank', async () => {
    const settings = await getPaymentSettings(
      fakePayload({
        paymentSettings: { bankName: 'BCA', accountNumber: '', accountHolder: 'APGC Golf' },
      }),
    )
    expect(settings.configured).toBe(false)
  })

  it('degrades gracefully when the group is missing entirely', async () => {
    const settings = await getPaymentSettings(fakePayload({}))
    expect(settings.configured).toBe(false)
    expect(settings.bankName).toBe('')
    expect(settings.instructions).toBe('')
  })

  it('does not throw and is not configured when findGlobal returns null', async () => {
    const settings = await getPaymentSettings(fakePayload(null))
    expect(settings.configured).toBe(false)
  })

  it('trims whitespace and coerces nullish fields to empty strings', async () => {
    const settings = await getPaymentSettings(
      fakePayload({
        paymentSettings: {
          bankName: '  BCA  ',
          accountNumber: '  111  ',
          accountHolder: '  Holder  ',
          instructions: null,
        },
      }),
    )
    expect(settings.bankName).toBe('BCA')
    expect(settings.accountNumber).toBe('111')
    expect(settings.instructions).toBe('')
    expect(settings.configured).toBe(true)
  })
})

describe('site-labels Payment Settings group (schema)', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

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

  it('exposes a paymentSettings group with bank fields', () => {
    const fields = payload.globals.config.find((g) => g.slug === 'site-labels')!.fields
    const group = flattenFields(fields).find((f) => 'name' in f && f.name === 'paymentSettings') as
      | { fields: Field[] }
      | undefined
    expect(group).toBeDefined()
    const names = flattenFields(group!.fields)
      .filter((f): f is Field & { name: string } => 'name' in f)
      .map((f) => f.name)
    expect(names).toEqual(
      expect.arrayContaining(['bankName', 'accountNumber', 'accountHolder', 'instructions']),
    )
  })
})
