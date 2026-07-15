import { describe, it, expect } from 'vitest'
import {
  visibleMenuGroups,
  REGISTRATION_STAFF_ALLOWED_HREFS,
  type MenuGroup,
} from '@/components/admin/Nav/visibleMenuGroups'

const icon = (() => null) as unknown as MenuGroup['items'][number]['icon']

const groups: MenuGroup[] = [
  {
    label: 'Golf Content',
    id: 'golf-content',
    items: [{ name: 'Events', href: '/admin/collections/events', icon }],
  },
  {
    label: 'Registrations',
    id: 'registrations',
    items: [
      { name: 'Event Registrations', href: '/admin/collections/event-registrations', icon },
      { name: 'Tickets', href: '/admin/collections/tickets', icon },
      { name: 'Sponsor Tickets', href: '/admin/sponsor-tickets', icon },
      { name: 'Manual Transfers', href: '/admin/manual-transfers', icon },
      { name: 'Check-In Scanner', href: '/admin/check-in', icon },
    ],
  },
]

describe('visibleMenuGroups', () => {
  it('returns groups unchanged for admin', () => {
    expect(visibleMenuGroups(groups, 'admin')).toBe(groups)
  })
  it('returns groups unchanged for a null role', () => {
    expect(visibleMenuGroups(groups, null)).toBe(groups)
  })
  it('keeps only Tickets / Sponsor Tickets / Manual Transfers / Check-In for staff and drops empty groups', () => {
    const result = visibleMenuGroups(groups, 'registration-staff')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('registrations')
    expect(result[0].items.map((i) => i.href)).toEqual([
      '/admin/collections/tickets',
      '/admin/sponsor-tickets',
      '/admin/manual-transfers',
      '/admin/check-in',
    ])
  })

  it('lets registration staff reach the sponsor tickets view', () => {
    expect(REGISTRATION_STAFF_ALLOWED_HREFS).toContain('/admin/sponsor-tickets')

    const visible = visibleMenuGroups(groups, 'registration-staff')
    const hrefs = visible.flatMap((group) => group.items.map((item) => item.href))
    expect(hrefs).toContain('/admin/sponsor-tickets')
    // still hidden: the full registrations collection
    expect(hrefs).not.toContain('/admin/collections/event-registrations')
  })
})
