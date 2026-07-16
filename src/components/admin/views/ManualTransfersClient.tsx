'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  ImageOff,
  Mail,
  Phone,
  Check,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

type ProofRel = {
  id: number
  url?: string | null
  filename?: string | null
  mimeType?: string | null
}
type EventRel = { id: number; title?: string | null; slug?: string | null }

type Registration = {
  id: number
  playerName: string
  email: string
  phone?: string | null
  category: 'general' | 'alumni'
  createdAt: string
  amountDue?: number | null
  transferProof?: ProofRel | number | null
  event?: EventRel | number | null
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

function eventOf(reg: Registration): EventRel | null {
  return reg.event && typeof reg.event === 'object' ? reg.event : null
}
function proofOf(reg: Registration): ProofRel | null {
  return reg.transferProof && typeof reg.transferProof === 'object' ? reg.transferProof : null
}
// wa.me wants digits only, international format (0812… → 62812…)
const waNumber = (phone: string) => phone.replace(/\D/g, '').replace(/^0/, '62')

const selectClass =
  'h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export function ManualTransfersClient() {
  const [rows, setRows] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [noticeTone, setNoticeTone] = useState<'success' | 'error'>('success')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        '/api/event-registrations?where[paymentStatus][equals]=awaiting-verification&depth=1&sort=createdAt&limit=200',
        { credentials: 'include' },
      )
      const data = await res.json()
      setRows(data.docs || [])
    } catch {
      setError('Failed to load pending transfers.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const events = useMemo(() => {
    const map = new Map<number, string>()
    for (const r of rows) {
      const e = eventOf(r)
      if (e) map.set(e.id, e.title || `Event ${e.id}`)
    }
    return Array.from(map.entries())
  }, [rows])

  const visible = useMemo(
    () =>
      eventFilter === 'all' ? rows : rows.filter((r) => String(eventOf(r)?.id) === eventFilter),
    [rows, eventFilter],
  )

  async function approve(reg: Registration, amountPaid: number) {
    setBusyId(reg.id)
    setNotice(null)
    try {
      const res = await fetch('/api/manual-transfers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ registrationId: reg.id, amountPaid }),
      })
      const data = await res.json()
      if (!data.success) {
        setNoticeTone('error')
        setNotice(`Approve failed: ${data.error}`)
      } else {
        setNoticeTone(data.emailSent === false ? 'error' : 'success')
        setNotice(
          data.emailSent === false
            ? `Approved reg-${reg.id}, but the ticket email failed to send.`
            : `Approved reg-${reg.id}. Ticket issued.`,
        )
        await load()
      }
    } catch {
      setNoticeTone('error')
      setNotice('Approve request failed.')
    } finally {
      setBusyId(null)
    }
  }

  async function reject(reg: Registration, reason: string) {
    setBusyId(reg.id)
    setNotice(null)
    try {
      const res = await fetch('/api/manual-transfers/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ registrationId: reg.id, rejectionReason: reason }),
      })
      const data = await res.json()
      if (!data.success) {
        setNoticeTone('error')
        setNotice(`Reject failed: ${data.error}`)
      } else {
        setNoticeTone(data.emailSent === false ? 'error' : 'success')
        setNotice(
          data.emailSent === false
            ? `Rejected reg-${reg.id}, but the email failed: ${data.emailError ?? ''}`
            : `Rejected reg-${reg.id}. Re-upload email sent.`,
        )
        await load()
      }
    } catch {
      setNoticeTone('error')
      setNotice('Reject request failed.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Manual Transfers</h1>
          <p className="text-sm text-muted-foreground">
            Registrations awaiting payment verification. Review the proof, then approve or reject.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <label htmlFor="mt-event" className="text-sm text-muted-foreground">
          Event
        </label>
        <select
          id="mt-event"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">All events</option>
          {events.map(([id, title]) => (
            <option key={id} value={String(id)}>
              {title}
            </option>
          ))}
        </select>
        <Badge variant={visible.length > 0 ? 'warning' : 'success'} className="ml-auto">
          {visible.length} pending
        </Badge>
      </div>

      {notice && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
            noticeTone === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {noticeTone === 'success' ? (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && visible.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 rounded-lg border bg-card py-16 text-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <p className="font-medium">All clear</p>
          <p className="text-sm text-muted-foreground">No transfers awaiting verification.</p>
        </div>
      )}

      <div className="grid gap-4">
        {visible.map((reg) => (
          <TransferRow
            key={reg.id}
            reg={reg}
            busy={busyId === reg.id}
            onApprove={approve}
            onReject={reject}
          />
        ))}
      </div>
    </div>
  )
}

function TransferRow({
  reg,
  busy,
  onApprove,
  onReject,
}: {
  reg: Registration
  busy: boolean
  onApprove: (reg: Registration, amountPaid: number) => void
  onReject: (reg: Registration, reason: string) => void
}) {
  const event = eventOf(reg)
  const proof = proofOf(reg)
  const expected = reg.amountDue ?? 0
  const [amountPaid, setAmountPaid] = useState<number>(expected)
  const [reason, setReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const mismatch = Number(amountPaid) !== Number(expected)
  const isImage = (proof?.mimeType || '').startsWith('image/')

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap justify-between gap-4 p-4">
        {/* Registrant */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{reg.playerName}</span>
            <Badge variant="secondary" className="capitalize">
              {reg.category}
            </Badge>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              reg-{reg.id}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <a
              href={`mailto:${reg.email}`}
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" />
              {reg.email}
            </a>
            {reg.phone && (
              <a
                href={`https://wa.me/${waNumber(reg.phone)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <Phone className="h-3.5 w-3.5" />
                {reg.phone}
              </a>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {event?.title || 'Unknown event'} · submitted {new Date(reg.createdAt).toLocaleString()}
          </p>
          <p className="pt-1 text-sm">
            Expected <span className="text-base font-bold">{formatPrice(expected)}</span>
          </p>
        </div>

        {/* Proof */}
        <div className="flex w-[140px] shrink-0 items-start justify-end">
          {proof ? (
            isImage ? (
              // Served via Payload's access-controlled file route (admin cookie).
              <a href={proof.url || '#'} target="_blank" rel="noreferrer" title="Open proof">
                <img
                  src={proof.url || ''}
                  alt={`proof for reg-${reg.id}`}
                  className="max-h-32 max-w-[140px] rounded-md border object-contain"
                />
              </a>
            ) : (
              <a
                href={proof.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 rounded-md border p-4 text-sm text-muted-foreground hover:text-foreground"
              >
                <FileText className="h-8 w-8" />
                View proof (PDF)
              </a>
            )
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-md border border-dashed p-4 text-xs text-muted-foreground">
              <ImageOff className="h-6 w-6" />
              No proof file
            </div>
          )}
        </div>
      </div>

      {mismatch && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Amount paid ({formatPrice(Number(amountPaid) || 0)}) differs from the expected{' '}
            {formatPrice(expected)}. Confirm before approving.
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t bg-muted/30 px-4 py-3">
        <label htmlFor={`amount-${reg.id}`} className="text-sm text-muted-foreground">
          Amount paid
        </label>
        <Input
          id={`amount-${reg.id}`}
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(Number(e.target.value))}
          className="h-9 w-36"
        />
        <Button
          size="sm"
          onClick={() => onApprove(reg, Number(amountPaid))}
          disabled={busy}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Check className="h-4 w-4" />
          {busy ? 'Working…' : 'Approve & issue ticket'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRejecting((v) => !v)}
          disabled={busy}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>

      {rejecting && (
        <div className="space-y-2 border-t px-4 py-3">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (emailed to the registrant)"
            rows={2}
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onReject(reg, reason)}
            disabled={busy || reason.trim().length === 0}
          >
            Confirm rejection & email re-upload link
          </Button>
        </div>
      )}
    </div>
  )
}
