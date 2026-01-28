import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trophy, TrendingUp } from 'lucide-react'
import { getSiteLabels } from '@/utilities/getSiteContent'

export const metadata: Metadata = {
  title: 'Players | APGC Golf',
  description: 'Browse our player directory and discover talented golfers in the APGC community.',
}

export const revalidate = 1800 // Revalidate every 30 minutes

const getPlayers = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const players = await payload.find({
    collection: 'players',
    limit: 100,
    sort: 'rank',
    where: {
      status: {
        equals: 'active',
      },
    },
  })

  return players.docs
})

export default async function PlayersPage() {
  const [players, labels] = await Promise.all([getPlayers(), getSiteLabels()])

  const featuredPlayers = players.filter((p) => p.isFeatured)

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Top Players Section */}
        <div className="mb-16">
          <h2 className="text-3xl text-[#0b3d2e] mb-8 font-bold">
            {labels?.sectionLabels?.topPlayers || 'Top Players'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPlayers.slice(0, 4).map((player, index) => (
              <Link key={player.id} href={`/players/${player.slug}`}>
                <GlassCard
                  className="relative bg-white/40 rounded-xl overflow-hidden border border-[#0b3d2e]/10 hover:border-[#0b3d2e]/40 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  hoverEffect
                >
                  {/* MVP Badge for first player */}
                  {index === 0 && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-[#0b3d2e] text-white text-xs font-bold px-2 py-1 rounded">
                        {labels?.miscLabels?.mvp || 'MVP'}
                      </span>
                    </div>
                  )}

                  {/* Player Image */}
                  <div className="relative h-48 bg-[#0b3d2e]/5 overflow-hidden">
                    {typeof player.image === 'object' && player.image?.url ? (
                      <Image
                        src={player.image.url}
                        alt={player.name}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <Image
                        src="https://images.unsplash.com/photo-1633597470203-77c0986ecc4d?w=600&q=80"
                        alt={player.name}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0b3d2e]/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium text-sm drop-shadow-md">
                        {labels?.buttonLabels?.viewProfile || 'View Profile'}
                      </p>
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="p-4">
                    <h3 className="text-[#0b3d2e] font-semibold mb-1">{player.name}</h3>
                    <p className="text-[#636364] text-sm">{player.country}</p>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>

        {/* All Players List */}
        <div className="space-y-3 mb-8">
          <h2 className="text-2xl text-[#0b3d2e] mb-6 font-bold">
            {labels?.sectionLabels?.allPlayers || 'All Players'}
          </h2>

          {players.length > 0 ? (
            players.map((player) => (
              <Link key={player.id} href={`/players/${player.slug}`}>
                <div className="flex items-center justify-between p-4 bg-white/40 border border-[#0b3d2e]/10 rounded-lg hover:bg-white/60 hover:border-[#0b3d2e]/30 transition-all cursor-pointer group shadow-sm mb-3">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden border border-[#0b3d2e]/10 bg-[#0b3d2e]/10">
                      {typeof player.image === 'object' && player.image?.url ? (
                        <Image
                          src={player.image.url}
                          alt={player.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-[#0b3d2e] font-medium">
                          {player.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-[#0b3d2e] font-semibold group-hover:text-[#0b3d2e] transition-colors">
                        {player.name}
                      </h3>
                      <p className="text-[#636364] text-sm">
                        {player.wins ?? 0} {labels?.fieldLabels?.wins || 'Wins'} • {player.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 text-[#636364]">
                      <Trophy className="w-4 h-4 text-[#0b3d2e]" />
                      <span className="text-sm">{player.wins ?? 0}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-[#636364]">
                      <TrendingUp className="w-4 h-4 text-[#0b3d2e]" />
                      <span className="text-sm">
                        {player.points ?? 0} {labels?.miscLabels?.pts || 'pts'}
                      </span>
                    </div>
                    <div className="text-[#636364]">
                      {labels?.fieldLabels?.rank || 'Rank'}:{' '}
                      <span className="text-[#0b3d2e] font-medium">#{player.rank || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-[#636364]">
                {labels?.miscLabels?.noPlayersFound || 'No players found'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
