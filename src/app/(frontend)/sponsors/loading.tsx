import { GlassCard } from '@/components/golf'

function SponsorCardSkeleton() {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col items-center text-center">
        <div className="h-20 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-5 w-32 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/5" />
      </div>
    </GlassCard>
  )
}

export default function SponsorsLoading() {
  return (
    <div className="container py-16">
      {/* Header Skeleton */}
      <div className="mb-16 text-center">
        <div className="mx-auto h-12 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="mx-auto mt-4 h-6 w-96 animate-pulse rounded-lg bg-white/5" />
      </div>

      {/* Title Sponsors Skeleton */}
      <section className="mb-16">
        <div className="mb-8 mx-auto h-8 w-48 animate-pulse rounded-lg bg-amber-400/20" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(2)].map((_, i) => (
            <SponsorCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Platinum Sponsors Skeleton */}
      <section className="mb-16">
        <div className="mb-8 mx-auto h-8 w-48 animate-pulse rounded-lg bg-slate-300/20" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SponsorCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Gold Sponsors Skeleton */}
      <section>
        <div className="mb-8 mx-auto h-8 w-40 animate-pulse rounded-lg bg-amber-600/20" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <SponsorCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
