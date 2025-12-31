import { Suspense } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import { SectionHeader, NewsCard } from '@/components/golf'
import { NewsCardSkeleton } from '@/components/golf/skeletons'

const getLatestNews = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'news',
    where: { _status: { equals: 'published' } },
    limit: 3,
    sort: '-publishedDate',
  })
  return result.docs
})

async function LatestNewsContent() {
  const news = await getLatestNews()

  if (!news.length) return null

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  )
}

function LatestNewsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function LatestNewsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <SectionHeader
          label="Stay Updated"
          title="Latest"
          titleHighlight="News"
          link={{ href: '/news', text: 'View All News' }}
        />
        <Suspense fallback={<LatestNewsSkeleton />}>
          <LatestNewsContent />
        </Suspense>
      </div>
    </section>
  )
}
