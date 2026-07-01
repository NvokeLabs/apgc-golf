import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { cache } from 'react'
import { Check, ArrowRight, Award, Globe, Users, Handshake, Trophy, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  LOGO_SIZE_CLASSES,
  LOGO_SIZE_IMAGE_DIMS,
  type LogoSize,
  resolveLogoSize,
} from '@/utilities/sponsorTierSize'
import {
  getSponsorsPageContent,
  getSponsorshipTiers,
  getSiteLabels,
} from '@/utilities/getSiteContent'

export const metadata: Metadata = {
  title: 'Sponsor | APGC Golf',
  description: 'Temui sponsor dan mitra kami. Pelajari peluang sponsorship bersama APGC Golf.',
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
    name: 'ALBATROS',
    price: 'Rp 100.000.000',
    benefits: [
      { benefit: 'Pemasangan logo perusahaan di semua material promosi & venue' },
      { benefit: 'Penyebutan oleh MC selama acara berlangsung' },
      { benefit: 'Mendapatkan 10 banner/spanduk/umbul-umbul' },
      {
        benefit: 'Penempatan logo perusahaan pada banner selamat datang & selamat bertanding',
      },
      { benefit: 'Mendapatkan 4 undangan untuk mengikuti turnamen' },
      {
        benefit:
          'Logo Perusahaan tampil pada website Alumni Polinema Golf Club di www.polinemagolf.com',
      },
    ],
    isHighlighted: true,
  },
  {
    name: 'EAGLE',
    price: 'Rp 75.000.000',
    benefits: [
      { benefit: 'Pemasangan logo perusahaan di semua material promosi & venue' },
      { benefit: 'Penyebutan oleh MC selama acara berlangsung' },
      { benefit: 'Mendapatkan 8 banner/spanduk/umbul-umbul' },
      {
        benefit: 'Penempatan logo perusahaan pada banner selamat datang & selamat bertanding',
      },
      { benefit: 'Mendapatkan 3 undangan untuk mengikuti turnamen' },
      {
        benefit:
          'Logo Perusahaan tampil pada website Alumni Polinema Golf Club di www.polinemagolf.com',
      },
    ],
    isHighlighted: false,
  },
  {
    name: 'BIRDIE',
    price: 'Rp 50.000.000',
    benefits: [
      { benefit: 'Pemasangan logo perusahaan di semua material promosi & venue' },
      { benefit: 'Penyebutan oleh MC selama acara berlangsung' },
      { benefit: 'Mendapatkan 6 banner/spanduk/umbul-umbul' },
      { benefit: 'Mendapatkan 2 undangan untuk mengikuti turnamen' },
      {
        benefit:
          'Logo Perusahaan tampil pada website Alumni Polinema Golf Club di www.polinemagolf.com',
      },
    ],
    isHighlighted: false,
  },
  {
    name: 'PAR',
    price: 'Rp 25.000.000',
    benefits: [
      { benefit: 'Pemasangan logo perusahaan di semua material promosi & venue' },
      { benefit: 'Penyebutan oleh MC selama acara berlangsung' },
      { benefit: 'Mendapatkan 4 banner/spanduk/umbul-umbul' },
      { benefit: 'Mendapatkan 1 undangan untuk mengikuti turnamen' },
      {
        benefit:
          'Logo Perusahaan tampil pada website Alumni Polinema Golf Club di www.polinemagolf.com',
      },
    ],
    isHighlighted: false,
  },
]

export default async function SponsorsPage() {
  const [sponsors, cmsTiers, pageContent, labels] = await Promise.all([
    getSponsors(),
    getSponsorshipTiers(),
    getSponsorsPageContent(),
    getSiteLabels(),
  ])

  // Use CMS tiers if available, otherwise use defaults
  const sponsorshipTiers = cmsTiers.length > 0 ? cmsTiers : defaultSponsorshipTiers

  // Group sponsors by tier id so tier.order drives the pyramid row order.
  const sponsorsByTierId = new Map<string | number, typeof sponsors>()
  for (const sponsor of sponsors) {
    const tierId = typeof sponsor.tier === 'object' && sponsor.tier ? sponsor.tier.id : sponsor.tier
    if (tierId == null) continue
    const bucket = sponsorsByTierId.get(tierId) ?? []
    bucket.push(sponsor)
    sponsorsByTierId.set(tierId, bucket)
  }

  const FALLBACK_TEXT_CLASSES: Record<LogoSize, string> = {
    xl: 'font-serif italic text-xl md:text-2xl text-[#0b3d2e]',
    lg: 'font-medium text-sm text-[#0b3d2e]',
    md: 'font-medium text-xs text-[#0b3d2e]/80',
    sm: 'font-medium text-xs text-[#0b3d2e]/80',
  }

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <span className="text-[#0b3d2e] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
            {pageContent?.header?.label || 'Mitra Kami'}
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-[#0b3d2e] mb-6">
            {pageContent?.header?.title || 'Penggerak'}{' '}
            <span className="font-serif italic font-medium">
              {pageContent?.header?.titleHighlight || 'Utama'}
            </span>
          </h1>
          <p className="text-[#636364] text-lg">
            {pageContent?.header?.description ||
              'Kami bangga bermitra dengan merek-merek terkemuka dunia yang berbagi semangat kami akan keunggulan, tradisi, dan masa depan golf.'}
          </p>
        </div>

        {/* Pyramid Layout */}
        {sponsors.length > 0 && cmsTiers.length > 0 && (
          <div className="mb-24 flex flex-col items-center gap-4">
            {cmsTiers.map((tier) => {
              const tierSponsors = (sponsorsByTierId.get(tier.id) ?? [])
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              if (tierSponsors.length === 0) return null

              const size = resolveLogoSize(tier.logoSize)
              const dims = LOGO_SIZE_IMAGE_DIMS[size]

              return (
                <div
                  key={tier.id}
                  className="flex flex-wrap justify-center gap-3 md:gap-6 max-w-6xl w-full"
                >
                  {tierSponsors.map((sponsor) => (
                    <GlassCard
                      key={sponsor.id}
                      className={`${LOGO_SIZE_CLASSES[size]} flex items-center justify-center p-4 bg-white/50 border-[#0b3d2e]/10 hover:border-[#0b3d2e]/30 transition-colors`}
                      hoverEffect
                    >
                      {typeof sponsor.logo === 'object' && sponsor.logo?.url ? (
                        <Image
                          src={sponsor.logo.url}
                          alt={sponsor.name}
                          width={dims.width}
                          height={dims.height}
                          className="max-w-full max-h-full object-contain opacity-100 transition-all duration-500"
                        />
                      ) : (
                        <span className={`${FALLBACK_TEXT_CLASSES[size]} text-center`}>
                          {sponsor.name}
                        </span>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* Partnership Proposal Embed */}
        <div className="mb-24">
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 0,
              paddingTop: '56.25%',
              paddingBottom: 0,
              boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)',
              overflow: 'hidden',
              borderRadius: '8px',
              willChange: 'transform',
            }}
          >
            <iframe
              loading="lazy"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                border: 'none',
                padding: 0,
                margin: 0,
              }}
              src="https://www.canva.com/design/DAHCCslr8V0/YK6-LNoqw2n1GULcjxBQGw/view?embed"
              allowFullScreen
              allow="fullscreen"
            />
          </div>
        </div>

        {/* Become a Sponsor Section */}
        <div className="py-24 border-t border-[#0b3d2e]/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b3d2e] mb-4">
              {pageContent?.becomeASponsor?.title || 'Jadilah'}{' '}
              <span className="font-serif italic font-medium">
                {pageContent?.becomeASponsor?.titleHighlight || 'Sponsor'}
              </span>
            </h2>
            <p className="text-[#636364] max-w-2xl mx-auto">
              {pageContent?.becomeASponsor?.description ||
                'Bergabunglah dengan kelompok elite merek global dan terhubung dengan audiens penggemar golf berkelas yang penuh semangat.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sponsorshipTiers.map((tier, idx) => (
              <GlassCard
                key={idx}
                className={`relative p-8 flex flex-col bg-white border-2 ${tier.isHighlighted ? 'border-[#D66232] shadow-2xl shadow-[#D66232]/20 ring-2 ring-[#D66232]/30 ring-offset-2' : 'border-[#0b3d2e]/10 hover:shadow-lg transition-shadow'}`}
              >
                {tier.isHighlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D66232] text-white border-2 border-[#D66232] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {labels?.miscLabels?.mostPopular || 'Paling Populer'}
                  </div>
                )}

                <div className="mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-[#D66232]/10 mb-4 text-[#D66232]">
                    <Award className="w-8 h-8" />
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

                <Button asChild variant="brandOutline" className="w-full py-4 text-lg group gap-2">
                  <Link href="/register/sponsor">
                    {labels?.buttonLabels?.inquireNow || 'Tanya Sekarang'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Why Partner With Us Section */}
        <div className="py-24 border-t border-[#0b3d2e]/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b3d2e] mb-6">
              {pageContent?.whyPartner?.title || 'Mengapa'}{' '}
              <span className="font-serif italic font-medium">
                {pageContent?.whyPartner?.titleHighlight || 'Bermitra Dengan Kami?'}
              </span>
            </h2>
            <p className="text-[#636364] max-w-3xl mx-auto text-lg">
              {pageContent?.whyPartner?.description ||
                'Selaraskan merek Anda dengan keunggulan. Turnamen kami menawarkan platform unik untuk menjangkau audiens berkelas dan menghasilkan dampak bisnis nyata.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
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
                  <h3 className="text-xl font-bold text-[#0b3d2e] mb-4">Jangkauan Global</h3>
                  <p className="text-[#636364] leading-relaxed">
                    Disiarkan ke lebih dari 200 negara dan wilayah, menjangkau 500 juta rumah tangga
                    di seluruh dunia, memastikan merek Anda terlihat di panggung global.
                  </p>
                </GlassCard>

                <GlassCard className="p-8 flex flex-col items-center text-center bg-white/40 border-[#0b3d2e]/10">
                  <div className="w-16 h-16 rounded-full bg-[#0b3d2e]/5 flex items-center justify-center mb-6 text-[#0b3d2e]">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0b3d2e] mb-4">Audiens Elite</h3>
                  <p className="text-[#636364] leading-relaxed">
                    Terhubung langsung dengan individu berpengaruh, pemimpin perusahaan, dan
                    pengambil keputusan utama dalam lingkungan premium yang santai.
                  </p>
                </GlassCard>

                <GlassCard className="p-8 flex flex-col items-center text-center bg-white/40 border-[#0b3d2e]/10">
                  <div className="w-16 h-16 rounded-full bg-[#0b3d2e]/5 flex items-center justify-center mb-6 text-[#0b3d2e]">
                    <Handshake className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0b3d2e] mb-4">Jejaring Bisnis</h3>
                  <p className="text-[#636364] leading-relaxed">
                    Slot pro-am eksklusif, layanan VIP, dan acara privat memberikan peluang tak
                    tertandingi untuk membangun relasi dan jejaring B2B.
                  </p>
                </GlassCard>
              </>
            )}
          </div>

          <div className="bg-[#0b3d2e] border border-[#0b3d2e]/20 rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
            <h3 className="text-2xl font-light text-white mb-4">
              {pageContent?.ctaSection?.title || 'Punya pertanyaan khusus?'}
            </h3>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              {pageContent?.ctaSection?.description ||
                'Tim sponsorship kami siap menjawab pertanyaan Anda dan membantu menyusun paket yang sesuai dengan tujuan bisnis Anda.'}
            </p>
            <Link
              href={pageContent?.ctaSection?.buttonLink || '/register/sponsor'}
              className="inline-block bg-white text-[#0b3d2e] hover:bg-[#f8f5e9] font-bold px-8 py-4 text-lg rounded-xl transition-transform hover:scale-105"
            >
              {pageContent?.ctaSection?.buttonText || 'Hubungi Layanan Pelanggan'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
