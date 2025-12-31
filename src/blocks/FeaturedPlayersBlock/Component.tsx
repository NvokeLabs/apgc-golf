import type { FeaturedPlayersBlock as FeaturedPlayersBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import { SectionHeader, PlayerCard } from '@/components/golf'

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & FeaturedPlayersBlockProps

const getFeaturedPlayers = cache(async (limit: number) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'players',
    where: {
      isFeatured: { equals: true },
      status: { equals: 'active' },
    },
    limit,
    sort: 'rank',
  })

  return result.docs
})

export const FeaturedPlayersBlockComponent: React.FC<Props> = async ({
  className,
  label,
  title,
  titleHighlight,
  description,
  showViewAll,
  limit,
}) => {
  const players = await getFeaturedPlayers(limit ?? 4)

  if (!players.length) return null

  return (
    <section className={cn('py-20', className)}>
      <div className="container mx-auto px-6">
        <SectionHeader
          label={label || undefined}
          title={title || 'Featured'}
          titleHighlight={titleHighlight || 'Players'}
          description={description || undefined}
          link={showViewAll ? { href: '/players', text: 'View All Players' } : undefined}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </div>
    </section>
  )
}
