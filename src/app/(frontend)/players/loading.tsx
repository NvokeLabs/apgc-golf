import { GlassCard } from '@/components/golf'

function PlayerCardSkeleton() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="relative aspect-square animate-pulse bg-[#0b3d2e]/10" />
    </GlassCard>
  )
}

export default function PlayersLoading() {
  return (
    <div className="container py-16 bg-[#f0f7f4] min-h-screen">
      {/* Header Skeleton */}
      <div className="mb-12 text-center">
        <div className="mx-auto h-12 w-48 animate-pulse rounded-lg bg-[#0b3d2e]/10" />
        <div className="mx-auto mt-4 h-6 w-96 animate-pulse rounded-lg bg-[#0b3d2e]/5" />
      </div>

      {/* Featured Players Skeleton */}
      <section className="mb-16">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-[#0b3d2e]/10" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <PlayerCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* All Players Skeleton */}
      <section>
        <div className="mb-6 h-8 w-32 animate-pulse rounded-lg bg-[#0b3d2e]/10" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <PlayerCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
