import { describe, it, expect } from 'vitest'
import { visibleMenuGroups, type MenuGroup } from '@/components/admin/Nav/visibleMenuGroups'

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
  it('keeps only Tickets / Manual Transfers / Check-In for staff and drops empty groups', () => {
    const result = visibleMenuGroups(groups, 'registration-staff')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('registrations')
    expect(result[0].items.map((i) => i.href)).toEqual([
      '/admin/collections/tickets',
      '/admin/manual-transfers',
      '/admin/check-in',
    ])
  })
})
