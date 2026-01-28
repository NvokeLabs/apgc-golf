import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Trophy, ArrowRight } from 'lucide-react'
import { getSiteLabels } from '@/utilities/getSiteContent'

export const metadata: Metadata = {
  title: 'Events | APGC Golf',
  description:
    'View upcoming tournaments and events. Register for championships, qualifiers, and more.',
}

export const revalidate = 1800 // Revalidate every 30 minutes

const getEvents = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const events = await payload.find({
    collection: 'events',
    limit: 50,
    sort: 'date',
  })

  return events.docs
})

const TierBadge = ({ tier }: { tier: string }) => {
  return (
    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold border bg-white/90 text-[#0b3d2e] border-[#0b3d2e]/20 shadow-sm">
      {tier}
    </span>
  )
}

export default async function EventsPage() {
  const [events, labels] = await Promise.all([getEvents(), getSiteLabels()])

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-[#0b3d2e] text-xs font-bold tracking-widest uppercase mb-4 block">
            Tournament Schedule
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-[#0b3d2e] mb-6">
            Upcoming <span className="font-serif italic font-medium">Events</span>
          </h1>
          <p className="text-[#636364] mb-8">
            Join the world&apos;s most prestigious golf tournaments across iconic venues.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length > 0 ? (
            events.map((event) => (
              <GlassCard
                key={event.id}
                className="group p-0 overflow-hidden bg-white/40 border-[#0b3d2e]/10 flex flex-col cursor-pointer"
                hoverEffect
              >
                <Link href={`/events/${event.slug}`} className="flex flex-col h-full">
                  {/* Image Header */}
                  <div className="relative h-64 overflow-hidden">
                    {typeof event.image === 'object' && event.image?.url ? (
                      <Image
                        src={event.image.url}
                        alt={event.title}
                        fill
                        className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
                          event.status === 'closed' ? 'grayscale opacity-70' : ''
                        }`}
                      />
                    ) : (
                      <Image
                        src="https://images.unsplash.com/photo-1653515906212-ba8bd8ab6000?w=800&q=80"
                        alt={event.title}
                        fill
                        className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
                          event.status === 'closed' ? 'grayscale opacity-70' : ''
                        }`}
                      />
                    )}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-[#0b3d2e] via-transparent to-transparent ${
                        event.status === 'closed' ? 'opacity-95 from-gray-900' : 'opacity-90'
                      }`}
                    />

                    <div className="absolute top-4 right-4">
                      <TierBadge tier={event.tier || 'Championship'} />
                    </div>

                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      <div className="flex items-center gap-2 text-white/80 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {event.date
                            ? new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'TBA'}
                        </span>
                      </div>
                      <h3 className="text-white text-2xl font-serif italic">{event.title}</h3>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div
                    className={`p-6 flex-1 flex flex-col justify-between gap-6 backdrop-blur-sm ${
                      event.status === 'closed' ? 'bg-gray-100/40' : 'bg-white/40'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 text-[#636364]">
                        <MapPin
                          className={`w-5 h-5 mt-0.5 shrink-0 ${event.status === 'closed' ? 'text-gray-500' : 'text-[#0b3d2e]'}`}
                        />
                        <span className="font-light">{event.location || 'TBA'}</span>
                      </div>
                      {event.prizeFund && (
                        <div className="flex items-center gap-3 text-[#636364]">
                          <Trophy
                            className={`w-5 h-5 shrink-0 ${event.status === 'closed' ? 'text-gray-500' : 'text-[#0b3d2e]'}`}
                          />
                          <span className="font-light">
                            {labels?.fieldLabels?.prizeFund || 'Prize Fund'}:{' '}
                            <span
                              className={`font-medium ${event.status === 'closed' ? 'text-gray-600' : 'text-[#0b3d2e]'}`}
                            >
                              {event.prizeFund}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-[#0b3d2e]/5 flex items-center justify-between">
                      <span
                        className={`text-xs uppercase tracking-widest font-semibold ${
                          event.status === 'open'
                            ? 'text-[#0b3d2e]'
                            : event.status === 'closed'
                              ? 'text-red-800/70'
                              : 'text-[#636364]'
                        }`}
                      >
                        {event.status === 'open'
                          ? labels?.statusLabels?.registrationOpen || 'Registration Open'
                          : event.status === 'closed'
                            ? labels?.statusLabels?.closed || 'Closed'
                            : event.status === 'sold-out'
                              ? labels?.statusLabels?.soldOut || 'Sold Out'
                              : labels?.statusLabels?.upcoming || 'Upcoming'}
                      </span>

                      <span className="text-[#0b3d2e] hover:text-[#0b3d2e] hover:bg-[#0b3d2e]/10 font-medium text-sm flex items-center gap-2 group/btn">
                        {labels?.buttonLabels?.eventDetails || 'Event Details'}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </GlassCard>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-[#636364]">
                {labels?.miscLabels?.noEventsFound || 'No events found.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
