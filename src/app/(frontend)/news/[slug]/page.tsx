import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import RichText from '@/components/RichText'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { Calendar, ChevronLeft, Clock, User, Share2, ArrowRight } from 'lucide-react'

type Args = {
  params: Promise<{ slug: string }>
}

const getArticle = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'news',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  })

  return result.docs[0] || null
})

const getRelatedArticles = cache(async (currentId: number, category: string) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'news',
    where: {
      and: [
        {
          id: {
            not_equals: currentId,
          },
        },
        {
          category: {
            equals: category,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
    limit: 3,
    sort: '-publishedDate',
  })

  return result.docs
})

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const news = await payload.find({
    collection: 'news',
    limit: 100,
    select: {
      slug: true,
    },
  })

  return news.docs.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    return {
      title: 'Article Not Found | APGC Golf',
    }
  }

  return {
    title: `${article.title} | APGC Golf News`,
    description: article.subtitle || `Read ${article.title} on APGC Golf.`,
  }
}

export const revalidate = 3600

const categoryLabels: Record<string, string> = {
  'tournament-recap': 'Tournament Recap',
  'member-spotlight': 'Member Spotlight',
  'club-news': 'Club News',
  instruction: 'Instruction',
  announcement: 'Announcement',
}

export default async function ArticlePage({ params }: Args) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = article.category
    ? await getRelatedArticles(article.id, article.category)
    : []

  const imageUrl =
    typeof article.image === 'object' && article.image?.url
      ? article.image.url
      : 'https://images.unsplash.com/photo-1573684955725-34046d1ea9f3?w=1200&q=80'

  const authorName =
    typeof article.author === 'object' && article.author?.name
      ? article.author.name
      : 'APGC Staff'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Navigation */}
        <Link
          href="/news"
          className="inline-flex items-center mb-8 text-[#636364] hover:text-[#0b3d2e] pl-0 -ml-4 group transition-colors"
        >
          <ChevronLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to News
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          {article.category && (
            <span className="inline-block mb-4 px-4 py-1 rounded-full text-xs uppercase tracking-widest font-semibold bg-[#0b3d2e]/10 text-[#0b3d2e] border border-[#0b3d2e]/20">
              {categoryLabels[article.category] || article.category}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-[#0b3d2e] mb-4 leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl text-[#636364] font-light mb-8">{article.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-[#636364] pb-8 border-b border-[#0b3d2e]/10">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{authorName}</span>
            </div>
            {article.publishedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.publishedDate)}</span>
              </div>
            )}
            {article.readTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime} min read</span>
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-12 border border-[#0b3d2e]/10 shadow-xl">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Article Content */}
          <div className="lg:col-span-8">
            <GlassCard className="p-8 md:p-12">
              <article className="prose prose-lg max-w-none prose-headings:text-[#0b3d2e] prose-headings:font-serif prose-p:text-[#636364] prose-p:leading-relaxed prose-a:text-[#0b3d2e] prose-a:underline prose-strong:text-[#0b3d2e] prose-li:text-[#636364]">
                {article.content && <RichText data={article.content} />}
              </article>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Share */}
            <GlassCard className="p-6">
              <h3 className="text-lg text-[#0b3d2e] font-bold uppercase tracking-widest mb-4 pb-2 border-b border-[#0b3d2e]/10 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Article
              </h3>
              <div className="flex gap-3">
                <button className="flex-1 rounded-lg bg-[#1DA1F2] py-3 text-sm font-medium text-white hover:bg-[#1a91da] transition-colors">
                  Twitter
                </button>
                <button className="flex-1 rounded-lg bg-[#4267B2] py-3 text-sm font-medium text-white hover:bg-[#365899] transition-colors">
                  Facebook
                </button>
              </div>
            </GlassCard>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg text-[#0b3d2e] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-[#0b3d2e]/10">
                  Related Articles
                </h3>
                <div className="space-y-6">
                  {relatedArticles.map((related) => {
                    const relatedImageUrl =
                      typeof related.image === 'object' && related.image?.url
                        ? related.image.url
                        : null

                    return (
                      <Link
                        key={related.id}
                        href={`/news/${related.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-4">
                          {relatedImageUrl && (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={relatedImageUrl}
                                alt={related.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[#0b3d2e] font-medium text-sm line-clamp-2 group-hover:text-[#0b3d2e]/80 transition-colors">
                              {related.title}
                            </h4>
                            {related.publishedDate && (
                              <p className="text-[#636364] text-xs mt-1">
                                {new Date(related.publishedDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <Link
                  href="/news"
                  className="mt-6 flex items-center justify-center gap-2 text-[#0b3d2e] text-sm font-medium hover:text-[#0b3d2e]/80 transition-colors"
                >
                  View All News
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
