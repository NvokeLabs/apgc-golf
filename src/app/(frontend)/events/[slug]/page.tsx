import type { Metadata } from 'next'
import type { Event } from '@/payload-types'

import { GlassCard, SponsorCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { CalendarDays, Clock, MapPin, Trophy, Users } from 'lucide-react'

type Args = {
  params: Promise<{ slug: string }>
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
    depth: 2, // Load sponsors relationship
  })

  return result.docs[0] || null
})

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const events = await payload.find({
    collection: 'events',
    limit: 100,
    select: {
      slug: true,
    },
  })

  return events.docs.map((event) => ({
    slug: event.slug,
  }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    return {
      title: 'Event Not Found | APGC Golf',
    }
  }

  return {
    title: `${event.title} | APGC Golf`,
    description: `Join us for ${event.title} at ${event.location}. ${event.prizeFund ? `Prize fund: ${event.prizeFund}` : ''}`,
  }
}

export const revalidate = 3600

const tierColors = {
  major: 'bg-amber-500',
  championship: 'bg-emerald-600',
  qualifier: 'bg-blue-500',
}

const tierLabels = {
  major: 'Major',
  championship: 'Championship',
  qualifier: 'Qualifier',
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-500',
  open: 'bg-emerald-500',
  'sold-out': 'bg-orange-500',
  closed: 'bg-gray-500',
  completed: 'bg-purple-500',
}

const statusLabels: Record<string, string> = {
  upcoming: 'Upcoming',
  open: 'Registration Open',
  'sold-out': 'Sold Out',
  closed: 'Registration Closed',
  completed: 'Completed',
}

export default async function EventPage({ params }: Args) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  const imageUrl =
    typeof event.image === 'object' && event.image?.url
      ? event.image.url
      : '/placeholder-event.jpg'

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
    <div className="pb-16">
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="container relative flex h-full flex-col justify-end pb-12">
          <div className="flex flex-wrap gap-3">
            <span className={`rounded-full px-4 py-1 text-sm font-semibold text-white ${tierColors[event.tier]}`}>
              {tierLabels[event.tier]}
            </span>
            {event.status && (
              <span className={`rounded-full px-4 py-1 text-sm font-semibold text-white ${statusColors[event.status]}`}>
                {statusLabels[event.status]}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">{event.title}</h1>
        </div>
      </div>

      <div className="container mt-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Event Details */}
            <GlassCard className="p-6">
              <h2 className="mb-6 text-xl font-bold text-white">Event Details</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-1 h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-white/50">Date</p>
                    <p className="text-white">{formatDate(event.date)}</p>
                    {event.endDate && (
                      <p className="text-white/70">to {formatDate(event.endDate)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-white/50">Location</p>
                    <p className="text-white">{event.location}</p>
                  </div>
                </div>
                {event.prizeFund && (
                  <div className="flex items-start gap-3">
                    <Trophy className="mt-1 h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-sm text-white/50">Prize Fund</p>
                      <p className="font-semibold text-amber-400">{event.prizeFund}</p>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Schedule */}
            {event.schedule && event.schedule.length > 0 && (
              <GlassCard className="p-6">
                <h2 className="mb-6 text-xl font-bold text-white">Schedule</h2>
                <div className="space-y-6">
                  {event.schedule.map((day, dayIndex) => (
                    <div key={dayIndex}>
                      <h3 className="mb-4 font-semibold text-emerald-400">{day.day}</h3>
                      <div className="space-y-2">
                        {day.items?.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-3"
                          >
                            <div className="flex items-center gap-2 text-sm text-white/50">
                              <Clock className="h-4 w-4" />
                              <span className="font-mono">{item.time}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white">{item.activity}</p>
                              {item.location && (
                                <p className="text-sm text-white/50">{item.location}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Pairings */}
            {event.pairings && event.pairings.length > 0 && (
              <GlassCard className="p-6">
                <h2 className="mb-6 text-xl font-bold text-white">Tee Times & Pairings</h2>
                <div className="space-y-4">
                  {event.pairings.map((pairing, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-semibold text-white">Group {pairing.group}</span>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span>Tee {pairing.tee}</span>
                          <span>{pairing.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pairing.players?.map((player, playerIndex) => (
                          <div
                            key={playerIndex}
                            className="flex items-center gap-2 rounded-full bg-emerald-600/20 px-3 py-1"
                          >
                            <Users className="h-3 w-3 text-emerald-400" />
                            <span className="text-sm text-white">{player.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <GlassCard className="p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Registration</h3>
              {event.price && (
                <div className="mb-4">
                  <p className="text-sm text-white/50">Entry Fee</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatPrice(event.price)}</p>
                  {event.alumniPrice && (
                    <p className="mt-1 text-sm text-white/60">
                      Alumni: {formatPrice(event.alumniPrice)}
                    </p>
                  )}
                </div>
              )}
              {(event.status === 'open' || event.status === 'upcoming') && (
                <Link
                  href={`/register/event/${event.slug}`}
                  className="block w-full rounded-lg bg-emerald-600 py-3 text-center font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Register Now
                </Link>
              )}
              {event.status === 'closed' && (
                <p className="text-center text-white/50">Registration is closed</p>
              )}
              {event.status === 'completed' && (
                <p className="text-center text-white/50">This event has ended</p>
              )}
            </GlassCard>

            {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="mb-4 text-lg font-bold text-white">Event Sponsors</h3>
                <div className="space-y-4">
                  {event.sponsors.map((sponsor) => {
                    if (typeof sponsor === 'number') return null
                    return (
                      <SponsorCard
                        key={sponsor.id}
                        sponsor={sponsor}
                        showTier={false}
                        className="border-0 bg-transparent p-0"
                      />
                    )
                  })}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
