import { GlassCard } from '@/components/golf'

export default function HomeLoading() {
  return (
    <div className="pt-28 bg-[#f0f7f4]">
      {/* Hero Skeleton */}
      <section className="relative min-h-[90vh] flex items-center bg-[#f0f7f4]">
        <div className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-10">
            {/* Left Content */}
            <div className="max-w-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-[#0b3d2e]/30" />
                <div className="h-6 w-40 animate-pulse rounded bg-[#0b3d2e]/10" />
              </div>
              <div className="h-20 w-3/4 animate-pulse rounded-lg bg-[#0b3d2e]/10 mb-4" />
              <div className="h-16 w-2/3 animate-pulse rounded-lg bg-[#0b3d2e]/10 mb-8" />
              <div className="h-6 w-full animate-pulse rounded bg-[#0b3d2e]/5" />
              <div className="mt-2 h-6 w-2/3 animate-pulse rounded bg-[#0b3d2e]/5" />
            </div>

            {/* Right Content - Card Skeleton */}
            <div className="hidden lg:block">
              <div className="bg-white backdrop-blur-xl rounded-lg overflow-hidden max-w-3xl mx-auto shadow-2xl flex h-96 border border-[#0b3d2e]/10">
                <div className="w-2/5 animate-pulse bg-[#0b3d2e]/5" />
                <div className="flex-1 p-8">
                  <div className="h-8 w-3/4 animate-pulse rounded bg-[#0b3d2e]/10 mb-6" />
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full animate-pulse bg-[#0b3d2e]/10" />
                        <div className="flex-1">
                          <div className="h-3 w-16 animate-pulse rounded bg-[#0b3d2e]/10 mb-2" />
                          <div className="h-5 w-32 animate-pulse rounded bg-[#0b3d2e]/15" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-8">
                    <div className="h-14 w-full animate-pulse rounded bg-[#0b3d2e]/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Schedule Skeleton */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#0b3d2e]/30 animate-pulse" />
              <div className="h-4 w-32 animate-pulse rounded bg-[#0b3d2e]/10" />
            </div>
            <div className="h-12 w-80 animate-pulse rounded-lg bg-[#0b3d2e]/10 mb-2" />
            <div className="h-6 w-64 animate-pulse rounded bg-[#0b3d2e]/5" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[...Array(2)].map((_, i) => (
              <GlassCard key={i} className="p-0 overflow-hidden">
                <div className="h-64 animate-pulse bg-[#0b3d2e]/10" />
                <div className="p-6">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-[#0b3d2e]/10 mb-4" />
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-4 w-40 animate-pulse rounded bg-[#0b3d2e]/5" />
                    ))}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <GlassCard key={i} className="p-6">
                <div className="h-4 w-20 animate-pulse rounded bg-[#0b3d2e]/10 mb-2" />
                <div className="h-6 w-24 animate-pulse rounded bg-[#0b3d2e]/10 mb-4" />
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-4 w-full animate-pulse rounded bg-[#0b3d2e]/5" />
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Skeleton */}
      <section className="py-12">
        <div className="container mx-auto px-6 mb-8">
          <div className="h-4 w-32 mx-auto animate-pulse rounded bg-[#0b3d2e]/10" />
        </div>
        <div className="flex gap-16 justify-center overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-32 animate-pulse rounded bg-[#0b3d2e]/10" />
          ))}
        </div>
      </section>

      {/* Featured Players Skeleton */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <div className="h-10 w-52 animate-pulse rounded-lg bg-[#0b3d2e]/10 mb-4" />
            <div className="h-5 w-72 animate-pulse rounded bg-[#0b3d2e]/5" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <GlassCard key={i} className="p-0 overflow-hidden">
                <div className="h-64 animate-pulse bg-[#0b3d2e]/10" />
                <div className="p-4 grid grid-cols-2 gap-4">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="text-center">
                      <div className="h-5 w-12 mx-auto animate-pulse rounded bg-[#0b3d2e]/10 mb-1" />
                      <div className="h-3 w-16 mx-auto animate-pulse rounded bg-[#0b3d2e]/5" />
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* News Skeleton */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <div className="h-10 w-40 animate-pulse rounded-lg bg-[#0b3d2e]/10 mb-4" />
            <div className="h-5 w-64 animate-pulse rounded bg-[#0b3d2e]/5" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <div className="h-48 animate-pulse bg-[#0b3d2e]/10" />
                <div className="p-6">
                  <div className="h-3 w-20 animate-pulse rounded bg-[#0b3d2e]/10 mb-2" />
                  <div className="h-6 w-full animate-pulse rounded bg-[#0b3d2e]/10 mb-2" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-[#0b3d2e]/10 mb-4" />
                  <div className="h-4 w-24 animate-pulse rounded bg-[#0b3d2e]/5" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
