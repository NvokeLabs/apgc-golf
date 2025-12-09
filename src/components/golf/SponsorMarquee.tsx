'use client'

import type { Sponsor } from '@/payload-types'

import Image from 'next/image'

interface SponsorMarqueeProps {
  sponsors: Sponsor[]
}

export function SponsorMarquee({ sponsors }: SponsorMarqueeProps) {
  // Duplicate sponsors for seamless loop
  const duplicatedSponsors = [...sponsors, ...sponsors]

  return (
    <div className="relative overflow-hidden">
      {/* Gradient masks */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-black to-transparent" />

      {/* Marquee container */}
      <div className="flex animate-marquee hover:[animation-play-state:paused]">
        {duplicatedSponsors.map((sponsor, index) => {
          const logoUrl =
            typeof sponsor.logo === 'object' && sponsor.logo?.url
              ? sponsor.logo.url
              : '/placeholder-sponsor.png'

          return (
            <div
              key={`${sponsor.id}-${index}`}
              className="mx-8 flex flex-shrink-0 items-center justify-center"
            >
              {sponsor.website ? (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-60 transition-opacity hover:opacity-100"
                >
                  <div className="relative h-16 w-32">
                    <Image
                      src={logoUrl}
                      alt={sponsor.name}
                      fill
                      className="object-contain grayscale hover:grayscale-0 transition-all"
                      sizes="128px"
                    />
                  </div>
                </a>
              ) : (
                <div className="relative h-16 w-32 opacity-60">
                  <Image
                    src={logoUrl}
                    alt={sponsor.name}
                    fill
                    className="object-contain grayscale"
                    sizes="128px"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
