import type { Event } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { CalendarDays, MapPin, Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { GlassCard } from './GlassCard'

interface EventCardProps {
  event: Event
  featured?: boolean
  className?: string
}

const tierColors = {
  major: 'bg-amber-500',
  championship: 'bg-emerald-600',
  qualifier: 'bg-blue-500',
}

const tierLabels = {
  major: 'Major',
  championship: 'Championship',
  qualifier: 'Qualifier',
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-500',
  open: 'bg-emerald-500',
  'sold-out': 'bg-orange-500',
  closed: 'bg-gray-500',
  completed: 'bg-purple-500',
}

const statusLabels: Record<string, string> = {
  upcoming: 'Upcoming',
  open: 'Registration Open',
  'sold-out': 'Sold Out',
  closed: 'Registration Closed',
  completed: 'Completed',
}

export function EventCard({ event, featured = false, className }: EventCardProps) {
  const imageUrl =
    typeof event.image === 'object' && event.image?.url ? event.image.url : '/placeholder-event.jpg'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Link href={`/events/${event.slug}`}>
      <GlassCard className={cn('overflow-hidden', className)}>
        <div className={cn('relative', featured ? 'aspect-[16/9]' : 'aspect-video')}>
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Tier Badge */}
          <div
            className={cn(
              'absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white',
              tierColors[event.tier],
            )}
          >
            {tierLabels[event.tier]}
          </div>

          {/* Status Badge */}
          {event.status && (
            <div
              className={cn(
                'absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white',
                statusColors[event.status],
              )}
            >
              {statusLabels[event.status]}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className={cn('font-bold text-white', featured ? 'text-xl' : 'text-lg')}>{event.title}</h3>

          <div className="mt-3 space-y-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-400" />
              <span>
                {formatDate(event.date)}
                {event.endDate && ` - ${formatDate(event.endDate)}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>{event.location}</span>
            </div>
            {event.prizeFund && (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-amber-400">{event.prizeFund}</span>
              </div>
            )}
          </div>

          {event.price && (
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-white/50">Registration</span>
              <span className="font-semibold text-emerald-400">{formatPrice(event.price)}</span>
            </div>
          )}
        </div>
      </GlassCard>
    </Link>
  )
}
