'use client'

import { useCallback, useEffect, useState } from 'react'

type EventRow = { id: number; title?: string | null }
type TierRel = { id: number; name?: string | null }
type SponsorRow = { id: number; name?: string | null; tier?: TierRel | number | null }

const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const

function tierNameOf(sponsor: SponsorRow): string {
  return sponsor.tier && typeof sponsor.tier === 'object' ? sponsor.tier.name || '' : ''
}

export function SponsorTicketsClient() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [sponsors, setSponsors] = useState<SponsorRow[]>([])
  const [issuedCounts, setIssuedCounts] = useState<Record<number, number>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [eventId, setEventId] = useState('')
  const [sponsorId, setSponsorId] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tshirtSize, setTshirtSize] = useState('')
  const [category, setCategory] = useState<'general' | 'alumni'>('general')
  const [alumniClassYear, setAlumniClassYear] = useState('')
  const [alumniMajor, setAlumniMajor] = useState('')

  useEffect(() => {
    async function load() {
      const [eventsRes, sponsorsRes] = await Promise.all([
        fetch('/api/events?limit=100&sort=-date', { credentials: 'include' }),
        fetch('/api/sponsors?limit=200&depth=1&sort=name', { credentials: 'include' }),
      ])
      const eventsData = await eventsRes.json()
      const sponsorsData = await sponsorsRes.json()
      setEvents(eventsData.docs || [])
      setSponsors(sponsorsData.docs || [])
    }
    load().catch(() => setNotice('Failed to load events or sponsors.'))
  }, [])

  // Informational only — how many complimentary tickets this sponsor already
  // has. Never blocks issuance; there is no quota in the system.
  const loadIssuedCount = useCallback(async (id: number) => {
    const res = await fetch(
      `/api/event-registrations?where[sponsor][equals]=${id}&limit=0&depth=0`,
      { credentials: 'include' },
    )
    const data = await res.json()
    setIssuedCounts((prev) => ({ ...prev, [id]: data.totalDocs ?? 0 }))
  }, [])

  useEffect(() => {
    const id = Number(sponsorId)
    if (id) loadIssuedCount(id).catch(() => {})
  }, [sponsorId, loadIssuedCount])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setNotice(null)
    try {
      const res = await fetch('/api/sponsor-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventId: Number(eventId),
          sponsorId: Number(sponsorId),
          playerName,
          email,
          phone: phone || undefined,
          category,
          tshirtSize,
          alumniClassYear: alumniClassYear ? Number(alumniClassYear) : undefined,
          alumniMajor: alumniMajor || undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setNotice(`Failed: ${data.error}`)
      } else {
        setNotice(
          data.emailSent === false
            ? `Ticket ${data.ticketCode} issued, but the email failed to send. Download the PDF from the Tickets list.`
            : `Ticket ${data.ticketCode} issued and emailed to ${email}.`,
        )
        setPlayerName('')
        setEmail('')
        setPhone('')
        setTshirtSize('')
        setAlumniClassYear('')
        setAlumniMajor('')
        if (Number(sponsorId)) await loadIssuedCount(Number(sponsorId))
      }
    } catch {
      setNotice('Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCount = Number(sponsorId) ? issuedCounts[Number(sponsorId)] : undefined

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ marginBottom: 4 }}>Sponsor Tickets</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Issue a complimentary ticket under a sponsor. No payment or transfer proof is required — the
        guest receives the same ticket email, PDF and QR code as a paying registrant.
      </p>

      {notice && (
        <div
          role="status"
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

      <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
        <label>
          Event
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          >
            <option value="">Select an event…</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title || `Event ${ev.id}`}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sponsor
          <select
            value={sponsorId}
            onChange={(e) => setSponsorId(e.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          >
            <option value="">Select a sponsor…</option>
            {sponsors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || `Sponsor ${s.id}`}
                {tierNameOf(s) ? ` — ${tierNameOf(s)}` : ''}
              </option>
            ))}
          </select>
        </label>

        {selectedCount !== undefined && (
          <p style={{ color: '#666', margin: 0 }}>
            {selectedCount} ticket{selectedCount === 1 ? '' : 's'} issued to this sponsor so far.
          </p>
        )}

        <label>
          Guest name
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          />
        </label>

        <label>
          Phone (optional)
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ display: 'block', width: '100%' }}
          />
        </label>

        <label>
          T-shirt size
          <select
            value={tshirtSize}
            onChange={(e) => setTshirtSize(e.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          >
            <option value="">Select a size…</option>
            {TSHIRT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'general' | 'alumni')}
            style={{ display: 'block', width: '100%' }}
          >
            <option value="general">General</option>
            <option value="alumni">Alumni</option>
          </select>
        </label>

        {category === 'alumni' && (
          <>
            <label>
              Angkatan (class year)
              <input
                type="number"
                value={alumniClassYear}
                onChange={(e) => setAlumniClassYear(e.target.value)}
                style={{ display: 'block', width: '100%' }}
              />
            </label>
            <label>
              Jurusan (major)
              <input
                value={alumniMajor}
                onChange={(e) => setAlumniMajor(e.target.value)}
                style={{ display: 'block', width: '100%' }}
              />
            </label>
          </>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Issuing…' : 'Issue ticket'}
        </button>
      </form>
    </div>
  )
}
