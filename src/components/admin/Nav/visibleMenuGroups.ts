import type React from 'react'

export interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
}

export interface MenuGroup {
  label: string
  id: string
  items: MenuItem[]
  defaultOpen?: boolean
}

/**
 * Hrefs a registration-staff user is allowed to see in the Nav: Tickets,
 * Sponsor Tickets, Manual Transfers, Check-In. Every other role sees the full
 * menu.
 */
export const REGISTRATION_STAFF_ALLOWED_HREFS: readonly string[] = [
  '/admin/collections/tickets',
  '/admin/sponsor-tickets',
  '/admin/manual-transfers',
  '/admin/check-in',
]

/**
 * Pure Nav filter. For a `registration-staff` role, keep only whitelisted items
 * and drop groups that become empty. For every other role (admin, null,
 * undefined) return the groups unchanged (default-allow).
 */
export function visibleMenuGroups(groups: MenuGroup[], role?: string | null): MenuGroup[] {
  if (role !== 'registration-staff') return groups
  const allowed = new Set(REGISTRATION_STAFF_ALLOWED_HREFS)
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => allowed.has(item.href)) }))
    .filter((group) => group.items.length > 0)
}
