import type { Sponsor } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { GlassCard } from './GlassCard'

interface SponsorCardProps {
  sponsor: Sponsor
  showTier?: boolean
  className?: string
}

const tierColors = {
  title: 'border-amber-400 bg-amber-400/10',
  platinum: 'border-slate-300 bg-slate-300/10',
  gold: 'border-amber-600 bg-amber-600/10',
}

const tierLabels = {
  title: 'Title Sponsor',
  platinum: 'Platinum Partner',
  gold: 'Gold Partner',
}

export function SponsorCard({ sponsor, showTier = true, className }: SponsorCardProps) {
  const logoUrl =
    typeof sponsor.logo === 'object' && sponsor.logo?.url ? sponsor.logo.url : '/placeholder-sponsor.png'

  const Card = (
    <GlassCard className={cn('p-6', showTier && tierColors[sponsor.tier], className)}>
      <div className="flex flex-col items-center text-center">
        <div className="relative h-20 w-40">
          <Image
            src={logoUrl}
            alt={sponsor.name}
            fill
            className="object-contain"
            sizes="160px"
          />
        </div>

        <h3 className="mt-4 font-semibold text-white">{sponsor.name}</h3>

        {showTier && (
          <span className="mt-1 text-xs text-white/60">{tierLabels[sponsor.tier]}</span>
        )}

        {sponsor.description && (
          <p className="mt-3 text-sm text-white/70 line-clamp-2">{sponsor.description}</p>
        )}

        {sponsor.website && (
          <div className="mt-4 flex items-center gap-1 text-sm text-emerald-400">
            <ExternalLink className="h-3 w-3" />
            <span>Visit Website</span>
          </div>
        )}
      </div>
    </GlassCard>
  )

  if (sponsor.website) {
    return (
      <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
        {Card}
      </a>
    )
  }

  return Card
}
