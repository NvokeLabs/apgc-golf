import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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
  const standardArticles = articles.slice(1)

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-[#0b3d2e]/10 pb-8">
          <div>
            <span className="text-[#0b3d2e] text-xs font-bold tracking-widest uppercase mb-2 block">
              Latest Updates
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-[#0b3d2e]">
              News & <span className="font-serif italic font-medium">Insights</span>
            </h1>
          </div>
        </div>

        {articles.length > 0 ? (
          <div className="space-y-12">
            {/* Featured Article - Full Width */}
            {featuredArticle && (
              <Link href={`/news/${featuredArticle.slug}`}>
                <div className="group cursor-pointer relative rounded-2xl overflow-hidden h-[500px] md:h-[600px] border border-[#0b3d2e]/10 shadow-sm">
                  {typeof featuredArticle.image === 'object' && featuredArticle.image?.url ? (
                    <Image
                      src={featuredArticle.image.url}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <Image
                      src="https://images.unsplash.com/photo-1573684955725-34046d1ea9f3?w=1200&q=80"
                      alt={featuredArticle.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b3d2e]/90 via-[#0b3d2e]/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-3xl">
                    <span className="px-3 py-1 bg-[#0b3d2e] text-white rounded-full text-[10px] uppercase tracking-widest font-bold mb-4 inline-block">
                      Featured Story
                    </span>
                    <h2 className="text-3xl md:text-5xl text-white font-serif italic mb-4 leading-tight group-hover:text-[#c2ecdb] transition-colors">
                      {featuredArticle.title}
                    </h2>
                    {featuredArticle.subtitle && (
                      <p className="text-white/80 text-lg mb-6 line-clamp-2 md:line-clamp-none">
                        {featuredArticle.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-white/60">
                      <span>
                        {featuredArticle.publishedDate
                          ? new Date(featuredArticle.publishedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : ''}
                      </span>
                      {featuredArticle.readTime && <span>{featuredArticle.readTime}</span>}
                      <span className="flex items-center text-white font-medium ml-auto md:ml-0">
                        Read Article{' '}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Standard Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {standardArticles.map((article) => (
                <GlassCard
                  key={article.id}
                  className="group p-0 overflow-hidden flex flex-col bg-white/40 border-[#0b3d2e]/10 cursor-pointer"
                  hoverEffect
                >
                  <Link href={`/news/${article.slug}`} className="flex flex-col h-full">
                    <div className="relative h-52 overflow-hidden">
                      {typeof article.image === 'object' && article.image?.url ? (
                        <Image
                          src={article.image.url}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <Image
                          src="https://images.unsplash.com/photo-1573684955725-34046d1ea9f3?w=600&q=80"
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      {article.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-2 py-1 bg-white/80 backdrop-blur-md text-[#0b3d2e] border border-[#0b3d2e]/10 rounded text-[10px] uppercase tracking-wider font-medium">
                            {article.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-xl text-[#0b3d2e] font-medium mb-3 line-clamp-2 group-hover:text-[#0b3d2e]/80 transition-colors">
                          {article.title}
                        </h3>
                        {article.subtitle && (
                          <p className="text-[#636364] text-sm line-clamp-2 mb-4">
                            {article.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="pt-4 border-t border-[#0b3d2e]/10 flex justify-between items-center text-xs text-[#636364]">
                        <span>
                          {article.publishedDate
                            ? new Date(article.publishedDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : ''}
                        </span>
                        {article.readTime && <span>{article.readTime}</span>}
                      </div>
                    </div>
                  </Link>
                </GlassCard>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 border border-[#0b3d2e]/10 rounded-2xl bg-white/40">
            <p className="text-[#636364] text-lg">No articles found</p>
          </div>
        )}
      </div>
    </div>
  )
}
