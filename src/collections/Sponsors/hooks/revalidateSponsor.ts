import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateSponsorAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (req.context?.skipRevalidate) return doc

  revalidatePath('/sponsors')
  revalidatePath('/')
  revalidateTag('sponsors')

  return doc
}

export const revalidateSponsorAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (req.context?.skipRevalidate) return doc

  revalidatePath('/sponsors')
  revalidatePath('/')
  revalidateTag('sponsors')

  return doc
}
