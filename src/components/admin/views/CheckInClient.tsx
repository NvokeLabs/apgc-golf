'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { QRScanner } from '@/components/QRScanner/QRScanner'
import {
  QrCode,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  Camera,
  Keyboard,
  Volume2,
  VolumeX,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

export function CheckInClient() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState<Stats>({ total: 0, checkedIn: 0, remaining: 0 })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [inputMode, setInputMode] = useState<'scanner' | 'manual'>('scanner')

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
        const regResponse = await fetch(
          `/api/event-registrations?where[event][equals]=${selectedEvent}&where[paymentStatus][equals]=paid&limit=0`,
        )
        const regData = await regResponse.json()
        const total = regData.totalDocs || 0

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

        if (soundEnabled) {
          playSound(result.valid ? 'success' : 'error')
        }

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
    [selectedEvent, isProcessing, soundEnabled],
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
    try {
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
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

  const selectedEventData = events.find((e) => e.id === selectedEvent)

  return (
    <div className="apgc-admin">
      <div className="mx-auto max-w-[900px] py-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="text-muted-foreground">
              <Link href="/admin/collections/tickets">
                <ChevronLeft size={20} />
              </Link>
            </Button>
            <div>
              <h1 className="m-0 flex items-center gap-2.5 text-2xl font-bold text-primary">
                <QrCode size={24} className="text-accent" />
                Event Check-In
              </h1>
              <p className="m-0 text-sm text-muted-foreground">
                Scan QR codes to check in attendees
              </p>
            </div>
          </div>

          {/* Sound Toggle */}
          <Button
            variant="outline"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-2 text-muted-foreground"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            Sound {soundEnabled ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Event Selector Card */}
        <Card className="mb-5">
          <CardContent className="p-5">
            <label className="mb-2 block text-sm font-semibold text-primary">Select Event</label>
            <select
              value={selectedEvent || ''}
              onChange={(e) => {
                setSelectedEvent(e.target.value ? Number(e.target.value) : null)
                setIsScanning(false)
                setLastResult(null)
              }}
              className="w-full cursor-pointer rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Choose an event to start...</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {new Date(event.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {selectedEvent && (
          <>
            {/* Stats Cards */}
            <div className="mb-5 grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5 text-center">
                  <div className="mb-2 flex items-center justify-center">
                    <Users size={20} className="text-muted-foreground" />
                  </div>
                  <p className="m-0 text-3xl font-bold text-primary">{stats.total}</p>
                  <p className="m-0 text-xs text-muted-foreground">Total Registered</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-5 text-center">
                  <div className="mb-2 flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <p className="m-0 text-3xl font-bold text-green-600">{stats.checkedIn}</p>
                  <p className="m-0 text-xs text-green-700">Checked In</p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-5 text-center">
                  <div className="mb-2 flex items-center justify-center">
                    <Clock size={20} className="text-amber-600" />
                  </div>
                  <p className="m-0 text-3xl font-bold text-amber-600">{stats.remaining}</p>
                  <p className="m-0 text-xs text-amber-700">Remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Input Mode Toggle */}
            <Card className="mb-5 p-1.5">
              <div className="flex gap-2">
                <button
                  onClick={() => setInputMode('scanner')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-3 text-sm font-medium transition-colors',
                    inputMode === 'scanner'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  <Camera size={18} />
                  QR Scanner
                </button>
                <button
                  onClick={() => {
                    setInputMode('manual')
                    setIsScanning(false)
                  }}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-3 text-sm font-medium transition-colors',
                    inputMode === 'manual'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  <Keyboard size={18} />
                  Manual Entry
                </button>
              </div>
            </Card>

            {/* Scanner / Manual Entry Card */}
            <Card className="mb-5">
              <CardContent className="p-6">
                {inputMode === 'scanner' ? (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="m-0 text-base font-semibold text-primary">
                        {isScanning ? 'Scanning...' : 'QR Code Scanner'}
                      </h2>
                      <Button
                        onClick={() => setIsScanning(!isScanning)}
                        variant={isScanning ? 'destructive' : 'default'}
                        className={cn(
                          'gap-2',
                          !isScanning && 'bg-accent text-accent-foreground hover:bg-accent/90',
                        )}
                      >
                        {isScanning ? (
                          <>
                            <XCircle size={18} />
                            Stop Scanner
                          </>
                        ) : (
                          <>
                            <Camera size={18} />
                            Start Scanner
                          </>
                        )}
                      </Button>
                    </div>

                    {isScanning ? (
                      <div className="overflow-hidden rounded-lg bg-black">
                        <QRScanner onScan={handleScan} isActive={isScanning && !isProcessing} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/40 px-5 py-16">
                        <QrCode size={48} className="mb-4 text-muted-foreground" />
                        <p className="m-0 mb-2 text-base font-medium text-primary">Ready to Scan</p>
                        <p className="m-0 text-sm text-muted-foreground">
                          Click &quot;Start Scanner&quot; to begin scanning QR codes
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="m-0 mb-4 text-base font-semibold text-primary">
                      Enter Ticket Code
                    </h2>
                    <form onSubmit={handleManualSubmit} className="flex gap-3">
                      <Input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        placeholder="e.g., APGC-123-ABC"
                        className="h-12 flex-1 font-mono text-base tracking-wide"
                      />
                      <Button
                        type="submit"
                        disabled={isProcessing || !manualCode.trim()}
                        className="h-12 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        {isProcessing ? (
                          <RefreshCw size={18} className="animate-spin" />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                        Validate
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Scan Result */}
            {lastResult && (
              <Card
                className={cn(
                  'mb-5 border-2 p-8 text-center',
                  lastResult.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50',
                )}
              >
                {lastResult.valid ? (
                  <>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                      <CheckCircle size={32} className="text-white" />
                    </div>
                    <h3 className="m-0 mb-1 text-2xl font-bold text-green-800">
                      {lastResult.attendee?.name}
                    </h3>
                    <p className="m-0 mb-2 text-base capitalize text-green-700">
                      {lastResult.attendee?.category}
                    </p>
                    <p className="m-0 text-sm text-green-600">Successfully checked in</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
                      <XCircle size={32} className="text-white" />
                    </div>
                    <h3 className="m-0 mb-2 text-xl font-bold text-red-800">Check-in Failed</h3>
                    <p className="m-0 text-sm text-red-600">{lastResult.reason}</p>
                  </>
                )}
              </Card>
            )}

            {/* Event Info Footer */}
            <div className="mt-5 rounded-lg bg-accent/5 p-4 text-center">
              <p className="m-0 text-sm text-muted-foreground">
                Currently checking in for:{' '}
                <strong className="text-accent">{selectedEventData?.title}</strong>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
