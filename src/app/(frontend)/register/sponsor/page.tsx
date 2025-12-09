import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import Link from 'next/link'
import { ArrowLeft, Award, Check, Star, Trophy } from 'lucide-react'

import { SponsorRegistrationForm } from './SponsorRegistrationForm'

export const metadata: Metadata = {
  title: 'Become a Sponsor | APGC Golf',
  description: 'Partner with APGC Golf and connect with our community of passionate golfers.',
}

const sponsorshipTiers = [
  {
    name: 'Title Sponsor',
    tier: 'title',
    icon: Trophy,
    price: 'Rp 500,000,000+',
    benefits: [
      'Title naming rights for Annual Championship',
      'Exclusive branding on all event materials',
      'VIP hospitality suite at all major events',
      'Speaking opportunity at awards ceremony',
    ],
  },
  {
    name: 'Platinum Partner',
    tier: 'platinum',
    icon: Star,
    price: 'Rp 250,000,000+',
    benefits: [
      'Premium logo placement on event materials',
      'VIP access to all events',
      'Social media feature campaigns',
      'Banner placement at all tournaments',
    ],
  },
  {
    name: 'Gold Partner',
    tier: 'gold',
    icon: Award,
    price: 'Rp 100,000,000+',
    benefits: [
      'Logo on website sponsor page',
      'Social media mentions',
      'Event signage placement',
      'Complimentary event tickets',
    ],
  },
]

export default function SponsorRegistrationPage() {
  return (
    <div className="container py-16">
      <Link
        href="/sponsors"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sponsors
      </Link>

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-white md:text-4xl">Become a Sponsor</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
          Partner with APGC Golf and connect with our community of passionate golfers
          and industry leaders.
        </p>
      </div>

      {/* Sponsorship Tiers Overview */}
      <div className="mb-12 grid gap-6 lg:grid-cols-3">
        {sponsorshipTiers.map((tier) => (
          <GlassCard key={tier.tier} className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <tier.icon className="h-6 w-6 text-emerald-400" />
              <h3 className="font-semibold text-white">{tier.name}</h3>
            </div>
            <p className="mb-4 text-xl font-bold text-emerald-400">{tier.price}</p>
            <ul className="space-y-2">
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

      {/* Application Form */}
      <GlassCard className="mx-auto max-w-2xl p-6 md:p-8">
        <h2 className="mb-2 text-xl font-bold text-white">Sponsorship Application</h2>
        <p className="mb-8 text-white/60">
          Fill out the form below and our team will contact you to discuss partnership
          opportunities.
        </p>

        <SponsorRegistrationForm />
      </GlassCard>
    </div>
  )
}
