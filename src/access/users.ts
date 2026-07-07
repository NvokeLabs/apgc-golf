import type { Access, FieldAccess } from 'payload'

import { isRegistrationStaff } from './roles'

/**
 * Users is the sole data-layer lockdown. Registration-staff may neither create,
 * update nor delete any user (which also blocks self-promotion); everyone else
 * keeps full access.
 */
export const canManageUsers: Access = ({ req: { user } }) => !isRegistrationStaff(user)

/**
 * Admins (and every non-staff identity) read all users; a registration-staff
 * user may read ONLY their own record — so the account menu still loads but they
 * cannot enumerate other users' PII.
 */
export const canReadUsers: Access = ({ req: { user } }) => {
  if (isRegistrationStaff(user)) {
    return { id: { equals: user!.id } }
  }
  return true
}

/**
 * Field-level guard for the `role` select: only a non-staff user may change a
 * role, so a staff account can never self-promote even via the Users update
 * endpoint.
 */
export const canUpdateRoleField: FieldAccess = ({ req: { user } }) => !isRegistrationStaff(user)
