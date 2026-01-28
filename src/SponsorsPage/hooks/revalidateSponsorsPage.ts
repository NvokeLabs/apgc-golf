import type { GlobalAfterChangeHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateSponsorsPage: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating sponsors-page`)

    revalidateTag('global_sponsors-page')
    revalidatePath('/sponsors')
  }

  return doc
}
