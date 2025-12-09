import type { Metadata } from 'next'

import { EventCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'

export const metadata: Metadata = {
  title: 'Events | APGC Golf',
  description: 'View upcoming tournaments and events. Register for championships, qualifiers, and more.',
}

export const revalidate = 1800 // Revalidate every 30 minutes

const getEvents = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const events = await payload.find({
    collection: 'events',
    limit: 50,
    sort: '-date',
  })

  return events.docs
})

export default async function EventsPage() {
  const events = await getEvents()

  const featuredEvent = events.find((e) => e.isFeatured)
  const upcomingEvents = events.filter(
    (e) => e.status === 'upcoming' || e.status === 'open',
  )
  const pastEvents = events.filter(
    (e) => e.status === 'completed' || e.status === 'closed',
  )

  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white md:text-5xl">Events & Tournaments</h1>
        <p className="mt-4 text-lg text-white/60">
          Join us for competitive golf tournaments throughout the year
        </p>
      </div>

      {/* Featured Event */}
      {featuredEvent && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Featured Event</h2>
          <EventCard event={featuredEvent} featured />
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Upcoming Events</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">Past Events</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <p className="text-center text-white/60">No events found.</p>
      )}
    </div>
  )
}
