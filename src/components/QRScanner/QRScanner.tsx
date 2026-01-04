'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

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
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-500">Scanner paused</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          <p className="font-medium">Camera Error</p>
          <p className="text-sm">{error}</p>
          <p className="mt-2 text-sm">
            Please ensure you have granted camera permissions to this website.
          </p>
        </div>
      )}
      <div
        id="qr-reader"
        ref={containerRef}
        className="overflow-hidden rounded-lg"
        style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
      />
    </div>
  )
}
