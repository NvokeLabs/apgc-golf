import 'dotenv/config'

import { getPayload } from 'payload'
import config from '@/payload.config'

async function main() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'sponsors',
    limit: 1000,
    pagination: false,
  })

  const stale: Array<{ id: number; name: string; tier: unknown }> = []

  for (const sponsor of docs) {
    const tier = sponsor.tier
    // A valid tier is either a number (ID reference) or an object (populated relation).
    // A string here means a pre-refactor hardcoded key like 'title' / 'gold' / 'platinum'.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (tier as any) === 'string') {
      stale.push({ id: sponsor.id, name: sponsor.name, tier })
    }
  }

  if (stale.length === 0) {
    console.log(`\nNo stale sponsors found out of ${docs.length} total. Safe to deploy.`)
    process.exit(0)
  }

  console.log(`\n⚠️  Found ${stale.length} sponsor(s) with stale string tier values:\n`)
  for (const s of stale) {
    console.log(`  id=${s.id}  name="${s.name}"  tier=${JSON.stringify(s.tier)}`)
  }
  console.log(
    `\nOpen each in the admin panel (Golf Content → Sponsors) and reselect the tier from the relationship dropdown, or delete the row if the sponsor is no longer active.`,
  )
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
