import type { News } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { Calendar, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { GlassCard } from './GlassCard'

interface NewsCardProps {
  article: News
  featured?: boolean
  className?: string
}

const categoryColors: Record<string, string> = {
  'tournament-recap': 'bg-emerald-500',
  'member-spotlight': 'bg-amber-500',
  'club-news': 'bg-blue-500',
  instruction: 'bg-purple-500',
  announcement: 'bg-rose-500',
}

const categoryLabels: Record<string, string> = {
  'tournament-recap': 'Tournament Recap',
  'member-spotlight': 'Member Spotlight',
  'club-news': 'Club News',
  instruction: 'Instruction',
  announcement: 'Announcement',
}

export function NewsCard({ article, featured = false, className }: NewsCardProps) {
  const imageUrl =
    typeof article.image === 'object' && article.image?.url ? article.image.url : '/placeholder-news.jpg'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Link href={`/news/${article.slug}`}>
      <GlassCard className={cn('overflow-hidden', className)}>
        <div className={cn('relative', featured ? 'aspect-[16/9]' : 'aspect-video')}>
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category Badge */}
          {article.category && (
            <div
              className={cn(
                'absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white',
                categoryColors[article.category] || 'bg-gray-500',
              )}
            >
              {categoryLabels[article.category] || article.category}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className={cn('font-bold text-white line-clamp-2', featured ? 'text-xl' : 'text-lg')}>
            {article.title}
          </h3>

          {article.subtitle && (
            <p className="mt-2 text-sm text-white/60 line-clamp-2">{article.subtitle}</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
            {article.publishedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(article.publishedDate)}</span>
              </div>
            )}
            {article.readTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{article.readTime}</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}
