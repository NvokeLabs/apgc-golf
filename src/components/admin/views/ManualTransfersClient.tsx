'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

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

export function ManualTransfersClient() {
  const [rows, setRows] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

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
        setNotice(`Approve failed: ${data.error}`)
      } else {
        setNotice(
          data.emailSent === false
            ? `Approved reg-${reg.id}, but the ticket email failed to send.`
            : `Approved reg-${reg.id}. Ticket issued.`,
        )
        await load()
      }
    } catch {
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
        setNotice(`Reject failed: ${data.error}`)
      } else {
        setNotice(
          data.emailSent === false
            ? `Rejected reg-${reg.id}, but the email failed: ${data.emailError ?? ''}`
            : `Rejected reg-${reg.id}. Re-upload email sent.`,
        )
        await load()
      }
    } catch {
      setNotice('Reject request failed.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1 style={{ marginBottom: 4 }}>Manual transfers</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Registrations awaiting payment verification. Review the proof, then approve or reject.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '16px 0' }}>
        <label>
          Event:{' '}
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="all">All</option>
            {events.map(([id, title]) => (
              <option key={id} value={String(id)}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
        <span style={{ color: '#666' }}>{visible.length} pending</span>
      </div>

      {notice && (
        <div
          style={{
            padding: 10,
            background: '#eef6ff',
            border: '1px solid #cfe2ff',
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          {notice}
        </div>
      )}
      {error && <div style={{ color: '#b00' }}>{error}</div>}

      {!loading && visible.length === 0 && <p>No transfers awaiting verification. 🎉</p>}

      <div style={{ display: 'grid', gap: 16 }}>
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
    <div style={{ border: '1px solid #e2e2e2', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <strong>{reg.playerName}</strong> · {reg.email}
          <div style={{ color: '#666', fontSize: 13 }}>
            {event?.title || 'Unknown event'} · {reg.category} · submitted{' '}
            {new Date(reg.createdAt).toLocaleString()}
          </div>
          <div style={{ marginTop: 4 }}>
            Expected: <strong>{formatPrice(expected)}</strong> · Ref:{' '}
            <span style={{ fontFamily: 'monospace' }}>reg-{reg.id}</span>
          </div>
        </div>
        <div style={{ minWidth: 160 }}>
          {proof ? (
            isImage ? (
              // Served via Payload's access-controlled file route (admin cookie).

              <a href={proof.url || '#'} target="_blank" rel="noreferrer">
                <img
                  src={proof.url || ''}
                  alt={`proof for reg-${reg.id}`}
                  style={{
                    maxWidth: 160,
                    maxHeight: 120,
                    borderRadius: 4,
                    border: '1px solid #ddd',
                  }}
                />
              </a>
            ) : (
              <a href={proof.url || '#'} target="_blank" rel="noreferrer">
                View proof (PDF)
              </a>
            )
          ) : (
            <em style={{ color: '#999' }}>No proof file</em>
          )}
        </div>
      </div>

      <div
        style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}
      >
        <label>
          Amount paid:{' '}
          <input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(Number(e.target.value))}
            style={{ width: 140 }}
          />
        </label>
        <button type="button" onClick={() => onApprove(reg, Number(amountPaid))} disabled={busy}>
          {busy ? 'Working…' : 'Approve & issue ticket'}
        </button>
        <button type="button" onClick={() => setRejecting((v) => !v)} disabled={busy}>
          Reject
        </button>
      </div>

      {mismatch && (
        <div
          style={{
            marginTop: 8,
            color: '#92400e',
            background: '#fef3c7',
            padding: 8,
            borderRadius: 6,
          }}
        >
          ⚠️ Amount paid ({formatPrice(Number(amountPaid) || 0)}) differs from the expected{' '}
          {formatPrice(expected)}. Confirm before approving.
        </div>
      )}

      {rejecting && (
        <div style={{ marginTop: 10 }}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (emailed to the registrant)"
            rows={2}
            style={{ width: '100%' }}
          />
          <button
            type="button"
            onClick={() => onReject(reg, reason)}
            disabled={busy || reason.trim().length === 0}
            style={{ marginTop: 6 }}
          >
            Confirm rejection & email re-upload link
          </button>
        </div>
      )}
    </div>
  )
}
