import { GlassCard } from '@/components/golf'

function EventCardSkeleton() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="relative aspect-video animate-pulse bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
      </div>
    </GlassCard>
  )
}

export default function EventsLoading() {
  return (
    <div className="container py-16">
      {/* Header Skeleton */}
      <div className="mb-12 text-center">
        <div className="mx-auto h-12 w-64 animate-pulse rounded-lg bg-white/10" />
        <div className="mx-auto mt-4 h-6 w-96 animate-pulse rounded-lg bg-white/5" />
      </div>

      {/* Featured Event Skeleton */}
      <section className="mb-16">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <GlassCard className="overflow-hidden">
          <div className="relative aspect-[16/9] animate-pulse bg-white/10" />
        </GlassCard>
      </section>

      {/* Upcoming Events Skeleton */}
      <section>
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
