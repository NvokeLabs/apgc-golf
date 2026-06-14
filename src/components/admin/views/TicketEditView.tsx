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
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
          className: 'text-green-600',
        }
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Cancelled',
          variant: 'error' as const,
          className: 'text-red-600',
        }
      default:
        return {
          icon: Clock,
          label: 'Pending',
          variant: 'warning' as const,
          className: 'text-amber-600',
        }
    }
  }

  if (loading) {
    return (
      <div className="apgc-admin">
        <div className="flex flex-col items-center justify-center gap-4 p-24 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p>Loading ticket details...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="apgc-admin">
        <div className="flex flex-col items-center justify-center gap-4 p-24 text-center">
          <AlertCircle size={48} className="text-destructive" />
          <h2 className="text-xl font-semibold text-primary">Error Loading Ticket</h2>
          <p className="text-muted-foreground">{error || 'Ticket not found'}</p>
          <Button onClick={() => router.back()} className="gap-2">
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
    <div className="apgc-admin">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/collections/tickets')}
              className="w-fit gap-2 text-muted-foreground"
            >
              <ArrowLeft size={16} />
              Back to Tickets
            </Button>
            <div className="flex flex-col">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Ticket size={28} className="text-accent" />
                Ticket Details
              </h1>
              <span className="text-sm text-muted-foreground">
                View ticket information and check-in status
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/admin/check-in">
                <QrCode size={18} />
                Open Scanner
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Ticket Card */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between bg-primary p-4">
                <Badge variant={statusConfig.variant} className="gap-1">
                  <StatusIcon size={14} />
                  {statusConfig.label}
                </Badge>
                <Image
                  src="/apgc-logo-horizontal-footer.png"
                  alt="APGC"
                  width={100}
                  height={30}
                  className="h-auto w-[100px] brightness-0 invert"
                />
              </div>

              <CardContent className="flex flex-col gap-5 p-6">
                {/* QR Code */}
                <div className="flex justify-center">
                  {ticket.qrCodeData ? (
                    <div className="rounded-lg border bg-white p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ticket.qrCodeData} alt="Ticket QR Code" className="h-40 w-40" />
                    </div>
                  ) : (
                    <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                      <QrCode size={64} />
                      <span className="text-xs">QR Code Unavailable</span>
                    </div>
                  )}
                </div>

                {/* Ticket Code */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Ticket Code
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm font-semibold text-primary">
                      {ticket.ticketCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(ticket.ticketCode)}
                      className="text-muted-foreground transition-colors hover:text-primary"
                      title="Copy ticket code"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed" />

                {/* Event Info */}
                <div className="flex flex-col gap-1 text-center">
                  <h3 className="text-base font-semibold text-primary">
                    {ticket.event?.title || 'Event'}
                  </h3>
                  {ticket.event?.date && (
                    <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      <span>{formatShortDate(ticket.event.date)}</span>
                    </div>
                  )}
                  {ticket.event?.location && (
                    <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin size={14} />
                      <span>{ticket.event.location}</span>
                    </div>
                  )}
                </div>

                {/* Attendee Info */}
                <div className="flex flex-col gap-3 border-t pt-4">
                  <div className="flex items-center gap-3">
                    <User size={16} className="shrink-0 text-accent" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Attendee</span>
                      <span className="text-sm font-medium text-foreground">
                        {ticket.registration?.playerName || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="shrink-0 text-accent" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <span className="text-sm font-medium text-foreground">
                        {ticket.registration?.email || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                  <StatusIcon size={18} className={statusConfig.className} />
                  Check-in Status
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div
                  className={`flex items-center gap-2 text-lg font-semibold ${statusConfig.className}`}
                >
                  <StatusIcon size={24} />
                  <span>{statusConfig.label}</span>
                </div>
                {ticket.status === 'checked_in' && ticket.checkedInAt && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Checked in at</span>
                    <span className="text-sm text-foreground">
                      {formatDate(ticket.checkedInAt)}
                    </span>
                  </div>
                )}
                {ticket.checkedInBy && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Checked in by</span>
                    <span className="text-sm text-foreground">
                      {ticket.checkedInBy.name || ticket.checkedInBy.email}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                  <Calendar size={18} />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Event</span>
                  <span className="text-sm text-foreground">{ticket.event?.title || 'N/A'}</span>
                </div>
                {ticket.event?.date && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Date</span>
                    <span className="text-sm text-foreground">
                      {formatShortDate(ticket.event.date)}
                    </span>
                  </div>
                )}
                {ticket.event?.id && (
                  <Link
                    href={`/admin/collections/events/${ticket.event.id}`}
                    className="flex w-fit items-center gap-1.5 text-sm text-accent hover:underline"
                  >
                    <ExternalLink size={14} />
                    View Event
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Registration Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                  <User size={18} />
                  Registration Details
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Name</span>
                  <span className="text-sm text-foreground">
                    {ticket.registration?.playerName || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="text-sm text-foreground">
                    {ticket.registration?.email || 'N/A'}
                  </span>
                </div>
                {ticket.registration?.phone && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Phone</span>
                    <span className="text-sm text-foreground">{ticket.registration.phone}</span>
                  </div>
                )}
                {ticket.registration?.id && (
                  <Link
                    href={`/admin/collections/event-registrations/${ticket.registration.id}`}
                    className="flex w-fit items-center gap-1.5 text-sm text-accent hover:underline"
                  >
                    <ExternalLink size={14} />
                    View Registration
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Meta Info Card */}
            <Card className="bg-muted/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                  <Clock size={18} />
                  Record Info
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Created</span>
                  <span className="text-sm text-foreground">{formatDate(ticket.createdAt)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Last Updated</span>
                  <span className="text-sm text-foreground">{formatDate(ticket.updatedAt)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">ID</span>
                  <code className="font-mono text-xs text-muted-foreground">{ticket.id}</code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketEditView
