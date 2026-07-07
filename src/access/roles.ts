/**
 * Single source of truth for the restricted-role gate. The only restricted
 * identity is a user whose role is exactly `registration-staff`; everyone else
 * (admins, null role, undefined user) is treated as fully privileged
 * (default-allow / explicit-deny).
 */
export const isRegistrationStaff = (user?: { role?: string | null } | null): boolean =>
  user?.role === 'registration-staff'
