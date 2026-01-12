'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Calendar,
  Users,
  Image,
  MessageSquare,
  Database,
  Globe,
  Shuffle,
  Flag,
  Ticket,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react'
import './styles.scss'

interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
}

interface MenuGroup {
  label: string
  id: string
  items: MenuItem[]
  defaultOpen?: boolean
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Content',
    id: 'content',
    defaultOpen: true,
    items: [
      { name: 'Pages', href: '/admin/collections/pages', icon: FileText },
      { name: 'Posts', href: '/admin/collections/posts', icon: FileText },
      { name: 'News', href: '/admin/collections/news', icon: Newspaper },
      { name: 'Events', href: '/admin/collections/events', icon: Calendar },
      { name: 'Players', href: '/admin/collections/players', icon: Users },
      { name: 'Sponsors', href: '/admin/collections/sponsors', icon: Flag },
    ],
  },
  {
    label: 'Workflow',
    id: 'workflow',
    defaultOpen: true,
    items: [
      {
        name: 'Event Registrations',
        href: '/admin/collections/event-registrations',
        icon: Database,
      },
      {
        name: 'Sponsor Registrations',
        href: '/admin/collections/sponsor-registrations',
        icon: Database,
      },
      { name: 'Tickets', href: '/admin/collections/tickets', icon: Ticket },
    ],
  },
  {
    label: 'Settings',
    id: 'settings',
    defaultOpen: false,
    items: [
      { name: 'Categories', href: '/admin/collections/categories', icon: Shuffle },
      { name: 'Media', href: '/admin/collections/media', icon: Image },
      { name: 'Users', href: '/admin/collections/users', icon: Users },
      { name: 'Header', href: '/admin/globals/header', icon: Globe },
      { name: 'Footer', href: '/admin/globals/footer', icon: Globe },
    ],
  },
]

export function Nav() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    menuGroups.forEach((group) => {
      initial[group.id] = group.defaultOpen ?? true
    })
    return initial
  })

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const isDashboardActive = pathname === '/admin' || pathname === '/admin/'

  return (
    <nav className="apgc-nav">
      {/* Logo Header */}
      <div className="apgc-nav__header">
        <Link href="/admin" className="apgc-nav__logo">
          <NextImage
            src="/apgc-logo-horizontal-footer.png"
            alt="APGC Logo"
            width={140}
            height={40}
            className="apgc-nav__logo-image"
          />
        </Link>
        <span className="apgc-nav__env-badge">Production</span>
      </div>

      {/* Navigation Content */}
      <div className="apgc-nav__content">
        {/* Dashboard Link */}
        <Link
          href="/admin"
          className={`apgc-nav__link apgc-nav__link--standalone ${isDashboardActive ? 'apgc-nav__link--active' : ''}`}
        >
          {isDashboardActive && <span className="apgc-nav__active-indicator" />}
          <LayoutDashboard className="apgc-nav__icon" />
          <span>Dashboard</span>
        </Link>

        {/* Check-In Scanner Link */}
        <Link
          href="/admin/check-in"
          className={`apgc-nav__link apgc-nav__link--standalone ${isActive('/admin/check-in') ? 'apgc-nav__link--active' : ''}`}
        >
          {isActive('/admin/check-in') && <span className="apgc-nav__active-indicator" />}
          <Ticket className="apgc-nav__icon" />
          <span>Check-In Scanner</span>
        </Link>

        {/* Menu Groups */}
        {menuGroups.map((group) => (
          <div key={group.id} className="apgc-nav__group">
            <button
              className="apgc-nav__group-toggle"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={openGroups[group.id]}
            >
              <span className="apgc-nav__group-label">{group.label}</span>
              {openGroups[group.id] ? (
                <ChevronDown className="apgc-nav__chevron" />
              ) : (
                <ChevronRight className="apgc-nav__chevron" />
              )}
            </button>

            {openGroups[group.id] && (
              <div className="apgc-nav__group-items">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`apgc-nav__link ${active ? 'apgc-nav__link--active' : ''}`}
                    >
                      {active && <span className="apgc-nav__active-indicator" />}
                      <Icon className="apgc-nav__icon" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="apgc-nav__footer">
        <Link href="/admin/account" className="apgc-nav__footer-link">
          <User className="apgc-nav__icon" />
          <span>Account</span>
        </Link>
        <Link href="/admin/logout" className="apgc-nav__footer-link">
          <LogOut className="apgc-nav__icon" />
          <span>Logout</span>
        </Link>
      </div>
    </nav>
  )
}

export default Nav
