import { cn } from '@/utilities/ui'
import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md',
        'shadow-lg shadow-black/5',
        hover && 'transition-all duration-300 hover:bg-white/10 hover:shadow-xl hover:shadow-black/10',
        className,
      )}
    >
      {children}
    </div>
  )
}
