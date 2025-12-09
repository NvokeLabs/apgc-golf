import { GlassCard } from '@/components/golf'

function NewsCardSkeleton() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="relative aspect-video animate-pulse bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-full animate-pulse rounded bg-white/10" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
        <div className="flex gap-4">
          <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </GlassCard>
  )
}

export default function NewsLoading() {
  return (
    <div className="container py-16">
      {/* Header Skeleton */}
      <div className="mb-12 text-center">
        <div className="mx-auto h-12 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="mx-auto mt-4 h-6 w-80 animate-pulse rounded-lg bg-white/5" />
      </div>

      {/* Featured Article Skeleton */}
      <section className="mb-16">
        <GlassCard className="overflow-hidden">
          <div className="relative aspect-[16/9] animate-pulse bg-white/10" />
        </GlassCard>
      </section>

      {/* Articles Grid Skeleton */}
      <section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
