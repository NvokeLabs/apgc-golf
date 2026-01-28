import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { cache } from 'react'
import { Check, ArrowRight, Star, Trophy, Shield, Globe, Users, Handshake } from 'lucide-react'
import {
  getSponsorsPageContent,
  getSponsorshipTiers,
  getSiteLabels,
} from '@/utilities/getSiteContent'

export const metadata: Metadata = {
  title: 'Sponsors | APGC Golf',
  description:
    'Meet our sponsors and partners. Learn about sponsorship opportunities with APGC Golf.',
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

// Default sponsorship tiers (fallback if CMS data is empty)
const defaultSponsorshipTiers = [
  {
    name: 'Gold Partner',
    price: 'Rp 100,000,000',
    tierKey: 'gold' as const,
    benefits: [
      { benefit: 'Official Partner Status' },
      { benefit: 'Logo on Tournament Website' },
      { benefit: 'Hospitality Passes for 10 Guests' },
      { benefit: 'Invitation to Sponsor Lunch' },
      { benefit: 'On-site Activation Space' },
      { benefit: 'Program Guide Advertisement' },
    ],
    isHighlighted: false,
  },
  {
    name: 'Platinum Partner',
    price: 'Rp 250,000,000',
    tierKey: 'platinum' as const,
    benefits: [
      { benefit: 'Official Category Exclusivity' },
      { benefit: 'Major Logo Placement on Course' },
      { benefit: 'VIP Hospitality for 20 Guests' },
      { benefit: 'Pro-Am Spots for 2 Executives' },
      { benefit: 'Access to Awards Gala' },
      { benefit: 'Digital Media Campaign Inclusion' },
    ],
    isHighlighted: false,
  },
  {
    name: 'Title Sponsor',
    price: 'Rp 500,000,000',
    tierKey: 'title' as const,
    benefits: [
      { benefit: 'Exclusive Title Naming Rights' },
      { benefit: 'Premium Logo Placement on All Media' },
      { benefit: 'VIP Hospitality for 50 Guests' },
      { benefit: 'Pro-Am Spots for 4 Executives' },
      { benefit: 'Private Meet & Greet with Players' },
      { benefit: 'Course Branding (1st & 18th Tees)' },
    ],
    isHighlighted: true,
  },
]

// Helper to get icon based on tier
const getTierIcon = (tierKey: string) => {
  switch (tierKey) {
    case 'title':
      return <Trophy className="w-8 h-8 text-[#0b3d2e]" />
    case 'platinum':
      return <Star className="w-8 h-8 text-[#0b3d2e]/80" />
    case 'gold':
    default:
      return <Shield className="w-8 h-8 text-[#636364]" />
  }
}

export default async function SponsorsPage() {
  const [sponsors, cmsTiers, pageContent, labels] = await Promise.all([
    getSponsors(),
    getSponsorshipTiers(),
    getSponsorsPageContent(),
    getSiteLabels(),
  ])

  // Use CMS tiers if available, otherwise use defaults
  const sponsorshipTiers = cmsTiers.length > 0 ? cmsTiers : defaultSponsorshipTiers

  const titleSponsors = sponsors.filter((s) => s.tier === 'title')
  const platinumSponsors = sponsors.filter((s) => s.tier === 'platinum')
  const goldSponsors = sponsors.filter((s) => s.tier === 'gold')

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="text-[#0b3d2e] text-xs font-bold tracking-widest uppercase mb-4 block">
            {pageContent?.header?.label || 'Our Partners'}
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-[#0b3d2e] mb-6">
            {pageContent?.header?.title || 'The Driving'}{' '}
            <span className="font-serif italic font-medium">
              {pageContent?.header?.titleHighlight || 'Force'}
            </span>
          </h1>
          <p className="text-[#636364] text-lg">
            {pageContent?.header?.description ||
              'We are proud to partner with world-leading brands who share our passion for excellence, tradition, and the future of golf.'}
          </p>
        </div>

        {/* Pyramid Layout */}
        <div className="mb-24 flex flex-col items-center gap-4">
          {/* Row 1: Title (2 items) */}
          {titleSponsors.length > 0 && (
            <div className="flex justify-center gap-4 md:gap-8 w-full">
              {titleSponsors.map((sponsor) => (
                <GlassCard
                  key={sponsor.id}
                  className="w-40 h-32 md:w-64 md:h-48 flex items-center justify-center p-6 bg-white/60 border-[#0b3d2e]/20 hover:border-[#0b3d2e]/50 transition-colors"
                  hoverEffect
                >
                  {typeof sponsor.logo === 'object' && sponsor.logo?.url ? (
                    <Image
                      src={sponsor.logo.url}
                      alt={sponsor.name}
                      width={200}
                      height={100}
                      className="max-w-full max-h-full object-contain grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <span className="text-[#0b3d2e] font-serif italic text-xl md:text-2xl text-center">
                      {sponsor.name}
                    </span>
                  )}
                </GlassCard>
              ))}
            </div>
          )}

          {/* Row 2: Platinum (6 items) */}
          {platinumSponsors.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 max-w-6xl">
              {platinumSponsors.map((sponsor) => (
                <GlassCard
                  key={sponsor.id}
                  className="w-28 h-20 md:w-40 md:h-28 flex items-center justify-center p-4 bg-white/40 border-[#0b3d2e]/10 hover:border-[#0b3d2e]/30 transition-colors"
                  hoverEffect
                >
                  {typeof sponsor.logo === 'object' && sponsor.logo?.url ? (
                    <Image
                      src={sponsor.logo.url}
                      alt={sponsor.name}
                      width={128}
                      height={64}
                      className="max-w-full max-h-full object-contain grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <span className="text-[#0b3d2e] font-medium text-sm text-center">
                      {sponsor.name}
                    </span>
                  )}
                </GlassCard>
              ))}
            </div>
          )}

          {/* Row 3: Gold (5 items) */}
          {goldSponsors.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 max-w-5xl">
              {goldSponsors.map((sponsor) => (
                <GlassCard
                  key={sponsor.id}
                  className="w-24 h-16 md:w-32 md:h-24 flex items-center justify-center p-4 bg-white/30 border-[#0b3d2e]/5 hover:border-[#0b3d2e]/20 transition-colors"
                  hoverEffect
                >
                  {typeof sponsor.logo === 'object' && sponsor.logo?.url ? (
                    <Image
                      src={sponsor.logo.url}
                      alt={sponsor.name}
                      width={96}
                      height={48}
                      className="max-w-full max-h-full object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <span className="text-[#0b3d2e]/80 font-medium text-xs text-center">
                      {sponsor.name}
                    </span>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Become a Sponsor Section */}
        <div className="py-16 border-t border-[#0b3d2e]/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-[#0b3d2e] mb-4">
              {pageContent?.becomeASponsor?.title || 'Become a'}{' '}
              <span className="font-serif italic font-medium">
                {pageContent?.becomeASponsor?.titleHighlight || 'Sponsor'}
              </span>
            </h2>
            <p className="text-[#636364] max-w-2xl mx-auto">
              {pageContent?.becomeASponsor?.description ||
                'Join an elite group of global brands and connect with a passionate audience of affluent golf enthusiasts.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {sponsorshipTiers.map((tier, idx) => (
              <GlassCard
                key={idx}
                className={`relative p-8 flex flex-col bg-white border-2 ${tier.isHighlighted ? 'border-[#D66232] shadow-2xl shadow-[#D66232]/20 ring-2 ring-[#D66232]/30 ring-offset-2' : 'border-[#0b3d2e]/10 hover:shadow-lg transition-shadow'}`}
              >
                {tier.isHighlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D66232] text-white border-2 border-[#D66232] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {labels?.miscLabels?.mostPopular || 'Most Popular'}
                  </div>
                )}

                <div className="mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-[#D66232]/10 mb-4 text-[#D66232]">
                    {getTierIcon(tier.tierKey)}
                  </div>
                  <h3 className="text-2xl font-bold text-[#0b3d2e] mb-2">{tier.name}</h3>
                  <p className="text-3xl text-[#0b3d2e] font-light">{tier.price}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {tier.benefits?.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#636364] text-sm">
                      <Check className="w-5 h-5 shrink-0 text-[#D66232]" />
                      <span>{item.benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register/sponsor"
                  className="w-full py-4 text-lg group border-2 border-[#0b3d2e] bg-transparent text-[#0b3d2e] hover:bg-[#0b3d2e] hover:text-white transition-colors flex items-center justify-center gap-2 rounded-lg"
                >
                  {labels?.buttonLabels?.inquireNow || 'Inquire Now'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Why Partner With Us Section */}
        <div className="py-24 border-t border-[#0b3d2e]/10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-[#0b3d2e] mb-6">
              {pageContent?.whyPartner?.title || 'Why'}{' '}
              <span className="font-serif italic font-medium">
                {pageContent?.whyPartner?.titleHighlight || 'Partner With Us?'}
              </span>
            </h2>
            <p className="text-[#636364] max-w-3xl mx-auto text-lg">
              {pageContent?.whyPartner?.description ||
                'Align your brand with excellence. Our tournament offers a unique platform to engage with a sophisticated audience and drive tangible business results.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pageContent?.whyPartner?.benefits && pageContent.whyPartner.benefits.length > 0 ? (
              pageContent.whyPartner.benefits.map((benefit, idx) => {
                const IconComponent =
                  benefit.icon === 'globe'
                    ? Globe
                    : benefit.icon === 'users'
                      ? Users
                      : benefit.icon === 'handshake'
                        ? Handshake
                        : benefit.icon === 'trophy'
                          ? Trophy
                          : Star
                return (
                  <GlassCard
                    key={idx}
                    className="p-8 flex flex-col items-center text-center bg-white/40 border-[#0b3d2e]/10"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#0b3d2e]/5 flex items-center justify-center mb-6 text-[#0b3d2e]">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0b3d2e] mb-4">{benefit.title}</h3>
                    <p className="text-[#636364] leading-relaxed">{benefit.description}</p>
                  </GlassCard>
                )
              })
            ) : (
              <>
                <GlassCard className="p-8 flex flex-col items-center text-center bg-white/40 border-[#0b3d2e]/10">
                  <div className="w-16 h-16 rounded-full bg-[#0b3d2e]/5 flex items-center justify-center mb-6 text-[#0b3d2e]">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0b3d2e] mb-4">Global Reach</h3>
                  <p className="text-[#636364] leading-relaxed">
                    Broadcasted to over 200 countries and territories, reaching 500 million
                    households worldwide, ensuring your brand is seen on a global stage.
                  </p>
                </GlassCard>

                <GlassCard className="p-8 flex flex-col items-center text-center bg-white/40 border-[#0b3d2e]/10">
                  <div className="w-16 h-16 rounded-full bg-[#0b3d2e]/5 flex items-center justify-center mb-6 text-[#0b3d2e]">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0b3d2e] mb-4">Elite Audience</h3>
                  <p className="text-[#636364] leading-relaxed">
                    Connect directly with high-net-worth individuals, corporate leaders, and key
                    decision-makers in a relaxed, premium environment.
                  </p>
                </GlassCard>

                <GlassCard className="p-8 flex flex-col items-center text-center bg-white/40 border-[#0b3d2e]/10">
                  <div className="w-16 h-16 rounded-full bg-[#0b3d2e]/5 flex items-center justify-center mb-6 text-[#0b3d2e]">
                    <Handshake className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0b3d2e] mb-4">Business Networking</h3>
                  <p className="text-[#636364] leading-relaxed">
                    Exclusive pro-am spots, VIP hospitality, and private events provide unparalleled
                    opportunities for relationship building and B2B networking.
                  </p>
                </GlassCard>
              </>
            )}
          </div>

          <div className="bg-[#0b3d2e] border border-[#0b3d2e]/20 rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
            <h3 className="text-2xl font-light text-white mb-4">
              {pageContent?.ctaSection?.title || 'Have specific questions?'}
            </h3>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              {pageContent?.ctaSection?.description ||
                'Our dedicated sponsorship team is here to answer your questions and help customize a package that meets your specific business objectives.'}
            </p>
            <Link
              href={pageContent?.ctaSection?.buttonLink || '/register/sponsor'}
              className="inline-block bg-white text-[#0b3d2e] hover:bg-[#f8f5e9] font-bold px-8 py-4 text-lg rounded-xl transition-transform hover:scale-105"
            >
              {pageContent?.ctaSection?.buttonText || 'Contact Customer Service'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
