'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useDocumentInfo } from '@payloadcms/ui'
import {
  Ticket,
  Calendar,
  User,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import './TicketEditView.scss'

type TicketData = {
  id: string
  ticketCode: string
  status: 'pending' | 'checked_in' | 'cancelled'
  checkedInAt: string | null
  qrCodeData: string | null
  createdAt: string
  updatedAt: string
  event: {
    id: string
    title: string
    date?: string
    location?: string
  } | null
  registration: {
    id: string
    playerName?: string
    email?: string
    phone?: string
    status?: string
  } | null
  checkedInBy: {
    id: string
    email: string
    name?: string
  } | null
}

export function TicketEditView() {
  const { id: ticketId } = useDocumentInfo()
  const router = useRouter()
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) {
        setLoading(false)
        setError('No ticket ID provided')
        return
      }

      try {
        const response = await fetch(`/api/tickets/${ticketId}?depth=2`)
        if (!response.ok) {
          throw new Error('Failed to fetch ticket')
        }
        const data = await response.json()
        setTicket(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTicket()
  }, [ticketId])

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'checked_in':
        return {
          icon: CheckCircle,
          label: 'Checked In',
          variant: 'success' as const,
          className: 'ticket-status--success',
        }
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Cancelled',
          variant: 'error' as const,
          className: 'ticket-status--error',
        }
      default:
        return {
          icon: Clock,
          label: 'Pending',
          variant: 'warning' as const,
          className: 'ticket-status--warning',
        }
    }
  }

  if (loading) {
    return (
      <div className="ticket-edit-view">
        <div className="ticket-edit-view__loading">
          <div className="ticket-edit-view__loading-spinner" />
          <p>Loading ticket details...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="ticket-edit-view">
        <div className="ticket-edit-view__error">
          <AlertCircle size={48} />
          <h2>Error Loading Ticket</h2>
          <p>{error || 'Ticket not found'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft size={16} />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(ticket.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="ticket-edit-view">
      {/* Header */}
      <div className="ticket-edit-view__header">
        <div className="ticket-edit-view__header-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/collections/tickets')}
            className="ticket-edit-view__back-btn"
          >
            <ArrowLeft size={16} />
            Back to Tickets
          </Button>
          <div className="ticket-edit-view__title-group">
            <h1 className="ticket-edit-view__title">
              <Ticket size={28} className="ticket-edit-view__title-icon" />
              Ticket Details
            </h1>
            <span className="ticket-edit-view__subtitle">
              View ticket information and check-in status
            </span>
          </div>
        </div>
        <div className="ticket-edit-view__header-actions">
          <Link href="/admin/check-in">
            <Button className="ticket-edit-view__scanner-btn">
              <QrCode size={18} />
              Open Scanner
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ticket-edit-view__content">
        {/* Left Column - Ticket Card */}
        <div className="ticket-edit-view__main">
          {/* Ticket Card */}
          <div className="ticket-card">
            <div className="ticket-card__header">
              <div className="ticket-card__badge-container">
                <Badge variant={statusConfig.variant} className="ticket-card__status-badge">
                  <StatusIcon size={14} />
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="ticket-card__logo">
                <Image
                  src="/apgc-logo-horizontal-footer.png"
                  alt="APGC"
                  width={100}
                  height={30}
                  className="ticket-card__logo-img"
                />
              </div>
            </div>

            <div className="ticket-card__body">
              {/* QR Code */}
              <div className="ticket-card__qr-section">
                {ticket.qrCodeData ? (
                  <div className="ticket-card__qr-wrapper">
                    <img
                      src={ticket.qrCodeData}
                      alt="Ticket QR Code"
                      className="ticket-card__qr-image"
                    />
                  </div>
                ) : (
                  <div className="ticket-card__qr-placeholder">
                    <QrCode size={64} />
                    <span>QR Code Unavailable</span>
                  </div>
                )}
              </div>

              {/* Ticket Code */}
              <div className="ticket-card__code-section">
                <span className="ticket-card__code-label">Ticket Code</span>
                <div className="ticket-card__code-value">
                  <code>{ticket.ticketCode}</code>
                  <button
                    onClick={() => copyToClipboard(ticket.ticketCode)}
                    className="ticket-card__copy-btn"
                    title="Copy ticket code"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="ticket-card__divider">
                <div className="ticket-card__divider-notch ticket-card__divider-notch--left" />
                <div className="ticket-card__divider-line" />
                <div className="ticket-card__divider-notch ticket-card__divider-notch--right" />
              </div>

              {/* Event Info */}
              <div className="ticket-card__event-section">
                <h3 className="ticket-card__event-title">{ticket.event?.title || 'Event'}</h3>
                {ticket.event?.date && (
                  <div className="ticket-card__event-meta">
                    <Calendar size={14} />
                    <span>{formatShortDate(ticket.event.date)}</span>
                  </div>
                )}
                {ticket.event?.location && (
                  <div className="ticket-card__event-meta">
                    <MapPin size={14} />
                    <span>{ticket.event.location}</span>
                  </div>
                )}
              </div>

              {/* Attendee Info */}
              <div className="ticket-card__attendee-section">
                <div className="ticket-card__attendee-item">
                  <User size={16} className="ticket-card__attendee-icon" />
                  <div>
                    <span className="ticket-card__attendee-label">Attendee</span>
                    <span className="ticket-card__attendee-value">
                      {ticket.registration?.playerName || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="ticket-card__attendee-item">
                  <Mail size={16} className="ticket-card__attendee-icon" />
                  <div>
                    <span className="ticket-card__attendee-label">Email</span>
                    <span className="ticket-card__attendee-value">
                      {ticket.registration?.email || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="ticket-edit-view__sidebar">
          {/* Status Card */}
          <div className="info-card">
            <h3 className="info-card__title">
              <StatusIcon size={18} className={statusConfig.className} />
              Check-in Status
            </h3>
            <div className="info-card__content">
              <div className={`status-display ${statusConfig.className}`}>
                <StatusIcon size={24} />
                <span>{statusConfig.label}</span>
              </div>
              {ticket.status === 'checked_in' && ticket.checkedInAt && (
                <div className="info-card__detail">
                  <span className="info-card__detail-label">Checked in at</span>
                  <span className="info-card__detail-value">{formatDate(ticket.checkedInAt)}</span>
                </div>
              )}
              {ticket.checkedInBy && (
                <div className="info-card__detail">
                  <span className="info-card__detail-label">Checked in by</span>
                  <span className="info-card__detail-value">
                    {ticket.checkedInBy.name || ticket.checkedInBy.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Event Details Card */}
          <div className="info-card">
            <h3 className="info-card__title">
              <Calendar size={18} />
              Event Details
            </h3>
            <div className="info-card__content">
              <div className="info-card__detail">
                <span className="info-card__detail-label">Event</span>
                <span className="info-card__detail-value">{ticket.event?.title || 'N/A'}</span>
              </div>
              {ticket.event?.date && (
                <div className="info-card__detail">
                  <span className="info-card__detail-label">Date</span>
                  <span className="info-card__detail-value">
                    {formatShortDate(ticket.event.date)}
                  </span>
                </div>
              )}
              {ticket.event?.id && (
                <Link
                  href={`/admin/collections/events/${ticket.event.id}`}
                  className="info-card__link"
                >
                  <ExternalLink size={14} />
                  View Event
                </Link>
              )}
            </div>
          </div>

          {/* Registration Details Card */}
          <div className="info-card">
            <h3 className="info-card__title">
              <User size={18} />
              Registration Details
            </h3>
            <div className="info-card__content">
              <div className="info-card__detail">
                <span className="info-card__detail-label">Name</span>
                <span className="info-card__detail-value">
                  {ticket.registration?.playerName || 'N/A'}
                </span>
              </div>
              <div className="info-card__detail">
                <span className="info-card__detail-label">Email</span>
                <span className="info-card__detail-value">
                  {ticket.registration?.email || 'N/A'}
                </span>
              </div>
              {ticket.registration?.phone && (
                <div className="info-card__detail">
                  <span className="info-card__detail-label">Phone</span>
                  <span className="info-card__detail-value">{ticket.registration.phone}</span>
                </div>
              )}
              {ticket.registration?.id && (
                <Link
                  href={`/admin/collections/event-registrations/${ticket.registration.id}`}
                  className="info-card__link"
                >
                  <ExternalLink size={14} />
                  View Registration
                </Link>
              )}
            </div>
          </div>

          {/* Meta Info Card */}
          <div className="info-card info-card--muted">
            <h3 className="info-card__title">
              <Clock size={18} />
              Record Info
            </h3>
            <div className="info-card__content">
              <div className="info-card__detail">
                <span className="info-card__detail-label">Created</span>
                <span className="info-card__detail-value">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="info-card__detail">
                <span className="info-card__detail-label">Last Updated</span>
                <span className="info-card__detail-value">{formatDate(ticket.updatedAt)}</span>
              </div>
              <div className="info-card__detail">
                <span className="info-card__detail-label">ID</span>
                <code className="info-card__code">{ticket.id}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketEditView
