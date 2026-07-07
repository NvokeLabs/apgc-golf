import { describe, it, expect } from 'vitest'
import type { CollectionConfig } from 'payload'

import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Proofs } from '@/collections/Proofs'
import { Events } from '@/collections/Events'
import { News } from '@/collections/News'
import { Pages } from '@/collections/Pages'
import { Players } from '@/collections/Players'
import { Posts } from '@/collections/Posts'
import { Sponsors } from '@/collections/Sponsors'
import { SponsorRegistrations } from '@/collections/SponsorRegistrations'
import { SponsorshipTiers } from '@/collections/SponsorshipTiers'
import { Users } from '@/collections/Users'
import { Tickets } from '@/collections/Tickets'
import { EventRegistrations } from '@/collections/EventRegistrations'

const staff = { user: { role: 'registration-staff' } } as never
const admin = { user: { role: 'admin' } } as never

const hiddenFor = (c: CollectionConfig) =>
  (c.admin as { hidden?: (a: unknown) => boolean } | undefined)?.hidden

describe('collection admin.hidden for registration-staff', () => {
  const hiddenCollections: Array<[string, CollectionConfig]> = [
    ['categories', Categories],
    ['media', Media],
    ['proofs', Proofs],
    ['events', Events],
    ['news', News],
    ['pages', Pages],
    ['players', Players],
    ['posts', Posts],
    ['sponsors', Sponsors],
    ['sponsor-registrations', SponsorRegistrations],
    ['sponsorship-tiers', SponsorshipTiers],
    ['users', Users],
  ]

  it.each(hiddenCollections)('hides %s for staff, shows for admin', (_slug, collection) => {
    const hidden = hiddenFor(collection)
    expect(typeof hidden).toBe('function')
    expect(hidden!(staff)).toBe(true)
    expect(hidden!(admin)).toBe(false)
  })

  it('leaves tickets and event-registrations visible (no hidden gate)', () => {
    expect(hiddenFor(Tickets)).toBeUndefined()
    expect(hiddenFor(EventRegistrations)).toBeUndefined()
  })
})
