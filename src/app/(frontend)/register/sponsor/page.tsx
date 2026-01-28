import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import Link from 'next/link'
import { ArrowLeft, Award, Check, Star, Trophy } from 'lucide-react'
import { getFormContent, getSiteLabels, getSponsorshipTiers } from '@/utilities/getSiteContent'

import { SponsorRegistrationForm } from './SponsorRegistrationForm'

export const metadata: Metadata = {
  title: 'Become a Sponsor | APGC Golf',
  description: 'Partner with APGC Golf and connect with our community of passionate golfers.',
}

const tierIcons: Record<string, typeof Trophy> = {
  title: Trophy,
  platinum: Star,
  gold: Award,
  silver: Award,
  bronze: Award,
}

export default async function SponsorRegistrationPage() {
  const [formContent, labels, tiers] = await Promise.all([
    getFormContent(),
    getSiteLabels(),
    getSponsorshipTiers(),
  ])

  const content = formContent?.sponsorRegistration

  return (
    <div className="container pt-24 pb-16">
      <Link
        href="/sponsors"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[#636364] hover:text-[#0b3d2e]"
      >
        <ArrowLeft className="h-4 w-4" />
        {labels?.navigationLabels?.backToSponsors || 'Back to Sponsors'}
      </Link>

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-[#0b3d2e] md:text-4xl">
          {content?.pageTitle || 'Become a Sponsor'}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[#636364]">
          {content?.pageDescription ||
            'Partner with APGC Golf and connect with our community of passionate golfers and industry leaders.'}
        </p>
      </div>

      {/* Sponsorship Tiers Overview */}
      {tiers && tiers.length > 0 && (
        <div className="mb-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => {
            const IconComponent = tierIcons[tier.tierKey || 'gold'] || Award
            return (
              <GlassCard key={tier.id} className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-[#0b3d2e]" />
                  <h3 className="font-semibold text-[#0b3d2e]">{tier.name}</h3>
                </div>
                <p className="mb-4 text-xl font-bold text-[#0b3d2e]">{tier.price}</p>
                {tier.benefits && tier.benefits.length > 0 && (
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-[#636364]">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0b3d2e]" />
                        <span>{benefit.benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* Application Form */}
      <GlassCard className="mx-auto max-w-2xl p-6 md:p-8">
        <h2 className="mb-2 text-xl font-bold text-[#0b3d2e]">
          {content?.formTitle || 'Sponsorship Application'}
        </h2>
        <p className="mb-8 text-[#636364]">
          {content?.formDescription ||
            'Fill out the form below and our team will contact you to discuss partnership opportunities.'}
        </p>

        <SponsorRegistrationForm formContent={content} sponsorshipTiers={tiers} />
      </GlassCard>
    </div>
  )
}
