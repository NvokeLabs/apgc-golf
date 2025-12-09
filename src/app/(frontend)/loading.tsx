import { GlassCard } from '@/components/golf'

export default function HomeLoading() {
  return (
    <div>
      {/* Hero Skeleton */}
      <section className="relative min-h-[80vh] flex items-center bg-black/50">
        <div className="container py-20">
          <div className="max-w-2xl">
            <div className="h-16 w-3/4 animate-pulse rounded-lg bg-white/10" />
            <div className="mt-6 h-6 w-full animate-pulse rounded-lg bg-white/5" />
            <div className="mt-2 h-6 w-2/3 animate-pulse rounded-lg bg-white/5" />
            <div className="mt-8 flex gap-4">
              <div className="h-12 w-36 animate-pulse rounded-lg bg-emerald-600/30" />
              <div className="h-12 w-40 animate-pulse rounded-lg bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Skeleton */}
      <section className="border-y border-white/10 bg-black/50 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-emerald-400/20" />
                <div className="mx-auto mt-2 h-8 w-20 animate-pulse rounded bg-white/10" />
                <div className="mx-auto mt-1 h-4 w-28 animate-pulse rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Event Skeleton */}
      <section className="py-20">
        <div className="container">
          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-5 w-64 animate-pulse rounded bg-white/5" />
          </div>
          <GlassCard className="overflow-hidden">
            <div className="aspect-[16/9] animate-pulse bg-white/10" />
          </GlassCard>
        </div>
      </section>

      {/* Featured Players Skeleton */}
      <section className="py-20">
        <div className="container">
          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-5 w-56 animate-pulse rounded bg-white/5" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <div className="aspect-[3/4] animate-pulse bg-white/10" />
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
