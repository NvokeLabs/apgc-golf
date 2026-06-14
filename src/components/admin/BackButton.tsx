'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

// Auth/utility routes that shouldn't show a back affordance.
const NO_BACK = new Set([
  'login',
  'logout',
  'create-first-user',
  'forgot',
  'reset',
  'verify',
  'unauthorized',
])

function resolveBack(pathname: string | null): { href: string; label: string } | null {
  if (!pathname) return null
  const clean = pathname.replace(/\/+$/, '')
  if (clean === '/admin' || clean === '') return null

  const parts = clean.split('/').filter(Boolean) // ['admin', 'collections', 'players', '123']
  if (parts.some((p) => NO_BACK.has(p))) return null

  // Collection edit/create (/admin/collections/{slug}/{id|create}) → back to the list.
  if (parts[1] === 'collections' && parts.length >= 4) {
    return { href: `/admin/collections/${parts[2]}`, label: 'Back to list' }
  }

  // Collection list, global, or any other inner page → back to the dashboard.
  return { href: '/admin', label: 'Back to dashboard' }
}

const BackButton: React.FC = () => {
  const pathname = usePathname()
  const back = resolveBack(pathname)
  if (!back) return null

  // Payload renders `admin.components.header` as a sibling ABOVE the nav+content
  // block with no wrapper, so any in-flow element shoves the sidebar down.
  // Position fixed → out of flow (sidebar stays put) while floating at the top
  // of the content area (right of the 256px sidebar).
  return (
    <div className="apgc-admin" style={{ position: 'fixed', top: 14, left: 284, zIndex: 30 }}>
      <Link
        href={back.href}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
      >
        <ChevronLeft className="h-4 w-4" />
        {back.label}
      </Link>
    </div>
  )
}

export default BackButton
