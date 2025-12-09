import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateNewsAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (req.context?.skipRevalidate) return doc

  revalidatePath('/news')
  revalidatePath(`/news/${doc.slug}`)
  revalidatePath('/')
  revalidateTag('news')

  return doc
}

export const revalidateNewsAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (req.context?.skipRevalidate) return doc

  revalidatePath('/news')
  revalidatePath(`/news/${doc.slug}`)
  revalidatePath('/')
  revalidateTag('news')

  return doc
}
