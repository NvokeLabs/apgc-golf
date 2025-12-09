import type { Metadata } from 'next'

import { GlassCard, SponsorCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { cache } from 'react'
import { Award, Check, Star, Trophy } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sponsors | APGC Golf',
  description: 'Meet our sponsors and partners. Learn about sponsorship opportunities with APGC Golf.',
}

export const revalidate = 3600 // Revalidate every hour

const getSponsors = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const sponsors = await payload.find({
    collection: 'sponsors',
    limit: 100,
    sort: 'order',
    where: {
      isActive: {
        equals: true,
      },
    },
  })

  return sponsors.docs
})

const sponsorshipTiers = [
  {
    name: 'Title Sponsor',
    tier: 'title' as const,
    icon: Trophy,
    price: 'Rp 500,000,000+',
    color: 'from-amber-500 to-amber-600',
    benefits: [
      'Title naming rights for Annual Championship',
      'Exclusive branding on all event materials',
      'VIP hospitality suite at all major events',
      'Speaking opportunity at awards ceremony',
      'Custom activation zone at tournaments',
      'Premium logo placement on website',
      'Full-page feature in annual magazine',
      'Dedicated PR and social media coverage',
    ],
  },
  {
    name: 'Platinum Partner',
    tier: 'platinum' as const,
    icon: Star,
    price: 'Rp 250,000,000+',
    color: 'from-slate-400 to-slate-500',
    benefits: [
      'Premium logo placement on event materials',
      'VIP access to all events',
      'Social media feature campaigns',
      'Banner placement at all tournaments',
      'Half-page ad in annual magazine',
      'Hospitality tent at major events',
    ],
  },
  {
    name: 'Gold Partner',
    tier: 'gold' as const,
    icon: Award,
    price: 'Rp 100,000,000+',
    color: 'from-amber-600 to-amber-700',
    benefits: [
      'Logo on website sponsor page',
      'Social media mentions',
      'Event signage placement',
      'Complimentary event tickets',
      'Quarter-page ad in magazine',
    ],
  },
]

export default async function SponsorsPage() {
  const sponsors = await getSponsors()

  const titleSponsors = sponsors.filter((s) => s.tier === 'title')
  const platinumSponsors = sponsors.filter((s) => s.tier === 'platinum')
  const goldSponsors = sponsors.filter((s) => s.tier === 'gold')

  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-white md:text-5xl">Our Sponsors</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
          We are proud to partner with these organizations who share our passion for golf
          and community excellence.
        </p>
      </div>

      {/* Title Sponsors */}
      {titleSponsors.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-amber-400">Title Sponsors</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {titleSponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} className="border-amber-400/30" />
            ))}
          </div>
        </section>
      )}

      {/* Platinum Sponsors */}
      {platinumSponsors.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-300">Platinum Partners</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platinumSponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        </section>
      )}

      {/* Gold Sponsors */}
      {goldSponsors.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-amber-600">Gold Partners</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {goldSponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} showTier={false} />
            ))}
          </div>
        </section>
      )}

      {/* Sponsorship Opportunities */}
      <section className="mt-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Become a Sponsor</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Partner with APGC Golf and connect with our community of passionate golfers
            and industry leaders.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {sponsorshipTiers.map((tier) => (
            <GlassCard
              key={tier.tier}
              className="relative overflow-hidden p-6"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tier.color}`}
              />

              <div className="mb-6 text-center">
                <tier.icon className="mx-auto h-12 w-12 text-white/80" />
                <h3 className="mt-4 text-xl font-bold text-white">{tier.name}</h3>
                <p className="mt-2 text-2xl font-bold text-emerald-400">{tier.price}</p>
              </div>

              <ul className="space-y-3">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-white/70">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/register/sponsor"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Apply for Sponsorship
          </Link>
          <p className="mt-4 text-sm text-white/50">
            Have questions? Contact us at sponsors@apgc.com
          </p>
        </div>
      </section>
    </div>
  )
}
