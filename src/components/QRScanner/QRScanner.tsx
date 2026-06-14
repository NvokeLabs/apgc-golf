'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { AlertCircle, Camera } from 'lucide-react'

type QRScannerProps = {
  onScan: (result: string) => void
  onError?: (error: string) => void
  isActive?: boolean
}

export function QRScanner({ onScan, onError, isActive = true }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Keep the latest callbacks in refs so the start effect doesn't re-run when
  // they change identity (re-running would spin up a second camera stream and
  // stack a duplicate <video>).
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)
  useEffect(() => {
    onScanRef.current = onScan
    onErrorRef.current = onError
  })

  useEffect(() => {
    if (!isActive) return

    let cancelled = false
    const html5QrCode = new Html5Qrcode('qr-reader')
    scannerRef.current = html5QrCode

    const stopAndClear = () =>
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch(() => {
          try {
            html5QrCode.clear()
          } catch {
            // already stopped/cleared
          }
        })

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => onScanRef.current(decodedText),
        () => {
          // QR code not found in this frame, ignore
        },
      )
      .then(() => {
        // If the effect was torn down before the camera finished starting
        // (e.g. React StrictMode double-mount), stop it immediately.
        if (cancelled) {
          stopAndClear()
          return
        }
        setError(null)
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start camera'
        setError(errorMessage)
        onErrorRef.current?.(errorMessage)
      })

    return () => {
      cancelled = true
      scannerRef.current = null
      stopAndClear()
    }
  }, [isActive])

  if (!isActive) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '256px',
          borderRadius: '12px',
          backgroundColor: 'var(--apgc-bg, #F6F7FB)',
          border: '2px dashed var(--apgc-border, rgba(23, 16, 70, 0.1))',
        }}
      >
        <Camera
          size={32}
          style={{ color: 'var(--apgc-text-muted, #717182)', marginBottom: '12px' }}
        />
        <p style={{ color: 'var(--apgc-text-muted, #717182)', margin: 0, fontSize: '14px' }}>
          Scanner paused
        </p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {error && (
        <div
          style={{
            marginBottom: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '16px',
            color: '#dc2626',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertCircle size={18} />
            <p style={{ fontWeight: 600, margin: 0 }}>Camera Error</p>
          </div>
          <p style={{ fontSize: '14px', margin: '0 0 8px 0' }}>{error}</p>
          <p style={{ fontSize: '13px', margin: 0, color: '#991b1b' }}>
            Please ensure you have granted camera permissions to this website.
          </p>
        </div>
      )}
      <div
        id="qr-reader"
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: '12px',
        }}
      />
      <style jsx global>{`
        #qr-reader video {
          border-radius: 12px !important;
        }
        #qr-reader__scan_region {
          background: transparent !important;
        }
        #qr-reader__dashboard_section_csr {
          display: none !important;
        }
        #qr-reader__dashboard_section_swaplink {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
