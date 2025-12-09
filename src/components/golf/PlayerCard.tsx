import type { Player } from '@/payload-types'

import { cn } from '@/utilities/ui'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { GlassCard } from './GlassCard'

interface PlayerCardProps {
  player: Player
  featured?: boolean
  className?: string
}

export function PlayerCard({ player, featured = false, className }: PlayerCardProps) {
  const imageUrl =
    typeof player.image === 'object' && player.image?.url ? player.image.url : '/placeholder-player.jpg'

  return (
    <Link href={`/players/${player.slug}`}>
      <GlassCard className={cn('overflow-hidden', className)}>
        <div className={cn('relative', featured ? 'aspect-[3/4]' : 'aspect-square')}>
          <Image
            src={imageUrl}
            alt={player.name}
            fill
            className="object-cover"
            sizes={featured ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 50vw, 25vw'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Rank Badge */}
          {player.rank && (
            <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
              #{player.rank}
            </div>
          )}

          {/* Player Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className={cn('font-bold text-white', featured ? 'text-xl' : 'text-lg')}>{player.name}</h3>
            {player.country && <p className="text-sm text-white/70">{player.country}</p>}

            {/* Stats Row */}
            <div className="mt-3 flex gap-4 text-sm">
              {player.wins != null && player.wins > 0 && (
                <div className="text-white/80">
                  <span className="font-semibold text-emerald-400">{player.wins}</span> Wins
                </div>
              )}
              {player.points != null && player.points > 0 && (
                <div className="text-white/80">
                  <span className="font-semibold text-emerald-400">{player.points}</span> Pts
                </div>
              )}
              {player.handicap != null && (
                <div className="text-white/80">
                  HCP <span className="font-semibold text-emerald-400">{player.handicap}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}
