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
      const audioContext = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )()
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
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--apgc-bg, #F6F7FB)',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href="/admin/collections/tickets"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--apgc-card-bg, #ffffff)',
                border: '1px solid var(--apgc-border, rgba(23, 16, 70, 0.1))',
                color: 'var(--apgc-text-muted, #717182)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--apgc-text, #171046)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <QrCode size={24} style={{ color: 'var(--apgc-primary, #ed5f24)' }} />
                Event Check-In
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--apgc-text-muted, #717182)' }}>
                Scan QR codes to check in attendees
              </p>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--apgc-card-bg, #ffffff)',
              border: '1px solid var(--apgc-border, rgba(23, 16, 70, 0.1))',
              color: 'var(--apgc-text-muted, #717182)',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            Sound {soundEnabled ? 'On' : 'Off'}
          </button>
        </div>

        {/* Event Selector Card */}
        <div
          style={{
            backgroundColor: 'var(--apgc-card-bg, #ffffff)',
            border: '1px solid var(--apgc-border, rgba(23, 16, 70, 0.1))',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--apgc-text, #171046)',
              marginBottom: '8px',
            }}
          >
            Select Event
          </label>
          <select
            value={selectedEvent || ''}
            onChange={(e) => {
              setSelectedEvent(e.target.value ? Number(e.target.value) : null)
              setIsScanning(false)
              setLastResult(null)
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--apgc-border, rgba(23, 16, 70, 0.1))',
              backgroundColor: 'var(--apgc-bg, #F6F7FB)',
              fontSize: '14px',
              color: 'var(--apgc-text, #171046)',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          >
            <option value="">Choose an event to start...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <>
            {/* Stats Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--apgc-card-bg, #ffffff)',
                  border: '1px solid var(--apgc-border, rgba(23, 16, 70, 0.1))',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <Users size={20} style={{ color: 'var(--apgc-text-muted, #717182)' }} />
                </div>
                <p
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: 'var(--apgc-text, #171046)',
                    margin: 0,
                  }}
                >
                  {stats.total}
                </p>
                <p
                  style={{ fontSize: '13px', color: 'var(--apgc-text-muted, #717182)', margin: 0 }}
                >
                  Total Registered
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                </div>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', margin: 0 }}>
                  {stats.checkedIn}
                </p>
                <p style={{ fontSize: '13px', color: '#059669', margin: 0 }}>Checked In</p>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <Clock size={20} style={{ color: '#f59e0b' }} />
                </div>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b', margin: 0 }}>
                  {stats.remaining}
                </p>
                <p style={{ fontSize: '13px', color: '#d97706', margin: 0 }}>Remaining</p>
              </div>
            </div>

            {/* Input Mode Toggle */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                backgroundColor: 'var(--apgc-card-bg, #ffffff)',
                border: '1px solid var(--apgc-border, rgba(23, 16, 70, 0.1))',
                borderRadius: '12px',
                padding: '6px',
              }}
            >
              <button
                onClick={() => setInputMode('scanner')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor:
                    inputMode === 'scanner' ? 'var(--apgc-primary, #ed5f24)' : 'transparent',
                  color: inputMode === 'scanner' ? 'white' : 'var(--apgc-text-muted, #717182)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Camera size={18} />
                QR Scanner
              </button>
              <button
                onClick={() => {
                  setInputMode('manual')
                  setIsScanning(false)
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor:
                    inputMode === 'manual' ? 'var(--apgc-primary, #ed5f24)' : 'transparent',
                  color: inputMode === 'manual' ? 'white' : 'var(--apgc-text-muted, #717182)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Keyboard size={18} />
                Manual Entry
              </button>
            </div>

            {/* Scanner / Manual Entry Card */}
            <div
              style={{
                backgroundColor: 'var(--apgc-card-bg, #ffffff)',
                border: '1px solid var(--apgc-border, rgba(23, 16, 70, 0.1))',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              {inputMode === 'scanner' ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'var(--apgc-text, #171046)',
                      }}
                    >
                      {isScanning ? 'Scanning...' : 'QR Code Scanner'}
                    </h2>
                    <button
                      onClick={() => setIsScanning(!isScanning)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: isScanning ? '#ef4444' : 'var(--apgc-primary, #ed5f24)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
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
                    </button>
                  </div>

                  {isScanning ? (
                    <div
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#000',
                      }}
                    >
                      <QRScanner onScan={handleScan} isActive={isScanning && !isProcessing} />
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px 20px',
                        backgroundColor: 'var(--apgc-bg, #F6F7FB)',
                        borderRadius: '12px',
                        border: '2px dashed var(--apgc-border, rgba(23, 16, 70, 0.1))',
                      }}
                    >
                      <QrCode
                        size={48}
                        style={{ color: 'var(--apgc-text-muted, #717182)', marginBottom: '16px' }}
                      />
                      <p
                        style={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: 'var(--apgc-text, #171046)',
                          margin: '0 0 8px 0',
                        }}
                      >
                        Ready to Scan
                      </p>
                      <p
                        style={{
                          fontSize: '14px',
                          color: 'var(--apgc-text-muted, #717182)',
                          margin: 0,
                        }}
                      >
                        Click &quot;Start Scanner&quot; to begin scanning QR codes
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2
                    style={{
                      margin: '0 0 16px 0',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--apgc-text, #171046)',
                    }}
                  >
                    Enter Ticket Code
                  </h2>
                  <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="e.g., APGC-123-ABC"
                      style={{
                        flex: 1,
                        padding: '14px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--apgc-border, rgba(23, 16, 70, 0.1))',
                        fontSize: '16px',
                        fontFamily: 'monospace',
                        letterSpacing: '1px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isProcessing || !manualCode.trim()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'var(--apgc-primary, #ed5f24)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: isProcessing || !manualCode.trim() ? 'not-allowed' : 'pointer',
                        opacity: isProcessing || !manualCode.trim() ? 0.5 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {isProcessing ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      Validate
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Scan Result */}
            {lastResult && (
              <div
                style={{
                  backgroundColor: lastResult.valid
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `2px solid ${lastResult.valid ? '#10b981' : '#ef4444'}`,
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  animation: 'fadeIn 0.3s ease-out',
                }}
              >
                {lastResult.valid ? (
                  <>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      <CheckCircle size={32} style={{ color: 'white' }} />
                    </div>
                    <h3
                      style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#065f46',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {lastResult.attendee?.name}
                    </h3>
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#047857',
                        margin: '0 0 8px 0',
                        textTransform: 'capitalize',
                      }}
                    >
                      {lastResult.attendee?.category}
                    </p>
                    <p style={{ fontSize: '14px', color: '#059669', margin: 0 }}>
                      Successfully checked in
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      <XCircle size={32} style={{ color: 'white' }} />
                    </div>
                    <h3
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#991b1b',
                        margin: '0 0 8px 0',
                      }}
                    >
                      Check-in Failed
                    </h3>
                    <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>
                      {lastResult.reason}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Event Info Footer */}
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: 'rgba(237, 95, 36, 0.05)',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--apgc-text-muted, #717182)' }}>
                Currently checking in for:{' '}
                <strong style={{ color: 'var(--apgc-primary, #ed5f24)' }}>
                  {selectedEventData?.title}
                </strong>
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        input:focus {
          border-color: var(--apgc-primary, #ed5f24) !important;
          box-shadow: 0 0 0 3px rgba(237, 95, 36, 0.1);
        }
        select:focus {
          border-color: var(--apgc-primary, #ed5f24) !important;
          box-shadow: 0 0 0 3px rgba(237, 95, 36, 0.1);
        }
      `}</style>
    </div>
  )
}
