import { getPayload, type Payload } from 'payload'
import type { Field } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

/**
 * Sponsor free tickets — schema foundation.
 *
 * A sponsor ticket is a normal EventRegistration with paymentMethod 'sponsor'
 * and a `sponsor` relationship. No quota field exists anywhere by design.
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

describe('EventRegistrations sponsor fields', () => {
  it('paymentMethod gains a "sponsor" option alongside the existing ones', () => {
    const field = regField('paymentMethod')
    expect(field?.type).toBe('select')
    const values = (field as { options: { value: string }[] }).options.map((o) => o.value)
    expect(values).toEqual(
      expect.arrayContaining(['bank-transfer', 'credit-card', 'cash', 'sponsor']),
    )
  })

  it('has a sponsor relationship pointing at the sponsors collection', () => {
    const field = regField('sponsor')
    expect(field?.type).toBe('relationship')
    expect((field as { relationTo: string }).relationTo).toBe('sponsors')
  })

  it('shows the sponsor field only when paymentMethod is sponsor', () => {
    const condition = (regField('sponsor') as { admin?: { condition?: (d: unknown) => unknown } })
      .admin?.condition
    expect(condition?.({ paymentMethod: 'sponsor' })).toBeTruthy()
    expect(condition?.({ paymentMethod: 'bank-transfer' })).toBeFalsy()
  })

  it('persisted the sponsor column (DB push verified)', async () => {
    // Touches the new join column; without the push this throws at the DB layer.
    await expect(
      payload.find({
        collection: 'event-registrations',
        where: { sponsor: { exists: true } },
        limit: 1,
      }),
    ).resolves.toBeDefined()
    await expect(
      payload.find({
        collection: 'event-registrations',
        where: { paymentMethod: { equals: 'sponsor' } },
        limit: 1,
      }),
    ).resolves.toBeDefined()
  })
})
