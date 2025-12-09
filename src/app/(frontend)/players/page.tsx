import type { Metadata } from 'next'

import { PlayerCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'

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
  const players = await getPlayers()

  const featuredPlayers = players.filter((p) => p.isFeatured)
  const otherPlayers = players.filter((p) => !p.isFeatured)

  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white md:text-5xl">Our Players</h1>
        <p className="mt-4 text-lg text-white/60">
          Meet the talented golfers who make up our community
        </p>
      </div>

      {/* Featured Players */}
      {featuredPlayers.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Featured Players</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} featured />
            ))}
          </div>
        </section>
      )}

      {/* All Players */}
      <section>
        <h2 className="mb-6 text-2xl font-bold text-white">All Players</h2>
        {players.length === 0 ? (
          <p className="text-center text-white/60">No players found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {otherPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
