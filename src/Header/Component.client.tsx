'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { CMSLink } from '@/components/Link'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  const navItems = data?.navItems || []

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="w-[95%] max-w-7xl mx-auto mt-6">
        <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-lg">
          <div className="md:px-6 lg:px-8 py-[6px] px-[32px] bg-white/40 backdrop-blur-lg border border-white/60 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Logo loading="eager" priority="high" className="h-12 w-auto object-contain" />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/'
                      ? 'text-[#0b3d2e] font-bold'
                      : 'text-[#0b3d2e]/70 hover:text-[#0b3d2e]'
                  }`}
                >
                  Home
                </Link>
                {/* CMS-managed nav items */}
                {navItems.map(({ link }, i) => (
                  <CMSLink
                    key={i}
                    {...link}
                    className="text-sm font-medium text-[#0b3d2e]/70 hover:text-[#0b3d2e] transition-colors"
                  />
                ))}
              </nav>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden text-[#0b3d2e] p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-4 mx-6 bg-white/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 flex flex-col gap-4 md:hidden shadow-xl">
            <Link
              href="/"
              className="text-lg font-medium text-[#0b3d2e] py-2 border-b border-[#0b3d2e]/5"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            {navItems.map(({ link }, i) => (
              <CMSLink
                key={i}
                {...link}
                className="text-lg font-medium text-[#0b3d2e] py-2 border-b border-[#0b3d2e]/5"
              />
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
