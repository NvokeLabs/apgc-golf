import { describe, it, expect } from 'vitest'
import { isRegistrationStaff } from '@/access/roles'

describe('isRegistrationStaff', () => {
  it('is true only for role registration-staff', () => {
    expect(isRegistrationStaff({ role: 'registration-staff' })).toBe(true)
  })
  it('is false for the admin role', () => {
    expect(isRegistrationStaff({ role: 'admin' })).toBe(false)
  })
  it('is false for a null role', () => {
    expect(isRegistrationStaff({ role: null })).toBe(false)
  })
  it('is false for undefined user', () => {
    expect(isRegistrationStaff(undefined)).toBe(false)
  })
  it('is false for null user', () => {
    expect(isRegistrationStaff(null)).toBe(false)
  })
})
