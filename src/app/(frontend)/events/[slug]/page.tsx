import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import RichText from '@/components/RichText'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  Trophy,
  Users,
  Camera,
} from 'lucide-react'
import { generateEventJsonLd } from '@/utilities/structuredData'

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
    depth: 2,
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

const tierLabels: Record<string, string> = {
  major: 'Major',
  championship: 'Championship',
  qualifier: 'Qualifier',
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
      : 'https://images.unsplash.com/photo-1653515906212-ba8bd8ab6000?w=1200&q=80'

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

  const isRegistrationOpen = event.status === 'open' || event.status === 'upcoming'
  const isDisabled =
    event.status === 'sold-out' || event.status === 'closed' || event.status === 'completed'

  const jsonLd = generateEventJsonLd(event)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pt-24 pb-20 min-h-screen">
        <div className="container mx-auto px-6">
          {/* Navigation */}
          <Link
            href="/events"
            className="inline-flex items-center mb-8 text-[#636364] hover:text-[#0b3d2e] pl-0 -ml-4 group transition-colors"
          >
            <ChevronLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Event List
          </Link>

          {/* Hero Section */}
          <div className="relative h-[50vh] md:h-[60vh] rounded-3xl overflow-hidden mb-12 border border-[#0b3d2e]/10 shadow-2xl">
            <Image
              src={imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b3d2e] via-[#0b3d2e]/40 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold bg-white/20 text-white border border-white/30">
                      {tierLabels[event.tier] || event.tier}
                    </span>
                    {event.status === 'open' && (
                      <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold bg-[#0b3d2e] text-white border border-white/20">
                        Registration Open
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-serif italic text-white mb-4">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap gap-6 text-white/90">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-white/80" />
                      <span className="text-lg font-light">
                        {event.date
                          ? new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'TBA'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-white/80" />
                      <span className="text-lg font-light">{event.location || 'TBA'}</span>
                    </div>
                    {event.prizeFund && (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-white/80" />
                        <span className="text-lg font-light">{event.prizeFund} Purse</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Link
                    href={isDisabled ? '#' : `/register/event/${event.slug}`}
                    className={`inline-flex items-center bg-white hover:bg-white/90 text-[#0b3d2e] font-bold px-8 py-4 rounded-xl text-lg shadow-xl transition-all ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {event.status === 'sold-out'
                      ? 'Sold Out'
                      : event.status === 'closed'
                        ? 'Registration Closed'
                        : event.status === 'completed'
                          ? 'Event Completed'
                          : 'Register Now'}
                    {isRegistrationOpen && <ArrowRight className="ml-2 w-5 h-5" />}
                  </Link>
                  {event.price && (
                    <p className="text-white/60 text-xs text-center mt-3">
                      Starting from {formatPrice(event.price)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-12">
              {/* Description */}
              <section>
                <h2 className="text-2xl text-[#0b3d2e] font-light mb-6">
                  About the <span className="font-serif italic font-medium">Event</span>
                </h2>
                <GlassCard className="p-6">
                  {event.description ? (
                    <div className="prose prose-lg max-w-none prose-p:text-[#636364] prose-p:leading-relaxed">
                      <RichText data={event.description} />
                    </div>
                  ) : (
                    <p className="text-[#636364] text-lg leading-relaxed">
                      More details coming soon.
                    </p>
                  )}
                </GlassCard>
              </section>

              {/* Schedule */}
              {event.schedule && event.schedule.length > 0 && (
                <section>
                  <h2 className="text-2xl text-[#0b3d2e] font-light mb-6">
                    Event <span className="font-serif italic font-medium">Schedule</span>
                  </h2>
                  <div className="space-y-6">
                    {event.schedule.map((day, dayIndex) => (
                      <GlassCard key={dayIndex} className="p-6">
                        <h3 className="text-[#0b3d2e] font-bold uppercase tracking-widest text-sm mb-4 pb-2 border-b border-[#0b3d2e]/10">
                          {day.day}
                        </h3>
                        <div className="space-y-3">
                          {day.items?.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center gap-4 p-3 rounded-lg bg-white/40 border border-[#0b3d2e]/5"
                            >
                              <div className="flex items-center gap-2 text-sm text-[#636364]">
                                <Clock className="w-4 h-4" />
                                <span className="font-mono">{item.time}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-[#0b3d2e] font-medium">{item.activity}</p>
                                {item.location && (
                                  <p className="text-sm text-[#636364]">{item.location}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </section>
              )}

              {/* Pairings */}
              {event.pairings && event.pairings.length > 0 && (
                <section>
                  <h2 className="text-2xl text-[#0b3d2e] font-light mb-6">
                    Tee Times & <span className="font-serif italic font-medium">Pairings</span>
                  </h2>
                  <div className="space-y-4">
                    {event.pairings.map((pairing, index) => (
                      <GlassCard key={index} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-[#0b3d2e]">Group {pairing.group}</span>
                          <div className="flex items-center gap-4 text-sm text-[#636364]">
                            <span>Tee {pairing.tee}</span>
                            <span className="font-mono">{pairing.time}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {pairing.players?.map((player, playerIndex) => (
                            <div
                              key={playerIndex}
                              className="flex items-center gap-2 rounded-full bg-[#0b3d2e]/10 px-3 py-1"
                            >
                              <Users className="w-3 h-3 text-[#0b3d2e]" />
                              <span className="text-sm text-[#0b3d2e]">{player.name}</span>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </section>
              )}

              {/* Gallery */}
              {event.gallery && event.gallery.length > 0 && (
                <section>
                  <h2 className="text-2xl text-[#0b3d2e] font-light mb-6 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Event <span className="font-serif italic font-medium">Gallery</span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.gallery.map((item, index) => {
                      const imgUrl =
                        typeof item.image === 'object' && item.image?.url ? item.image.url : null
                      if (!imgUrl) return null
                      return (
                        <div
                          key={index}
                          className="relative aspect-video rounded-xl overflow-hidden border border-[#0b3d2e]/10 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Image
                            src={imgUrl}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Registration Card */}
              <GlassCard className="p-8 sticky top-32">
                <h3 className="text-lg text-[#0b3d2e] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-[#0b3d2e]/10">
                  Registration
                </h3>

                {event.price && (
                  <div className="mb-6">
                    <p className="text-[#636364] text-xs uppercase tracking-wider mb-1">
                      Entry Fee
                    </p>
                    <p className="text-3xl font-light text-[#0b3d2e]">{formatPrice(event.price)}</p>
                    {event.alumniPrice && (
                      <p className="mt-2 text-sm text-[#636364]">
                        Alumni Price: {formatPrice(event.alumniPrice)}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-2 border-b border-[#0b3d2e]/10">
                    <span className="text-[#636364] text-sm">Date</span>
                    <span className="text-[#0b3d2e] text-sm font-medium">
                      {event.date ? formatDate(event.date) : 'TBA'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#0b3d2e]/10">
                    <span className="text-[#636364] text-sm">Location</span>
                    <span className="text-[#0b3d2e] text-sm font-medium text-right max-w-[60%]">
                      {event.location || 'TBA'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#636364] text-sm">Status</span>
                    <span
                      className={`text-sm font-medium ${
                        event.status === 'open'
                          ? 'text-green-600'
                          : event.status === 'sold-out'
                            ? 'text-orange-600'
                            : 'text-[#636364]'
                      }`}
                    >
                      {event.status === 'open'
                        ? 'Open'
                        : event.status === 'upcoming'
                          ? 'Coming Soon'
                          : event.status === 'sold-out'
                            ? 'Sold Out'
                            : event.status === 'closed'
                              ? 'Closed'
                              : 'Completed'}
                    </span>
                  </div>
                </div>

                {isRegistrationOpen ? (
                  <Link
                    href={`/register/event/${event.slug}`}
                    className="block w-full bg-[#0b3d2e] hover:bg-[#091f18] text-white font-bold py-4 rounded-xl text-center transition-colors shadow-lg"
                  >
                    Register Now
                  </Link>
                ) : (
                  <button
                    disabled
                    className="block w-full bg-[#636364]/50 text-white font-bold py-4 rounded-xl text-center cursor-not-allowed"
                  >
                    {event.status === 'sold-out'
                      ? 'Sold Out'
                      : event.status === 'completed'
                        ? 'Event Ended'
                        : 'Registration Closed'}
                  </button>
                )}
              </GlassCard>

              {/* Sponsors */}
              {event.sponsors && event.sponsors.length > 0 && (
                <GlassCard className="p-6">
                  <h3 className="text-lg text-[#0b3d2e] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-[#0b3d2e]/10">
                    Event Sponsors
                  </h3>
                  <div className="space-y-4">
                    {event.sponsors.map((sponsor) => {
                      if (typeof sponsor === 'number') return null
                      return (
                        <div key={sponsor.id} className="flex items-center gap-4">
                          {typeof sponsor.logo === 'object' && sponsor.logo?.url ? (
                            <div className="relative w-16 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={sponsor.logo.url}
                                alt={sponsor.name}
                                fill
                                className="object-contain p-2"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-12 bg-[#0b3d2e]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-[#0b3d2e] text-xs font-bold">
                                {sponsor.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-[#0b3d2e] font-medium text-sm">{sponsor.name}</p>
                            <p className="text-[#636364] text-xs capitalize">{sponsor.tier}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
