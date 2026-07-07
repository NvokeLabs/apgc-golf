import { describe, it, expect } from 'vitest'
import { canManageUsers, canReadUsers, canUpdateRoleField } from '@/access/users'

const staff = { id: 7, role: 'registration-staff' }
const admin = { id: 1, role: 'admin' }
const nullRole = { id: 2, role: null }

// The pure helpers only read `req.user`; a partial arg is sufficient here.
const asArgs = (user: unknown) => ({ req: { user } }) as never

describe('canManageUsers (create/update/delete)', () => {
  it('denies registration-staff', () => {
    expect(canManageUsers(asArgs(staff))).toBe(false)
  })
  it('allows admin', () => {
    expect(canManageUsers(asArgs(admin))).toBe(true)
  })
  it('allows a null-role user (default-allow)', () => {
    expect(canManageUsers(asArgs(nullRole))).toBe(true)
  })
})

describe('canReadUsers', () => {
  it('constrains registration-staff to their own record', () => {
    expect(canReadUsers(asArgs(staff))).toEqual({ id: { equals: 7 } })
  })
  it('allows admin to read all', () => {
    expect(canReadUsers(asArgs(admin))).toBe(true)
  })
})

describe('canUpdateRoleField', () => {
  it('denies registration-staff (no self-promotion)', () => {
    expect(canUpdateRoleField(asArgs(staff))).toBe(false)
  })
  it('allows admin', () => {
    expect(canUpdateRoleField(asArgs(admin))).toBe(true)
  })
})
