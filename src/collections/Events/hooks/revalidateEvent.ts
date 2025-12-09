import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateEventAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (req.context?.skipRevalidate) return doc

  revalidatePath('/events')
  revalidatePath(`/events/${doc.slug}`)
  revalidatePath('/')
  revalidateTag('events')

  return doc
}

export const revalidateEventAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (req.context?.skipRevalidate) return doc

  revalidatePath('/events')
  revalidatePath(`/events/${doc.slug}`)
  revalidatePath('/')
  revalidateTag('events')

  return doc
}
