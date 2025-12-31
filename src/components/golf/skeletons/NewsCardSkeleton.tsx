import { cn } from '@/utilities/ui'

interface NewsCardSkeletonProps {
  className?: string
}

export function NewsCardSkeleton({ className }: NewsCardSkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[#0b3d2e]/10 bg-white/50 backdrop-blur-sm',
        className,
      )}
    >
      {/* Image skeleton */}
      <div className="aspect-video bg-gradient-to-br from-[#0b3d2e]/5 to-[#0b3d2e]/10 animate-pulse" />

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Category */}
        <div className="h-5 w-24 bg-[#0b3d2e]/10 rounded-full animate-pulse" />
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-[#0b3d2e]/10 rounded animate-pulse" />
          <div className="h-5 w-3/4 bg-[#0b3d2e]/10 rounded animate-pulse" />
        </div>
        {/* Meta */}
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-[#0b3d2e]/10 rounded animate-pulse" />
          <div className="h-4 w-16 bg-[#0b3d2e]/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
