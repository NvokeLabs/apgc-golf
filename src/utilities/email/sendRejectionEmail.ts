import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const REJECTION_EMAIL_SUBJECT = 'Perlu tindakan: bukti pembayaran Anda — APGC Golf'

export type RejectionEmailParams = {
  playerName: string
  reason: string
  uploadUrl: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Builds the rejection email body (Story 9): explains why the proof was
 * rejected and links to the SAME tokenized upload page to resubmit. User
 * content is HTML-escaped.
 */
export function generateRejectionHtml(params: RejectionEmailParams): string {
  const playerName = escapeHtml(params.playerName)
  const reason = escapeHtml(params.reason)
  const { uploadUrl } = params

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(REJECTION_EMAIL_SUBJECT)}</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr><td align="center" style="padding: 40px 20px;">
      <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px;">
        <tr><td style="padding: 40px 40px 20px; text-align: center; background-color: #0b3d2e; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px;">APGC Golf</h1>
          <p style="margin: 10px 0 0; color: #d1fae5; font-size: 16px;">Bukti pembayaran perlu diperbaiki</p>
        </td></tr>
        <tr><td style="padding: 40px;">
          <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">Halo <strong>${playerName}</strong>,</p>
          <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">Kami tidak dapat mengonfirmasi pembayaran Anda dari bukti yang Anda kirimkan:</p>
          <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">${reason}</p>
          </div>
          <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">Silakan unggah bukti transfer yang benar melalui tautan di bawah ini.</p>
          <div style="text-align: center; margin: 8px 0 24px;">
            <a href="${uploadUrl}" style="display: inline-block; background-color: #0b3d2e; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Unggah bukti yang benar</a>
          </div>
          <p style="margin: 0; color: #6b7280; font-size: 13px;">Atau buka tautan ini: <a href="${uploadUrl}" style="color: #0b3d2e;">${uploadUrl}</a></p>
        </td></tr>
        <tr><td style="padding: 24px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; APGC Golf</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/**
 * Sends the rejection email. Returns {success:false} on failure (does not
 * throw) so the caller can SURFACE the failure to the admin (Story 9) rather
 * than swallow it.
 */
export async function sendRejectionEmail(
  params: RejectionEmailParams & { to: string },
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'Email service not configured' }
  }
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  try {
    const { data, error } = await resend.emails.send({
      from: `APGC Golf <${fromEmail}>`,
      to: [params.to],
      subject: REJECTION_EMAIL_SUBJECT,
      html: generateRejectionHtml(params),
    })
    if (error) {
      return { success: false, error: error.message }
    }
    console.log(`Rejection email sent. ID: ${data?.id}`)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
