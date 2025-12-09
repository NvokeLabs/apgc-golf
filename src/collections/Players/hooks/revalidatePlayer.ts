import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidatePlayerAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (req.context?.skipRevalidate) return doc

  revalidatePath('/players')
  revalidatePath(`/players/${doc.slug}`)
  revalidatePath('/')
  revalidateTag('players')

  return doc
}

export const revalidatePlayerAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (req.context?.skipRevalidate) return doc

  revalidatePath('/players')
  revalidatePath(`/players/${doc.slug}`)
  revalidatePath('/')
  revalidateTag('players')

  return doc
}
