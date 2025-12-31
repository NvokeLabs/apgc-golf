import type { EventGridBlock as EventGridBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import { SectionHeader, EventCard } from '@/components/golf'

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & EventGridBlockProps

const getEvents = cache(async (limit: number) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    limit,
    sort: 'date',
  })

  return result.docs
})

export const EventGridBlockComponent: React.FC<Props> = async ({
  className,
  label,
  title,
  titleHighlight,
  description,
  limit,
}) => {
  const events = await getEvents(limit ?? 9)

  if (!events.length) return null

  return (
    <section className={cn('py-20', className)}>
      <div className="container mx-auto px-6">
        <SectionHeader
          label={label || undefined}
          title={title || 'All'}
          titleHighlight={titleHighlight || 'Events'}
          description={description || undefined}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  )
}
