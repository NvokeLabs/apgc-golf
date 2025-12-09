'use client'

import { cn } from '@/utilities/ui'
import React from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
}

export function GlassCard({
  children,
  className,
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[#0b3d2e]/10 bg-white/60 backdrop-blur-xl shadow-sm',
        hoverEffect &&
          'transition-all duration-300 hover:bg-white/80 hover:scale-[1.02] hover:shadow-md cursor-pointer',
        className,
      )}
      {...props}
    >
      {/* Frosted glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
