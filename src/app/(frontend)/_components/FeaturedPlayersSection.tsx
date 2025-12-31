import { Suspense } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import { SectionHeader, PlayerCard } from '@/components/golf'
import { PlayerCardSkeleton } from '@/components/golf/skeletons'

const getFeaturedPlayers = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'players',
    where: { isFeatured: { equals: true }, status: { equals: 'active' } },
    limit: 4,
    sort: 'rank',
  })
  return result.docs
})

async function FeaturedPlayersContent() {
  const players = await getFeaturedPlayers()

  if (!players.length) return null

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  )
}

function FeaturedPlayersSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <PlayerCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function FeaturedPlayersSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <SectionHeader
          label="Our Champions"
          title="Featured"
          titleHighlight="Players"
          link={{ href: '/players', text: 'View All Players' }}
        />
        <Suspense fallback={<FeaturedPlayersSkeleton />}>
          <FeaturedPlayersContent />
        </Suspense>
      </div>
    </section>
  )
}
