import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { Linkedin, Instagram, Facebook, Youtube } from 'lucide-react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-[#0b3d2e]/10 bg-[#0b3d2e] py-16">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/">
              <img
                src="/apgc-logo-horizontal-footer.png"
                alt="APGC Golf Logo"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-white/50 text-sm text-center md:text-left max-w-xs">
              Excellence in every swing. Tradition meets championship golf.
            </p>
          </div>

          {/* Quick Links & Social Media Combined */}
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-end gap-20">
            {/* Quick Links */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                Quick Links
              </h3>
              <div className="flex flex-col gap-3 items-center md:items-start">
                <Link
                  href="/events"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Events
                </Link>
                <Link
                  href="/players"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Players
                </Link>
                <Link
                  href="/sponsors"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Sponsors
                </Link>
                {navItems.map(({ link }, i) => (
                  <CMSLink
                    key={i}
                    {...link}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  />
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                Follow Us
              </h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="p-2.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2025 APGC Alumni Polinema Golf Club. All rights reserved.
          </p>
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
