import { describe, it, expect } from 'vitest'
import { Users } from '@/collections/Users'

const roleField = () =>
  (Users.fields as Array<Record<string, unknown>>).find((f) => f.name === 'role') as
    | Record<string, unknown>
    | undefined

describe('Users.role field', () => {
  it('is a select with saveToJWT and defaultValue admin', () => {
    const field = roleField()
    expect(field?.type).toBe('select')
    expect(field?.saveToJWT).toBe(true)
    expect(field?.defaultValue).toBe('admin')
  })
  it('offers exactly Administrator and Petugas Pendaftaran options', () => {
    expect(roleField()?.options).toEqual([
      { label: 'Administrator', value: 'admin' },
      { label: 'Petugas Pendaftaran', value: 'registration-staff' },
    ])
  })
  it('is NOT required (nullable column)', () => {
    expect(roleField()?.required).toBeFalsy()
  })
  it('denies the role field update to registration-staff', () => {
    const update = (roleField()?.access as { update: (a: unknown) => boolean }).update
    expect(update({ req: { user: { id: 7, role: 'registration-staff' } } })).toBe(false)
    expect(update({ req: { user: { id: 1, role: 'admin' } } })).toBe(true)
  })
})

describe('Users collection admin.hidden', () => {
  it('hides the collection for registration-staff only', () => {
    const hidden = (Users.admin as { hidden: (a: unknown) => boolean }).hidden
    expect(hidden({ user: { role: 'registration-staff' } })).toBe(true)
    expect(hidden({ user: { role: 'admin' } })).toBe(false)
  })
})
