import type { PlayerGridBlock as PlayerGridBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import { SectionHeader, PlayerCard } from '@/components/golf'

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & PlayerGridBlockProps

const getPlayers = cache(async (limit: number) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'players',
    where: {
      status: { equals: 'active' },
    },
    limit,
    sort: 'rank',
  })

  return result.docs
})

export const PlayerGridBlockComponent: React.FC<Props> = async ({
  className,
  label,
  title,
  titleHighlight,
  description,
  limit,
}) => {
  const players = await getPlayers(limit ?? 12)

  if (!players.length) return null

  return (
    <section className={cn('py-20', className)}>
      <div className="container mx-auto px-6">
        <SectionHeader
          label={label || undefined}
          title={title || 'Our'}
          titleHighlight={titleHighlight || 'Players'}
          description={description || undefined}
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
