import type { Metadata } from 'next'

import { EventCard, NewsCard, PlayerCard, GlassCard } from '@/components/golf'
import { SponsorMarquee } from '@/components/golf/SponsorMarquee'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { cache } from 'react'
import { ArrowRight, CalendarDays, Trophy, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'APGC Golf | Alumni Petra Golf Club',
  description: 'Welcome to APGC Golf - the premier golf community for Petra University alumni. Join tournaments, connect with fellow golfers, and elevate your game.',
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
  const { players, events, featuredEvent, news, sponsors } = await getFeaturedData()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-golf.jpg"
            alt="Golf course"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>

        <div className="container relative z-10 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Welcome to{' '}
              <span className="text-emerald-400">APGC Golf</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 md:text-xl">
              The premier golf community for Petra University alumni. Join tournaments,
              connect with fellow golfers, and elevate your game.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                View Events
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/players"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Meet Our Players
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/10 bg-black/50 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <StatCard icon={Users} value="200+" label="Active Members" />
            <StatCard icon={Trophy} value="50+" label="Tournaments Held" />
            <StatCard icon={CalendarDays} value="15" label="Years of Excellence" />
            <StatCard icon={Users} value="10+" label="Partner Sponsors" />
          </div>
        </div>
      </section>

      {/* Featured Event */}
      {featuredEvent && (
        <section className="py-20">
          <div className="container">
            <SectionHeader
              title="Featured Event"
              subtitle="Don't miss our upcoming tournament"
              href="/events"
            />
            <EventCard event={featuredEvent} featured />
          </div>
        </section>
      )}

      {/* Featured Players */}
      {players.length > 0 && (
        <section className="py-20">
          <div className="container">
            <SectionHeader
              title="Featured Players"
              subtitle="Meet our top-ranked golfers"
              href="/players"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="py-20 bg-white/5">
          <div className="container">
            <SectionHeader
              title="Upcoming Events"
              subtitle="Register for our tournaments"
              href="/events"
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      {news.length > 0 && (
        <section className="py-20">
          <div className="container">
            <SectionHeader
              title="Latest News"
              subtitle="Stay updated with APGC"
              href="/news"
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {news.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sponsors Marquee */}
      {sponsors.length > 0 && (
        <section className="py-20 border-t border-white/10">
          <div className="container mb-8">
            <h2 className="text-center text-2xl font-bold text-white">Our Sponsors</h2>
            <p className="mt-2 text-center text-white/60">
              Proudly supported by industry leaders
            </p>
          </div>
          <SponsorMarquee sponsors={sponsors} />
          <div className="container mt-8 text-center">
            <Link
              href="/sponsors"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
            >
              Become a Sponsor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-emerald-900/30">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Join the Community?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Whether you're a seasoned golfer or just starting out, APGC welcomes all
            Petra University alumni who share a passion for the game.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Browse Events
            </Link>
            <Link
              href="/register/sponsor"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType
  value: string
  label: string
}) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-8 w-8 text-emerald-400" />
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="text-white/60">{label}</p>
    </div>
  )
}

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string
  subtitle: string
  href: string
}) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white md:text-3xl">{title}</h2>
        <p className="mt-1 text-white/60">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="hidden items-center gap-2 text-emerald-400 hover:text-emerald-300 sm:inline-flex"
      >
        View All
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
