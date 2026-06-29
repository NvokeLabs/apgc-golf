import type { FieldAccess } from 'payload'

/**
 * Field-level equivalent of `authenticated`: allows the operation only for a
 * logged-in user. Payload's field `access` expects the `FieldAccess` signature
 * (which differs from the collection-level `Access`), so this is typed
 * separately rather than reusing the collection helper.
 */
export const authenticatedFieldAccess: FieldAccess = ({ req: { user } }) => Boolean(user)
