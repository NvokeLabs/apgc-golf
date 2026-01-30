import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'

export type EventParticipant = {
  id: number
  playerName: string
}

export const getEventParticipants = cache(async (eventId: number): Promise<EventParticipant[]> => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'event-registrations',
    where: {
      event: {
        equals: eventId,
      },
      paymentStatus: {
        equals: 'paid',
      },
    },
    select: {
      playerName: true,
    },
    limit: 100,
    sort: 'createdAt',
  })

  return result.docs.map((doc) => ({
    id: doc.id,
    playerName: doc.playerName,
  }))
})
