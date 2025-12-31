import { Suspense } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import { SectionHeader, EventCard } from '@/components/golf'
import { EventCardSkeleton } from '@/components/golf/skeletons'

const getUpcomingEvents = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'events',
    where: { or: [{ status: { equals: 'open' } }, { status: { equals: 'upcoming' } }] },
    limit: 3,
    sort: 'date',
  })
  return result.docs
})

async function UpcomingEventsContent() {
  const events = await getUpcomingEvents()

  if (!events.length) return null

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

function UpcomingEventsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function UpcomingEventsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <SectionHeader
          label="Tournament Calendar"
          title="Upcoming"
          titleHighlight="Events"
          link={{ href: '/events', text: 'View All Events' }}
        />
        <Suspense fallback={<UpcomingEventsSkeleton />}>
          <UpcomingEventsContent />
        </Suspense>
      </div>
    </section>
  )
}
