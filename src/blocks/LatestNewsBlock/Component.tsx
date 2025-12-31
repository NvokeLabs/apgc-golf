import type { LatestNewsBlock as LatestNewsBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import { SectionHeader, NewsCard } from '@/components/golf'

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & LatestNewsBlockProps

const getLatestNews = cache(async (limit: number) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'news',
    where: {
      _status: { equals: 'published' },
    },
    limit,
    sort: '-publishedDate',
  })

  return result.docs
})

export const LatestNewsBlockComponent: React.FC<Props> = async ({
  className,
  label,
  title,
  titleHighlight,
  description,
  showViewAll,
  limit,
}) => {
  const news = await getLatestNews(limit ?? 3)

  if (!news.length) return null

  return (
    <section className={cn('py-20', className)}>
      <div className="container mx-auto px-6">
        <SectionHeader
          label={label || undefined}
          title={title || 'Latest'}
          titleHighlight={titleHighlight || 'News'}
          description={description || undefined}
          link={showViewAll ? { href: '/news', text: 'View All News' } : undefined}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}
