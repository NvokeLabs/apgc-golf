import { cn } from '@/utilities/ui'

interface EventCardSkeletonProps {
  className?: string
}

export function EventCardSkeleton({ className }: EventCardSkeletonProps) {
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
        {/* Badge */}
        <div className="h-5 w-20 bg-[#0b3d2e]/10 rounded-full animate-pulse" />
        {/* Title */}
        <div className="h-6 w-full bg-[#0b3d2e]/10 rounded animate-pulse" />
        {/* Date & Location */}
        <div className="space-y-2">
          <div className="h-4 w-2/3 bg-[#0b3d2e]/10 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-[#0b3d2e]/10 rounded animate-pulse" />
        </div>
        {/* Price */}
        <div className="h-8 w-1/3 bg-[#0b3d2e]/10 rounded animate-pulse" />
      </div>
    </div>
  )
}
