import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import Link from 'next/link'
import { ArrowLeft, Award, Check } from 'lucide-react'
import { getFormContent, getSiteLabels, getSponsorshipTiers } from '@/utilities/getSiteContent'

import { SponsorRegistrationForm } from './SponsorRegistrationForm'

export const metadata: Metadata = {
  title: 'Menjadi Sponsor | APGC Golf',
  description: 'Bermitra dengan APGC Golf dan terhubung dengan komunitas pegolf kami.',
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
        {labels?.navigationLabels?.backToSponsors || 'Kembali ke Sponsor'}
      </Link>

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-[#0b3d2e] md:text-4xl">
          {content?.pageTitle || 'Menjadi Sponsor'}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[#636364]">
          {content?.pageDescription ||
            'Bermitra dengan APGC Golf dan terhubung dengan komunitas pegolf serta pemimpin industri kami.'}
        </p>
      </div>

      {/* Sponsorship Tiers Overview */}
      {tiers && tiers.length > 0 && (
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            return (
              <GlassCard key={tier.id} className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Award className="h-6 w-6 text-[#0b3d2e]" />
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
          {content?.formTitle || 'Pengajuan Sponsorship'}
        </h2>
        <p className="mb-8 text-[#636364]">
          {content?.formDescription ||
            'Isi formulir di bawah ini dan tim kami akan menghubungi Anda untuk membahas peluang kemitraan.'}
        </p>

        <SponsorRegistrationForm formContent={content} sponsorshipTiers={tiers} />
      </GlassCard>
    </div>
  )
}
