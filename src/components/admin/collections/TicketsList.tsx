'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  ChevronDown,
  ChevronUp,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Ticket = {
  id: string
  ticketCode: string
  status: 'pending' | 'checked_in' | 'cancelled'
  checkedInAt: string | null
  event: {
    id: string
    title: string
  }
  registration: {
    id: string
    playerName: string
    email: string
  }
  createdAt: string
}

type TicketsData = {
  docs: Ticket[]
  totalDocs: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function TicketsList() {
  const [data, setData] = useState<TicketsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set())

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        depth: '2',
        sort: '-createdAt',
      })

      if (searchQuery) {
        params.append('where[ticketCode][contains]', searchQuery)
      }

      if (statusFilter) {
        params.append('where[status][equals]', statusFilter)
      }

      const response = await fetch(`/api/tickets?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch tickets')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [page, statusFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (page === 1) {
        fetchTickets()
      } else {
        setPage(1)
      }
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked_in':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Checked In
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="error" className="gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
    }
  }

  const toggleSelectAll = () => {
    if (!data) return
    if (selectedTickets.size === data.docs.length) {
      setSelectedTickets(new Set())
    } else {
      setSelectedTickets(new Set(data.docs.map((t) => t.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedTickets)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTickets(newSelected)
  }

  const headers = ['Ticket Code', 'Attendee', 'Event', 'Status', 'Checked In At', 'Actions']

  return (
    <div className="flex flex-col min-h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--apgc-text)' }}>
            Tickets
          </h1>
          <p className="text-sm" style={{ color: 'var(--apgc-text-muted)' }}>
            Manage event tickets and check-in status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/check-in">
            <Button
              size="sm"
              style={{ backgroundColor: 'var(--apgc-primary)', color: 'white' }}
              className="gap-2"
            >
              <QrCode className="h-4 w-4" />
              Open Scanner
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => fetchTickets()} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex items-center justify-between gap-4 p-3 rounded-lg border"
        style={{ backgroundColor: 'var(--apgc-card-bg)', borderColor: 'var(--apgc-border)' }}
      >
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: 'var(--apgc-text-muted)' }}
          />
          <Input
            type="search"
            placeholder="Search by ticket code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-none bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-3 rounded-md text-sm border"
            style={{
              backgroundColor: 'var(--apgc-bg)',
              borderColor: 'var(--apgc-border)',
              color: 'var(--apgc-text)',
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="checked_in">Checked In</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: 'var(--apgc-card-bg)', borderColor: 'var(--apgc-border)' }}
      >
        <Table>
          <TableHeader>
            <TableRow
              className="hover:bg-transparent"
              style={{ backgroundColor: 'var(--apgc-bg)' }}
            >
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={data?.docs.length ? selectedTickets.size === data.docs.length : false}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              {headers.map((header) => (
                <TableHead key={header}>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-foreground group">
                    {header}
                    {header !== 'Actions' && (
                      <div className="flex flex-col opacity-50 group-hover:opacity-100">
                        <ChevronUp className="h-2 w-2" />
                        <ChevronDown className="h-2 w-2" />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading tickets...
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.docs.length ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center"
                  style={{ color: 'var(--apgc-text-muted)' }}
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              data.docs.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedTickets.has(ticket.id)}
                      onCheckedChange={() => toggleSelect(ticket.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/collections/tickets/${ticket.id}`}
                      className="font-mono text-sm underline decoration-1 underline-offset-4"
                      style={{ color: 'var(--apgc-primary)' }}
                    >
                      {ticket.ticketCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.registration?.playerName || '-'}</div>
                      <div className="text-xs" style={{ color: 'var(--apgc-text-muted)' }}>
                        {ticket.registration?.email || '-'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/collections/events/${ticket.event?.id}`}
                      className="hover:underline"
                    >
                      {ticket.event?.title || '-'}
                    </Link>
                  </TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell style={{ color: 'var(--apgc-text-muted)' }}>
                    {formatDate(ticket.checkedInAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/collections/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between text-sm"
        style={{ color: 'var(--apgc-text-muted)' }}
      >
        <div>
          {data
            ? `${(page - 1) * 10 + 1}-${Math.min(page * 10, data.totalDocs)} of ${data.totalDocs}`
            : '0 of 0'}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!data?.hasPrevPage}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="px-2">
            Page {data?.page || 1} of {data?.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!data?.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TicketsList
