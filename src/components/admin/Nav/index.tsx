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
  Globe,
  Ticket,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  Trophy,
  UserCircle,
  Handshake,
  Layers,
  ClipboardList,
  Megaphone,
  Home,
  LayoutTemplate,
  Tag,
  Type,
  QrCode,
  Banknote,
  Gift,
} from 'lucide-react'
import { useAuth } from '@payloadcms/ui'
import { visibleMenuGroups, type MenuGroup } from './visibleMenuGroups'
import { isRegistrationStaff } from '@/access/roles'
import './styles.scss'

const menuGroups: MenuGroup[] = [
  {
    label: 'Golf Content',
    id: 'golf-content',
    defaultOpen: true,
    items: [
      { name: 'Events', href: '/admin/collections/events', icon: Calendar },
      { name: 'Players', href: '/admin/collections/players', icon: UserCircle },
      { name: 'Sponsors', href: '/admin/collections/sponsors', icon: Handshake },
      {
        name: 'Sponsorship Tiers',
        href: '/admin/collections/sponsorship-tiers',
        icon: Layers,
      },
      { name: 'News', href: '/admin/collections/news', icon: Newspaper },
    ],
  },
  {
    label: 'Registrations',
    id: 'registrations',
    defaultOpen: true,
    items: [
      {
        name: 'Event Registrations',
        href: '/admin/collections/event-registrations',
        icon: ClipboardList,
      },
      {
        name: 'Sponsor Registrations',
        href: '/admin/collections/sponsor-registrations',
        icon: Megaphone,
      },
      { name: 'Tickets', href: '/admin/collections/tickets', icon: Ticket },
      { name: 'Sponsor Tickets', href: '/admin/sponsor-tickets', icon: Gift },
      { name: 'Manual Transfers', href: '/admin/manual-transfers', icon: Banknote },
      { name: 'Check-In Scanner', href: '/admin/check-in', icon: QrCode },
    ],
  },
  {
    label: 'Website Content',
    id: 'website-content',
    defaultOpen: false,
    items: [
      { name: 'Home Page', href: '/admin/globals/home-page', icon: Home },
      { name: 'Sponsors Page', href: '/admin/globals/sponsors-page', icon: Trophy },
      { name: 'Site Labels', href: '/admin/globals/site-labels', icon: Tag },
      { name: 'Form Content', href: '/admin/globals/form-content', icon: Type },
      { name: 'Pages', href: '/admin/collections/pages', icon: FileText },
      { name: 'Posts', href: '/admin/collections/posts', icon: LayoutTemplate },
      { name: 'Header', href: '/admin/globals/header', icon: Globe },
      { name: 'Footer', href: '/admin/globals/footer', icon: Globe },
    ],
  },
  {
    label: 'Settings',
    id: 'settings',
    defaultOpen: false,
    items: [
      { name: 'Media', href: '/admin/collections/media', icon: Image },
      { name: 'Categories', href: '/admin/collections/categories', icon: Tag },
      { name: 'Users', href: '/admin/collections/users', icon: Users },
    ],
  },
]

export function Nav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const groups = visibleMenuGroups(menuGroups, (user as { role?: string | null } | null)?.role)
  // Registration-staff get only the whitelisted tools — no stats Dashboard
  // (its API 403s for them anyway; hide the link so the UI matches).
  const staffOnly = isRegistrationStaff(user)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    groups.forEach((group) => {
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
        {/* Dashboard Link (hidden for registration-staff) */}
        {!staffOnly && (
          <Link
            href="/admin"
            className={`apgc-nav__link apgc-nav__link--standalone ${isDashboardActive ? 'apgc-nav__link--active' : ''}`}
          >
            {isDashboardActive && <span className="apgc-nav__active-indicator" />}
            <LayoutDashboard className="apgc-nav__icon" />
            <span>Dashboard</span>
          </Link>
        )}

        {/* Menu Groups */}
        {groups.map((group) => (
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
