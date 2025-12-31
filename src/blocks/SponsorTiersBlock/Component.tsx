import type { SponsorTiersBlock as SponsorTiersBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { SectionHeader, GlassCard } from '@/components/golf'
import { Check } from 'lucide-react'
import Link from 'next/link'

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & SponsorTiersBlockProps

export const SponsorTiersBlockComponent: React.FC<Props> = ({
  className,
  label,
  title,
  titleHighlight,
  description,
  tiers,
}) => {
  if (!tiers?.length) return null

  return (
    <section className={cn('py-20', className)}>
      <div className="container mx-auto px-6">
        <SectionHeader
          label={label || undefined}
          title={title || 'Sponsorship'}
          titleHighlight={titleHighlight || 'Packages'}
          description={description || undefined}
          align="center"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <GlassCard
              key={index}
              className={cn(
                'p-8 flex flex-col',
                tier.isHighlighted && 'ring-2 ring-[#0b3d2e] scale-105',
              )}
            >
              {tier.isHighlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0b3d2e] text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl font-bold text-[#0b3d2e] mb-2">{tier.name}</h3>

              {tier.price && (
                <p className="text-3xl font-light text-[#0b3d2e] mb-4">{tier.price}</p>
              )}

              {tier.description && (
                <p className="text-[#636364] text-sm mb-6">{tier.description}</p>
              )}

              {tier.benefits && tier.benefits.length > 0 && (
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.benefits.map((item, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#0b3d2e] flex-shrink-0 mt-0.5" />
                      <span className="text-[#636364] text-sm">{item.benefit}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href="/register/sponsor"
                className={cn(
                  'block w-full py-4 rounded-xl font-bold text-center transition-colors',
                  tier.isHighlighted
                    ? 'bg-[#0b3d2e] text-white hover:bg-[#091f18]'
                    : 'border-2 border-[#0b3d2e] text-[#0b3d2e] hover:bg-[#0b3d2e]/5',
                )}
              >
                Get Started
              </Link>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
