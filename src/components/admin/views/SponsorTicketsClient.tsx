'use client'

import { useCallback, useEffect, useState } from 'react'
import { Gift, Ticket, Mail, User, Phone, CheckCircle, AlertTriangle, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

type EventRow = { id: number; title?: string | null }
type TierRel = { id: number; name?: string | null }
type SponsorRow = { id: number; name?: string | null; tier?: TierRel | number | null }

const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const

const selectClass =
  'flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50'

function tierNameOf(sponsor: SponsorRow): string {
  return sponsor.tier && typeof sponsor.tier === 'object' ? sponsor.tier.name || '' : ''
}

export function SponsorTicketsClient() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [sponsors, setSponsors] = useState<SponsorRow[]>([])
  const [issuedCounts, setIssuedCounts] = useState<Record<number, number>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [noticeTone, setNoticeTone] = useState<'success' | 'error'>('success')
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
    load().catch(() => {
      setNoticeTone('error')
      setNotice('Failed to load events or sponsors.')
    })
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
        setNoticeTone('error')
        setNotice(`Failed: ${data.error}`)
      } else {
        setNoticeTone(data.emailSent === false ? 'error' : 'success')
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
      setNoticeTone('error')
      setNotice('Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedSponsor = sponsors.find((s) => String(s.id) === sponsorId)
  const selectedEvent = events.find((ev) => String(ev.id) === eventId)
  const selectedCount = Number(sponsorId) ? issuedCounts[Number(sponsorId)] : undefined

  return (
    <div className="flex flex-col min-h-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Sponsor Tickets</h1>
        <p className="text-sm text-muted-foreground">
          Issue a complimentary ticket under a sponsor. No payment or transfer proof is required —
          the guest receives the same ticket email, PDF and QR code as a paying registrant.
        </p>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 items-start">
        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-3 space-y-5 rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Event & sponsor
            </h2>
            <div className="space-y-2">
              <Label htmlFor="st-event">Event</Label>
              <select
                id="st-event"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
                className={selectClass}
              >
                <option value="">Select an event…</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title || `Event ${ev.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="st-sponsor">Sponsor</Label>
              <select
                id="st-sponsor"
                value={sponsorId}
                onChange={(e) => setSponsorId(e.target.value)}
                required
                className={selectClass}
              >
                <option value="">Select a sponsor…</option>
                {sponsors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || `Sponsor ${s.id}`}
                    {tierNameOf(s) ? ` — ${tierNameOf(s)}` : ''}
                  </option>
                ))}
              </select>
              {selectedCount !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {selectedCount} ticket{selectedCount === 1 ? '' : 's'} issued to this sponsor so
                  far.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t pt-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Guest
            </h2>
            <div className="space-y-2">
              <Label htmlFor="st-name">Guest name</Label>
              <Input
                id="st-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="st-email">Email</Label>
                <Input
                  id="st-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="st-phone">Phone (optional)</Label>
                <Input id="st-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="st-size">T-shirt size</Label>
                <select
                  id="st-size"
                  value={tshirtSize}
                  onChange={(e) => setTshirtSize(e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="">Select a size…</option>
                  {TSHIRT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="st-category">Category</Label>
                <select
                  id="st-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'general' | 'alumni')}
                  className={selectClass}
                >
                  <option value="general">Umum</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>
            </div>
            {category === 'alumni' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="st-year">Angkatan (class year)</Label>
                  <Input
                    id="st-year"
                    type="number"
                    value={alumniClassYear}
                    onChange={(e) => setAlumniClassYear(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="st-major">Jurusan (major)</Label>
                  <Input
                    id="st-major"
                    value={alumniMajor}
                    onChange={(e) => setAlumniMajor(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Gift className="h-4 w-4" />
            {submitting ? 'Issuing…' : 'Issue ticket'}
          </Button>
        </form>

        {/* Live ticket preview */}
        <div className="lg:col-span-2 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="flex items-center gap-2 bg-primary px-4 py-3 text-primary-foreground">
              <Ticket className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Complimentary ticket
              </span>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Event</p>
                <p className="font-medium">
                  {selectedEvent?.title || <span className="text-muted-foreground">—</span>}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Courtesy of
                </p>
                <p className="font-medium">
                  {selectedSponsor ? (
                    <>
                      {selectedSponsor.name}
                      {tierNameOf(selectedSponsor) && (
                        <Badge variant="secondary" className="ml-2">
                          {tierNameOf(selectedSponsor)}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </p>
              </div>
              {/* perforation */}
              <div className="relative -mx-4 border-t border-dashed">
                <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border bg-background" />
                <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full border bg-background" />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {playerName || <span className="text-muted-foreground">Guest name</span>}
                  </p>
                  <p className="flex items-center gap-2 truncate text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {email || 'Email'}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {phone || 'Phone'}
                  </p>
                  <p className="text-muted-foreground">
                    {category === 'alumni' ? 'Alumni' : 'Umum'}
                    {tshirtSize ? ` · Kaos ${tshirtSize}` : ''}
                  </p>
                </div>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-dashed text-muted-foreground">
                  <QrCode className="h-8 w-8 opacity-40" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Rp 0 — paid by sponsor. QR code is generated when the ticket is issued.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
