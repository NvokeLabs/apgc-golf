import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react'

import { EventRegistrationForm } from './EventRegistrationForm'

type Args = {
  params: Promise<{ eventSlug: string }>
}

const getEvent = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  return result.docs[0] || null
})

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { eventSlug } = await params
  const event = await getEvent(eventSlug)

  if (!event) {
    return {
      title: 'Event Not Found | APGC Golf',
    }
  }

  return {
    title: `Register for ${event.title} | APGC Golf`,
    description: `Register for ${event.title} at ${event.location}.`,
  }
}

export default async function EventRegistrationPage({ params }: Args) {
  const { eventSlug } = await params
  const event = await getEvent(eventSlug)

  if (!event) {
    notFound()
  }

  // Check if registration is open
  const canRegister = event.status === 'open' || event.status === 'upcoming'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="container py-16">
      <Link
        href={`/events/${event.slug}`}
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Event
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 md:p-8">
            <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
              Register for {event.title}
            </h1>
            <p className="mb-8 text-white/60">
              Fill out the form below to register for this event
            </p>

            {canRegister ? (
              <EventRegistrationForm eventId={event.id} eventSlug={event.slug} />
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-lg text-white/70">
                  Registration for this event is currently closed.
                </p>
                <Link
                  href="/events"
                  className="mt-4 inline-block text-emerald-400 hover:text-emerald-300"
                >
                  View other events
                </Link>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Event Summary */}
        <div>
          <GlassCard className="p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Event Summary</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-1 h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-white/50">Date</p>
                  <p className="text-white">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-white/50">Location</p>
                  <p className="text-white">{event.location}</p>
                </div>
              </div>

              {event.price && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-white/50">Entry Fee</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatPrice(event.price)}
                  </p>
                  {event.alumniPrice && (
                    <p className="mt-1 text-sm text-white/60">
                      Alumni: {formatPrice(event.alumniPrice)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
