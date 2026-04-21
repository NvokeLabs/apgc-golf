import 'dotenv/config'

import { getPayload } from 'payload'
import config from '@/payload.config'

import type { LogoSize } from '@/utilities/sponsorTierSize'

/**
 * Map a tier's `order` to a logoSize bucket, mirroring the seed defaults.
 * Editors can override in admin after running.
 */
const orderToLogoSize = (order: number | null | undefined): LogoSize => {
  if (order == null) return 'sm'
  if (order <= 1) return 'xl'
  if (order === 2) return 'lg'
  if (order === 3) return 'md'
  return 'sm'
}

async function main() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'sponsorship-tiers',
    limit: 1000,
    pagination: false,
  })

  let updated = 0
  let skipped = 0

  for (const tier of docs) {
    if (tier.logoSize) {
      skipped += 1
      continue
    }
    const next = orderToLogoSize(tier.order)
    await payload.update({
      collection: 'sponsorship-tiers',
      id: tier.id,
      data: { logoSize: next },
    })
    console.log(`  set logoSize=${next} on "${tier.name}" (order=${tier.order ?? 'null'})`)
    updated += 1
  }

  console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
