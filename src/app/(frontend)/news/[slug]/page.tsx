import type { Metadata } from 'next'

import { GlassCard, NewsCard } from '@/components/golf'
import RichText from '@/components/RichText'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'

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
    depth: 2, // Load author and related articles
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
      : '/placeholder-news.jpg'

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
    <div className="pb-16">
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="container relative flex h-full flex-col justify-end pb-12">
          <Link
            href="/news"
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>

          {article.category && (
            <span className="mb-4 inline-block w-fit rounded-full bg-emerald-600 px-4 py-1 text-sm font-semibold text-white">
              {categoryLabels[article.category] || article.category}
            </span>
          )}

          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="mt-4 text-lg text-white/70 md:text-xl">{article.subtitle}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{authorName}</span>
            </div>
            {article.publishedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.publishedDate)}</span>
              </div>
            )}
            {article.readTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mt-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Article Content */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6 md:p-8">
              <article className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-p:text-white/80 prose-a:text-emerald-400 prose-strong:text-white">
                {article.content && <RichText data={article.content} />}
              </article>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share */}
            <GlassCard className="p-6">
              <h3 className="mb-4 font-semibold text-white">Share Article</h3>
              <div className="flex gap-3">
                <button className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Twitter
                </button>
                <button className="flex-1 rounded-lg bg-blue-800 py-2 text-sm font-medium text-white hover:bg-blue-900">
                  Facebook
                </button>
              </div>
            </GlassCard>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="mb-4 font-semibold text-white">Related Articles</h3>
                <div className="space-y-4">
                  {relatedArticles.map((related) => (
                    <NewsCard
                      key={related.id}
                      article={related}
                      className="border-0 bg-transparent"
                    />
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
