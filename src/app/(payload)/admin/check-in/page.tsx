'use client'

import { useState, useEffect, useCallback } from 'react'
import { QRScanner } from '@/components/QRScanner/QRScanner'

type Event = {
  id: number
  title: string
  date: string
}

type ScanResult = {
  valid: boolean
  reason?: string
  attendee?: {
    name: string
    email: string
    category: string
  }
  event?: {
    name: string
    date: string
  }
  checkedInAt?: string
}

type Stats = {
  total: number
  checkedIn: number
  remaining: number
}

export default function CheckInPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState<Stats>({ total: 0, checkedIn: 0, remaining: 0 })

  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events?limit=100&sort=-date')
        const data = await response.json()
        setEvents(data.docs || [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
      }
    }
    fetchEvents()
  }, [])

  // Fetch stats when event is selected
  useEffect(() => {
    if (!selectedEvent) return

    async function fetchStats() {
      try {
        // Get total paid registrations
        const regResponse = await fetch(
          `/api/event-registrations?where[event][equals]=${selectedEvent}&where[paymentStatus][equals]=paid&limit=0`,
        )
        const regData = await regResponse.json()
        const total = regData.totalDocs || 0

        // Get checked-in tickets
        const ticketResponse = await fetch(
          `/api/tickets?where[event][equals]=${selectedEvent}&where[status][equals]=checked_in&limit=0`,
        )
        const ticketData = await ticketResponse.json()
        const checkedIn = ticketData.totalDocs || 0

        setStats({
          total,
          checkedIn,
          remaining: total - checkedIn,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [selectedEvent, lastResult])

  const validateTicket = useCallback(
    async (ticketCode: string) => {
      if (isProcessing) return
      setIsProcessing(true)

      try {
        const response = await fetch('/api/check-in/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketCode,
            eventId: selectedEvent,
          }),
        })

        const result: ScanResult = await response.json()
        setLastResult(result)

        // Play sound feedback
        if (result.valid) {
          playSound('success')
        } else {
          playSound('error')
        }

        // Auto-reset after 3 seconds
        setTimeout(() => {
          setLastResult(null)
          setIsProcessing(false)
        }, 3000)
      } catch (error) {
        console.error('Validation error:', error)
        setLastResult({ valid: false, reason: 'Network error' })
        setIsProcessing(false)
      }
    },
    [selectedEvent, isProcessing],
  )

  const handleScan = useCallback(
    (result: string) => {
      if (!isProcessing) {
        validateTicket(result)
      }
    },
    [validateTicket, isProcessing],
  )

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      validateTicket(manualCode.trim())
      setManualCode('')
    }
  }

  const playSound = (type: 'success' | 'error') => {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = type === 'success' ? 800 : 300
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch {
      // Audio not supported
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Event Check-In</h1>

        {/* Event Selector */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <label className="mb-2 block text-sm font-medium text-gray-700">Select Event</label>
          <select
            value={selectedEvent || ''}
            onChange={(e) => {
              setSelectedEvent(e.target.value ? Number(e.target.value) : null)
              setIsScanning(false)
              setLastResult(null)
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <>
            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-white p-4 text-center shadow">
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Registered</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4 text-center shadow">
                <p className="text-3xl font-bold text-emerald-600">{stats.checkedIn}</p>
                <p className="text-sm text-emerald-700">Checked In</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-4 text-center shadow">
                <p className="text-3xl font-bold text-amber-600">{stats.remaining}</p>
                <p className="text-sm text-amber-700">Remaining</p>
              </div>
            </div>

            {/* Scanner Controls */}
            <div className="mb-6 rounded-lg bg-white p-4 shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">QR Scanner</h2>
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`rounded-lg px-4 py-2 font-medium ${
                    isScanning
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {isScanning ? 'Stop Scanner' : 'Start Scanner'}
                </button>
              </div>

              {isScanning && (
                <div className="mt-4">
                  <QRScanner onScan={handleScan} isActive={isScanning && !isProcessing} />
                </div>
              )}
            </div>

            {/* Scan Result */}
            {lastResult && (
              <div
                className={`mb-6 rounded-lg p-6 shadow ${
                  lastResult.valid ? 'bg-emerald-100' : 'bg-red-100'
                }`}
              >
                <div className="text-center">
                  {lastResult.valid ? (
                    <>
                      <div className="mb-4 text-6xl">✓</div>
                      <h3 className="text-2xl font-bold text-emerald-800">
                        {lastResult.attendee?.name}
                      </h3>
                      <p className="text-emerald-700">{lastResult.attendee?.category}</p>
                      <p className="mt-2 text-sm text-emerald-600">
                        Checked in successfully
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 text-6xl">✕</div>
                      <h3 className="text-xl font-bold text-red-800">Check-in Failed</h3>
                      <p className="text-red-700">{lastResult.reason}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Manual Entry */}
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Manual Entry</h2>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter ticket code (e.g., APGC-123-abc)"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !manualCode.trim()}
                  className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Validate
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
