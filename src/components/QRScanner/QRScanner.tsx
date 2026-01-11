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
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const containerId = 'qr-reader'

    // Create scanner instance
    const html5QrCode = new Html5Qrcode(containerId)
    scannerRef.current = html5QrCode

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText)
          },
          () => {
            // QR code not found, ignore
          },
        )
        setIsStarted(true)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start camera'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current && isStarted) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [isActive, onScan, onError, isStarted])

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
