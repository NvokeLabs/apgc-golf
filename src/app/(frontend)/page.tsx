import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import { TextLink } from '@/components/golf/TextLink'
import { Button } from '@/components/ui/button'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { cache } from 'react'
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Trophy,
  Users,
  Star,
  ArrowUpRight,
  Sparkles,
  HeartHandshake,
  Megaphone,
} from 'lucide-react'
import { getHomePageContent, getSiteLabels } from '@/utilities/getSiteContent'

export const metadata: Metadata = {
  title: 'APGC Golf | Alumni Polinema Golf Club',
  description:
    'Welcome to APGC Golf - the premier golf community for Polinema alumni. Join tournaments, connect with fellow golfers, and elevate your game.',
}

export const revalidate = 3600 // Revalidate every hour

const getFeaturedData = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const [players, events, news, sponsors] = await Promise.all([
    payload.find({
      collection: 'players',
      where: { isFeatured: { equals: true }, status: { equals: 'active' } },
      limit: 4,
      sort: 'rank',
    }),
    payload.find({
      collection: 'events',
      where: { or: [{ status: { equals: 'open' } }, { status: { equals: 'upcoming' } }] },
      limit: 3,
      sort: 'date',
    }),
    payload.find({
      collection: 'news',
      where: { _status: { equals: 'published' } },
      limit: 3,
      sort: '-publishedDate',
    }),
    payload.find({
      collection: 'sponsors',
      where: { isActive: { equals: true } },
      limit: 20,
      sort: 'order',
    }),
  ])

  const featuredEvent = await payload.find({
    collection: 'events',
    where: { isFeatured: { equals: true } },
    limit: 1,
  })

  return {
    players: players.docs,
    events: events.docs,
    featuredEvent: featuredEvent.docs[0] || events.docs[0],
    news: news.docs,
    sponsors: sponsors.docs,
  }
})

export default async function HomePage() {
  const [{ players, events, featuredEvent, news, sponsors }, homeContent, labels] =
    await Promise.all([getFeaturedData(), getHomePageContent(), getSiteLabels()])

  // Map a why-sponsor benefit icon value to its lucide component
  const benefitIconMap = {
    exposure: Sparkles,
    network: Users,
    impact: HeartHandshake,
    visibility: Megaphone,
  } as const

  return (
    <div className="-mt-[50px]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0b3d2e]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={
              (typeof homeContent?.hero?.backgroundImage === 'object' &&
                homeContent.hero.backgroundImage?.url) ||
              'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1920&q=80'
            }
            alt="Golf Course"
            fill
            className="object-cover opacity-100"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-30" />
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-10">
            {/* Left Content */}
            <div className="max-w-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-white" />
                <span className="text-white font-serif italic tracking-wider text-sm">
                  {homeContent?.hero?.tagline || 'The 2025 Season Finale'}
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl text-white leading-[1.1] mb-8 font-light">
                {homeContent?.hero?.titleLine1 || 'Legacy'} <br />
                <span className="font-serif italic font-medium text-white/90">
                  {homeContent?.hero?.titleLine2 || 'In The Making'}
                </span>
              </h1>

              <p className="text-white/80 text-lg font-light leading-relaxed mb-10 max-w-md">
                {homeContent?.hero?.description ||
                  'Witness history at the legendary Cypress Point. Where masters of the craft compete for the ultimate glory.'}
              </p>
            </div>

            {/* Right Content - Tournament Card */}
            {featuredEvent && (
              <div className="relative hidden lg:block">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative bg-white backdrop-blur-xl border-2 border-[#0b3d2e]/10 overflow-hidden max-w-3xl mx-auto shadow-2xl rounded-lg flex">
                  {/* Tournament Banner */}
                  <div className="relative w-2/5 overflow-hidden flex-shrink-0">
                    {typeof featuredEvent.image === 'object' && featuredEvent.image?.url ? (
                      <Image
                        src={featuredEvent.image.url}
                        alt={featuredEvent.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src="https://images.unsplash.com/photo-1698692412889-a0f176b60b87?w=600&q=80"
                        alt="Tournament Banner"
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

                    <div className="absolute top-4 left-4 bg-[#D66232] text-white px-4 py-2 rounded-sm flex items-center gap-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs uppercase tracking-wider">
                        {homeContent?.featuredEventSection?.label || 'Featured Event'}
                      </span>
                    </div>

                    {featuredEvent.prizeFund && (
                      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-sm">
                        <p className="text-[#0b3d2e]/60 text-[10px] uppercase tracking-wider mb-1">
                          {labels?.fieldLabels?.prizeFund || 'Prize Fund'}
                        </p>
                        <p className="text-2xl font-serif text-[#0b3d2e]">
                          {featuredEvent.prizeFund}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-[#0b3d2e] mb-6">
                        {featuredEvent.title}
                      </h2>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#0b3d2e]/5 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-[#0b3d2e]" />
                          </div>
                          <div>
                            <p className="text-[#0b3d2e]/60 text-xs uppercase tracking-wider mb-1">
                              {labels?.fieldLabels?.location || 'Location'}
                            </p>
                            <p className="text-[#0b3d2e]">{featuredEvent.location || 'TBA'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#0b3d2e]/5 rounded-full flex items-center justify-center flex-shrink-0">
                            <CalendarDays className="w-4 h-4 text-[#0b3d2e]" />
                          </div>
                          <div>
                            <p className="text-[#0b3d2e]/60 text-xs uppercase tracking-wider mb-1">
                              {labels?.fieldLabels?.tournamentDates || 'Tournament Dates'}
                            </p>
                            <p className="text-[#0b3d2e]">
                              {featuredEvent.date
                                ? new Date(featuredEvent.date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'TBA'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#0b3d2e]/5 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-[#0b3d2e]" />
                          </div>
                          <div>
                            <p className="text-[#0b3d2e]/60 text-xs uppercase tracking-wider mb-1">
                              {labels?.fieldLabels?.registeredPlayers || 'Registered Players'}
                            </p>
                            <p className="text-[#0b3d2e]">
                              {labels?.statusLabels?.registrationOpen || 'Registration Open'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Button asChild variant="brand" size="cta" className="w-full gap-2">
                        <Link href={`/register/event/${featuredEvent.slug}`}>
                          <span>{labels?.buttonLabels?.registerNow || 'Register Now'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                      <p className="text-center text-[#0b3d2e]/50 text-xs mt-4">
                        {labels?.miscLabels?.limitedSpots || 'Limited spots available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats / Impact Band */}
      {homeContent?.statsSection?.items?.length ? (
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#0b3d2e] animate-pulse" />
                <span className="text-[#0b3d2e] text-xs font-bold tracking-[0.2em] uppercase">
                  {homeContent?.statsSection?.label || 'Dampak APGC'}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0b3d2e] mb-4">
                {homeContent?.statsSection?.title || 'Dampak APGC'}
              </h2>
              {homeContent?.statsSection?.description && (
                <p className="text-[#636364] text-lg">{homeContent.statsSection.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {homeContent.statsSection.items.map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-4xl md:text-5xl font-bold text-[#0b3d2e] mb-2">{item.value}</p>
                  <p className="text-[#636364] text-xs uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Event Schedule Section */}
      <section id="event" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0b3d2e]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#0b3d2e] animate-pulse" />
                <span className="text-[#0b3d2e] text-xs font-bold tracking-[0.2em] uppercase">
                  {homeContent?.upcomingEventsSection?.label || 'Upcoming Events'}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0b3d2e] mb-4">
                {homeContent?.upcomingEventsSection?.title || 'Tournament Schedule'}
              </h2>
              <p className="text-[#636364] text-lg">
                {homeContent?.upcomingEventsSection?.description ||
                  'Experience championship golf at the finest venues.'}
              </p>
            </div>

            <TextLink href="/events">
              {labels?.buttonLabels?.viewAllEvents || 'View All Events'}
            </TextLink>
          </div>

          {/* Featured Events Cards */}
          {events.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {events.slice(0, 2).map((event, idx) => (
                <GlassCard
                  key={event.id}
                  className="p-0 relative group overflow-hidden"
                  hoverEffect
                >
                  <div className="relative h-64 overflow-hidden">
                    {typeof event.image === 'object' && event.image?.url ? (
                      <Image
                        src={event.image.url}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    ) : (
                      <Image
                        src={`https://images.unsplash.com/photo-${idx === 0 ? '1744140370301-2613786e3230' : '1685296982506-91e3e7942a26'}?w=800&q=80`}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b3d2e]/90 via-[#0b3d2e]/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      {idx === 0 ? (
                        <div className="bg-white text-[#0b3d2e] px-4 py-2 rounded-sm flex items-center gap-2 shadow-lg">
                          <Star className="w-4 h-4 fill-current text-[#D66232]" />
                          <span className="text-xs uppercase tracking-wider">Next Event</span>
                        </div>
                      ) : (
                        <span className="bg-white/90 text-[#0b3d2e] text-xs px-3 py-1.5 rounded uppercase tracking-wide shadow-lg">
                          {event.date
                            ? new Date(event.date).toLocaleDateString('en-US', { month: 'long' })
                            : 'Upcoming'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-[#0b3d2e]/5 to-white">
                    <h3 className="text-xl font-semibold text-[#0b3d2e] mb-4">{event.title}</h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-[#636364]">
                        <CalendarDays className="w-4 h-4 text-[#0b3d2e]" />
                        <span className="text-sm">
                          {event.date
                            ? new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'TBA'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[#636364]">
                        <MapPin className="w-4 h-4 text-[#0b3d2e]" />
                        <span className="text-sm">{event.location || 'TBA'}</span>
                      </div>
                      {event.prizeFund && (
                        <div className="flex items-center gap-3 text-[#636364]">
                          <Trophy className="w-4 h-4 text-[#0b3d2e]" />
                          <span className="text-sm">Prize Pool: {event.prizeFund}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#0b3d2e]/10 pt-4 flex justify-between items-center">
                      <div>
                        <p className="text-[#636364] text-xs uppercase tracking-wider mb-1">
                          Registration
                        </p>
                        <p className="text-[#0b3d2e]">
                          {event.status === 'open' ? 'Open Now' : 'Coming Soon'}
                        </p>
                      </div>
                      <Button asChild variant="brandSecondary" size="ctaSm">
                        <Link href={`/events/${event.slug}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Sponsor Section */}
      {homeContent?.whySponsorSection?.benefits?.length ? (
        <section id="why-sponsor" className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#0b3d2e]/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#0b3d2e] animate-pulse" />
                <span className="text-[#0b3d2e] text-xs font-bold tracking-[0.2em] uppercase">
                  {homeContent?.whySponsorSection?.label || 'Mengapa Menjadi Sponsor'}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0b3d2e] mb-4">
                {homeContent?.whySponsorSection?.title || 'Mengapa Menjadi Sponsor'}
              </h2>
              {homeContent?.whySponsorSection?.description && (
                <p className="text-[#636364] text-lg">
                  {homeContent.whySponsorSection.description}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {homeContent.whySponsorSection.benefits.map((benefit, idx) => {
                const Icon = benefitIconMap[benefit.icon ?? 'exposure'] || Sparkles
                return (
                  <GlassCard key={idx} className="p-6 bg-white/40" hoverEffect>
                    <div className="w-10 h-10 bg-[#0b3d2e]/5 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#0b3d2e]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0b3d2e] mb-2">{benefit.title}</h3>
                    <p className="text-[#636364] text-sm">{benefit.description}</p>
                  </GlassCard>
                )
              })}
            </div>

            <div className="flex justify-center">
              <Button asChild variant="brand" size="ctaLg" className="gap-2">
                <Link href={homeContent?.whySponsorSection?.ctaLink || '/sponsors'}>
                  <span>
                    {homeContent?.whySponsorSection?.ctaLabel || 'Unduh Proposal Sponsorship'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Sponsors Section */}
      {sponsors.length > 0 && (
        <section id="sponsors" className="py-12 relative overflow-hidden">
          <div className="container mx-auto px-6 mb-8">
            <span className="text-[#0b3d2e] text-xs font-bold tracking-[0.2em] uppercase block text-center opacity-80">
              {homeContent?.partnersSection?.label || 'Official Partners'}
            </span>
          </div>

          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="relative flex overflow-x-hidden group">
            <div className="flex items-center gap-16 whitespace-nowrap py-4 animate-marquee-sponsors group-hover:[animation-play-state:paused]">
              {sponsors.map((sponsor, index) => (
                <div
                  key={`s1-${index}`}
                  className="flex items-center justify-center min-w-[200px] h-16"
                >
                  {typeof sponsor.logo === 'object' && sponsor.logo?.url ? (
                    <Image
                      src={sponsor.logo.url}
                      alt={sponsor.name}
                      width={160}
                      height={64}
                      className="object-contain max-h-16 w-auto opacity-100 transition-opacity duration-300 cursor-pointer"
                    />
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-[#0b3d2e] transition-colors duration-300 cursor-pointer font-serif tracking-tight">
                      {sponsor.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-16 whitespace-nowrap py-4 animate-marquee-sponsors group-hover:[animation-play-state:paused]">
              {sponsors.map((sponsor, index) => (
                <div
                  key={`s2-${index}`}
                  className="flex items-center justify-center min-w-[200px] h-16"
                >
                  {typeof sponsor.logo === 'object' && sponsor.logo?.url ? (
                    <Image
                      src={sponsor.logo.url}
                      alt={sponsor.name}
                      width={160}
                      height={64}
                      className="object-contain max-h-16 w-auto opacity-100 transition-opacity duration-300 cursor-pointer"
                    />
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-[#0b3d2e] transition-colors duration-300 cursor-pointer font-serif tracking-tight">
                      {sponsor.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Players Section */}
      {players.length > 0 && (
        <section id="players" className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0b3d2e] mb-4">
                  {homeContent?.featuredPlayersSection?.title || 'Anggota APGC'}
                </h2>
                <p className="text-[#636364] text-lg">
                  {homeContent?.featuredPlayersSection?.description ||
                    'Mengenal lebih dekat anggota dan pemain komunitas APGC.'}
                </p>
              </div>
              <TextLink href="/players">
                {labels?.buttonLabels?.viewAllPlayers || 'View All Players'}
              </TextLink>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {players.map((player) => (
                <GlassCard key={player.id} className="group p-0 cursor-pointer" hoverEffect>
                  <Link href={`/players/${player.slug}`}>
                    <div className="relative h-64 overflow-hidden">
                      {typeof player.image === 'object' && player.image?.url ? (
                        <Image
                          src={player.image.url}
                          alt={player.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <Image
                          src="https://images.unsplash.com/photo-1633597470203-77c0986ecc4d?w=600&q=80"
                          alt={player.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b3d2e]/90 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-white text-xl font-semibold">{player.name}</h3>
                        <p className="text-white/80 text-sm">{player.role}</p>
                      </div>
                    </div>
                  </Link>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News Section */}
      {news.length > 0 && (
        <section id="news" className="py-24">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0b3d2e] mb-4">
                  {homeContent?.newsSection?.title || 'Latest News'}
                </h2>
                <p className="text-[#636364] text-lg">
                  {homeContent?.newsSection?.description ||
                    'Updates from the green and behind the scenes.'}
                </p>
              </div>
              <TextLink href="/news">
                {labels?.buttonLabels?.viewAllNews || 'View News Archive'}
              </TextLink>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {news.map((item) => (
                <GlassCard
                  key={item.id}
                  className="group cursor-pointer h-full flex flex-col bg-white/40"
                  hoverEffect
                >
                  <Link href={`/news/${item.slug}`} className="flex flex-col h-full">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      {typeof item.image === 'object' && item.image?.url ? (
                        <Image
                          src={item.image.url}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <Image
                          src="https://images.unsplash.com/photo-1573684955725-34046d1ea9f3?w=600&q=80"
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {item.category && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-[#0b3d2e]/80 backdrop-blur-md border border-white/10 text-white text-xs font-medium px-3 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-auto">
                        <p className="text-[#0b3d2e] text-xs font-medium mb-2">
                          {item.publishedDate
                            ? new Date(item.publishedDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : ''}
                        </p>
                        <h3 className="text-xl font-semibold text-[#0b3d2e] mb-4 group-hover:text-[#0b3d2e] transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center text-[#636364] text-sm group-hover:text-[#0b3d2e] transition-colors mt-4">
                        {labels?.buttonLabels?.readArticle || 'Read Article'}{' '}
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
