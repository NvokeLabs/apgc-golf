import type { SponsorsMarqueeBlock as SponsorsMarqueeBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import { SectionHeader } from '@/components/golf'
import dynamic from 'next/dynamic'

const SponsorMarquee = dynamic(
  () => import('@/components/golf/SponsorMarquee').then((mod) => ({ default: mod.SponsorMarquee })),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse bg-[#0b3d2e]/5 rounded-xl" />,
  },
)

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & SponsorsMarqueeBlockProps

const getActiveSponsors = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'sponsors',
    where: {
      isActive: { equals: true },
    },
    limit: 50,
    sort: 'order',
  })

  return result.docs
})

export const SponsorsMarqueeBlockComponent: React.FC<Props> = async ({
  className,
  label,
  title,
  titleHighlight,
  showViewAll,
}) => {
  const sponsors = await getActiveSponsors()

  if (!sponsors.length) return null

  return (
    <section className={cn('py-20 bg-[#0b3d2e]/5', className)}>
      <div className="container mx-auto px-6">
        <SectionHeader
          label={label || undefined}
          title={title || 'Proud'}
          titleHighlight={titleHighlight || 'Sponsors'}
          align="center"
          link={showViewAll ? { href: '/sponsors', text: 'Become a Sponsor' } : undefined}
        />
      </div>

      <SponsorMarquee sponsors={sponsors} />
    </section>
  )
}
