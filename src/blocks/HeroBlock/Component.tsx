'use client'

import type { HeroBlock as HeroBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & HeroBlockProps

const overlayClasses: Record<string, string> = {
  light: 'from-[#0b3d2e]/60 via-[#0b3d2e]/30 to-transparent',
  medium: 'from-[#0b3d2e]/80 via-[#0b3d2e]/50 to-transparent',
  dark: 'from-[#0b3d2e]/95 via-[#0b3d2e]/70 to-transparent',
}

export const HeroBlockComponent: React.FC<Props> = ({
  className,
  title,
  titleHighlight,
  subtitle,
  backgroundImage,
  ctaButton,
  secondaryButton,
  overlayOpacity = 'medium',
}) => {
  const imageUrl =
    typeof backgroundImage === 'object' && backgroundImage?.url
      ? backgroundImage.url
      : '/hero/hero-banner.png'

  return (
    <section className={cn('relative min-h-[80vh] flex items-center', className)}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={title || 'Hero background'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r',
            overlayClasses[overlayOpacity || 'medium'],
          )}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {title}
            {titleHighlight && (
              <>
                {' '}
                <span className="font-serif italic font-medium">{titleHighlight}</span>
              </>
            )}
          </h1>

          {subtitle && (
            <p className="text-xl md:text-2xl text-white/80 mb-10 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            {ctaButton?.label && ctaButton?.link && (
              <Link
                href={ctaButton.link}
                className="inline-flex items-center gap-2 bg-white text-[#0b3d2e] px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
              >
                {ctaButton.label}
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}

            {secondaryButton?.label && secondaryButton?.link && (
              <Link
                href={secondaryButton.link}
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                <Play className="w-5 h-5" />
                {secondaryButton.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
