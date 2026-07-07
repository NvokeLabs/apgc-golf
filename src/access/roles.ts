/**
 * Single source of truth for the restricted-role gate. The only restricted
 * identity is a user whose role is exactly `registration-staff`; everyone else
 * (admins, null role, undefined user) is treated as fully privileged
 * (default-allow / explicit-deny).
 */
// Accepts `unknown` (rather than a narrow `{ role?: string | null }` shape) because
// callers pass Payload's `ClientUser` (admin.hidden) and server `User`/`PayloadRequest['user']`
// types, both of which are "weak" object types (`{ [key: string]: any } & BaseUser`) that
// TypeScript's weak-type detection refuses to structurally match against an all-optional
// `{ role?: string | null }` target (TS2345: "has no properties in common"). Casting once,
// here, avoids sprinkling `as` casts at every call site (12+ collections + Users + Nav).
export const isRegistrationStaff = (user?: unknown): boolean =>
  (user as { role?: string | null } | null | undefined)?.role === 'registration-staff'
