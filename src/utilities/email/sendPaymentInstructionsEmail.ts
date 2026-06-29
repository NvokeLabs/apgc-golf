import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const PAYMENT_EMAIL_SUBJECT = 'Complete your payment — APGC Golf'

export type PaymentInstructionsParams = {
  playerName: string
  bankName: string
  accountNumber: string
  accountHolder: string
  instructions: string
  amount: number
  reference: string
  uploadUrl: string
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Builds the "Complete your payment" email body (Story 11). Always carries the
 * exact amount, reg-{id} reference and tokenized upload link; the bank block is
 * shown when configured, otherwise a contact fallback — so an unconfigured
 * Payment Settings global still produces a usable email.
 */
export function generatePaymentInstructionsHtml(params: PaymentInstructionsParams): string {
  const { bankName, accountNumber, accountHolder, instructions, amount, reference, uploadUrl } =
    params
  const playerName = escapeHtml(params.playerName)
  const bankConfigured = Boolean(bankName && accountNumber && accountHolder)

  const bankBlock = bankConfigured
    ? `
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
        <tr><td style="padding: 24px;">
          <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;"><strong>Bank:</strong> ${escapeHtml(bankName)}</p>
          <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;"><strong>Account number:</strong> ${escapeHtml(accountNumber)}</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Account holder:</strong> ${escapeHtml(accountHolder)}</p>
          ${instructions ? `<p style="margin: 12px 0 0; color: #6b7280; font-size: 14px;">${escapeHtml(instructions)}</p>` : ''}
        </td></tr>
      </table>`
    : `<p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">Our team will share the bank transfer details with you shortly.</p>`

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(PAYMENT_EMAIL_SUBJECT)}</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr><td align="center" style="padding: 40px 20px;">
      <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px;">
        <tr><td style="padding: 40px 40px 20px; text-align: center; background-color: #0b3d2e; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px;">APGC Golf</h1>
          <p style="margin: 10px 0 0; color: #d1fae5; font-size: 16px;">Complete your payment</p>
        </td></tr>
        <tr><td style="padding: 40px;">
          <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">Dear <strong>${playerName}</strong>,</p>
          <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">Thank you for registering. To confirm your spot, transfer the exact amount below and upload your transfer proof.</p>

          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0b3d2e0d; border-radius: 8px; margin-bottom: 24px;">
            <tr><td style="padding: 20px;">
              <p style="margin: 0 0 8px; color: #111827; font-size: 16px;"><strong>Amount:</strong> ${formatAmount(amount)}</p>
              <p style="margin: 0; color: #111827; font-size: 16px;"><strong>Reference:</strong> ${escapeHtml(reference)}</p>
            </td></tr>
          </table>

          ${bankBlock}

          <div style="text-align: center; margin: 8px 0 24px;">
            <a href="${uploadUrl}" style="display: inline-block; background-color: #0b3d2e; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Upload transfer proof</a>
          </div>
          <p style="margin: 0; color: #6b7280; font-size: 13px;">Or open this link: <a href="${uploadUrl}" style="color: #0b3d2e;">${uploadUrl}</a></p>
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
 * Sends the payment-instructions email. Non-fatal: returns {success:false}
 * instead of throwing so a send failure never breaks registration (Story 11).
 */
export async function sendPaymentInstructionsEmail(
  params: PaymentInstructionsParams & { to: string },
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured')
    return { success: false, error: 'Email service not configured' }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  try {
    const { data, error } = await resend.emails.send({
      from: `APGC Golf <${fromEmail}>`,
      to: [params.to],
      subject: PAYMENT_EMAIL_SUBJECT,
      html: generatePaymentInstructionsHtml(params),
    })

    if (error) {
      console.error('Resend API error (payment instructions):', JSON.stringify(error))
      return { success: false, error: error.message }
    }

    console.log(`Payment instructions email sent. ID: ${data?.id}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to send payment instructions email:', message)
    return { success: false, error: message }
  }
}
