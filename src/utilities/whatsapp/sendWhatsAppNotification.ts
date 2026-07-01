/**
 * Thin Fonnte client for internal admin alerts. Non-fatal by contract: never
 * throws, and no-ops with a warning when unconfigured (so local/dev/CI without
 * Fonnte credentials keeps working). Mirrors the Resend email utilities.
 */
export async function sendWhatsAppNotification(
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.FONNTE_TOKEN
  const target = process.env.FONNTE_TARGET
  if (!token || !target) {
    console.warn('WhatsApp notification skipped: FONNTE_TOKEN/FONNTE_TARGET not configured')
    return { success: false, error: 'WhatsApp not configured' }
  }

  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: token },
      body: new URLSearchParams({ target, message }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`Fonnte send failed: ${res.status} ${text}`)
      return { success: false, error: `HTTP ${res.status}` }
    }
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Fonnte send error:', msg)
    return { success: false, error: msg }
  }
}
