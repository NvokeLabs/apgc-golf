'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Calendar,
  Clock,
  Flag,
  ArrowUpRight,
  Plus,
  UserPlus,
  ClipboardList,
  QrCode,
} from 'lucide-react'
import './index.scss'

type DashboardMetrics = {
  totalPlayers: number
  upcomingEvents: number
  pendingRegistrations: number
  activeSponsors: number
}

type RecentActivity = {
  type: 'event-registration' | 'sponsor-registration'
  id: string
  title: string
  description: string
  timestamp: string
}

type NextEvent = {
  id: string
  title: string
  date: string
  location?: string
}

type DashboardData = {
  metrics: DashboardMetrics
  nextEvent: NextEvent | null
  recentActivity: RecentActivity[]
}

const BeforeDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <div className="before-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-header__title">Dashboard</h1>
          <p className="dashboard-header__subtitle">Loading dashboard data...</p>
        </div>
        <div className="dashboard-metrics">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="metric-card metric-card--loading">
              <div className="metric-card__skeleton" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="before-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-header__title">Dashboard</h1>
          <p className="dashboard-header__subtitle" style={{ color: 'var(--apgc-error)' }}>
            Error: {error}
          </p>
        </div>
      </div>
    )
  }

  const metrics = data?.metrics || {
    totalPlayers: 0,
    upcomingEvents: 0,
    pendingRegistrations: 0,
    activeSponsors: 0,
  }

  const metricsConfig = [
    {
      label: 'Total Players',
      value: metrics.totalPlayers,
      icon: Users,
      change: '+12%',
      trend: 'up' as const,
    },
    {
      label: 'Upcoming Events',
      value: metrics.upcomingEvents,
      icon: Calendar,
      change: data?.nextEvent ? `Next: ${data.nextEvent.title}` : 'No upcoming events',
      trend: 'neutral' as const,
    },
    {
      label: 'Pending Registrations',
      value: metrics.pendingRegistrations,
      icon: Clock,
      change: metrics.pendingRegistrations > 0 ? 'Needs attention' : 'All clear',
      trend: 'neutral' as const,
      alert: metrics.pendingRegistrations > 0,
    },
    {
      label: 'Active Sponsors',
      value: metrics.activeSponsors,
      icon: Flag,
      change: '',
      trend: 'neutral' as const,
    },
  ]

  const quickActions = [
    {
      label: 'Create Event',
      href: '/admin/collections/events/create',
      icon: Plus,
    },
    {
      label: 'Add Player',
      href: '/admin/collections/players/create',
      icon: UserPlus,
    },
    {
      label: 'View Registrations',
      href: '/admin/collections/event-registrations',
      icon: ClipboardList,
    },
    {
      label: 'Open Check-In Scanner',
      href: '/admin/check-in',
      icon: QrCode,
    },
  ]

  return (
    <div className="before-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Dashboard</h1>
        <p className="dashboard-header__subtitle">
          Welcome back! Here&apos;s what&apos;s happening with your golf events.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="dashboard-metrics">
        {metricsConfig.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-card__header">
              <span className="metric-card__label">{metric.label}</span>
              <metric.icon
                className={`metric-card__icon ${metric.alert ? 'metric-card__icon--alert' : ''}`}
              />
            </div>
            <div className="metric-card__value">{metric.value.toLocaleString()}</div>
            {metric.change && (
              <div className={`metric-card__change metric-card__change--${metric.trend}`}>
                {metric.trend === 'up' && <ArrowUpRight size={12} />}
                {metric.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard-content">
        {/* Activity Feed */}
        <div className="activity-feed">
          <h3 className="activity-feed__title">Recent Activity</h3>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <ul className="activity-feed__list">
              {data.recentActivity.map((activity) => (
                <li key={`${activity.type}-${activity.id}`} className="activity-feed__item">
                  <div className="activity-feed__icon">
                    {activity.type === 'event-registration' ? (
                      <UserPlus size={16} />
                    ) : (
                      <Flag size={16} />
                    )}
                  </div>
                  <div className="activity-feed__content">
                    <p className="activity-feed__text">{activity.description}</p>
                    <span className="activity-feed__time">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--apgc-text-muted)', fontSize: '14px' }}>
              No recent activity to show.
            </p>
          )}
        </div>

        {/* Right Column */}
        <div>
          {/* Quick Actions */}
          <div className="quick-actions">
            <h3 className="quick-actions__title">Quick Actions</h3>
            <div className="quick-actions__grid">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href} className="quick-action-btn">
                  <action.icon size={18} />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Pro Tip */}
          <div className="pro-tip">
            <h4 className="pro-tip__title">Pro Tip</h4>
            <p className="pro-tip__text">
              Use the Check-In Scanner to quickly validate tickets at your events. Simply scan the
              QR code on attendee tickets.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BeforeDashboard
