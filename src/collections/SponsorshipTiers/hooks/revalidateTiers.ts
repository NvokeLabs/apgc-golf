import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateTierAfterChange: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating sponsorship-tiers`)

    revalidateTag('sponsorship-tiers')
    revalidatePath('/sponsors')
    revalidatePath('/register/sponsor')
  }

  return doc
}

export const revalidateTierAfterDelete: CollectionAfterDeleteHook = ({
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating sponsorship-tiers after delete`)

    revalidateTag('sponsorship-tiers')
    revalidatePath('/sponsors')
    revalidatePath('/register/sponsor')
  }
}
