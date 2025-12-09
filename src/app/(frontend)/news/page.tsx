import type { Metadata } from 'next'

import { NewsCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'

export const metadata: Metadata = {
  title: 'News | APGC Golf',
  description: 'Stay updated with the latest news, tournament recaps, and stories from APGC Golf.',
}

export const revalidate = 1800 // Revalidate every 30 minutes

const getNews = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const news = await payload.find({
    collection: 'news',
    limit: 50,
    sort: '-publishedDate',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return news.docs
})

export default async function NewsPage() {
  const articles = await getNews()

  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white md:text-5xl">News & Updates</h1>
        <p className="mt-4 text-lg text-white/60">
          Stay updated with the latest from APGC Golf
        </p>
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="mb-16">
          <NewsCard article={featuredArticle} featured />
        </section>
      )}

      {/* All Articles */}
      {otherArticles.length > 0 && (
        <section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {articles.length === 0 && (
        <p className="text-center text-white/60">No news articles found.</p>
      )}
    </div>
  )
}
