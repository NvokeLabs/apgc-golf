import { cn } from '@/utilities/ui'

interface PlayerCardSkeletonProps {
  className?: string
}

export function PlayerCardSkeleton({ className }: PlayerCardSkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[#0b3d2e]/10 bg-white/50 backdrop-blur-sm',
        className,
      )}
    >
      {/* Image skeleton */}
      <div className="aspect-[3/4] bg-gradient-to-br from-[#0b3d2e]/5 to-[#0b3d2e]/10 animate-pulse" />

      {/* Content skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="space-y-3">
          {/* Name */}
          <div className="h-6 w-3/4 bg-[#0b3d2e]/10 rounded animate-pulse" />
          {/* Country */}
          <div className="h-4 w-1/2 bg-[#0b3d2e]/10 rounded animate-pulse" />
          {/* Stats */}
          <div className="flex gap-4 pt-2">
            <div className="h-8 w-16 bg-[#0b3d2e]/10 rounded animate-pulse" />
            <div className="h-8 w-16 bg-[#0b3d2e]/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
