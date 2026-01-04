import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export type TicketEmailParams = {
  to: string
  playerName: string
  eventName: string
  eventDate: string
  eventLocation: string
  ticketCode: string
  qrCodeDataUrl: string
  pdfBuffer?: Buffer
}

/**
 * Send ticket confirmation email with QR code and optional PDF attachment
 */
export async function sendTicketEmail(params: TicketEmailParams): Promise<{ success: boolean; error?: string }> {
  const {
    to,
    playerName,
    eventName,
    eventDate,
    eventLocation,
    ticketCode,
    qrCodeDataUrl,
    pdfBuffer,
  } = params

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured')
    return { success: false, error: 'Email service not configured' }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'tickets@apgc-golf.com'

  const attachments = pdfBuffer
    ? [
        {
          filename: `ticket-${ticketCode}.pdf`,
          content: pdfBuffer,
        },
      ]
    : []

  try {
    const { error } = await resend.emails.send({
      from: `APGC Golf <${fromEmail}>`,
      to: [to],
      subject: `Your Ticket for ${eventName}`,
      html: generateEmailHtml({
        playerName,
        eventName,
        eventDate,
        eventLocation,
        ticketCode,
        qrCodeDataUrl,
      }),
      attachments,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Failed to send email:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

function generateEmailHtml(params: {
  playerName: string
  eventName: string
  eventDate: string
  eventLocation: string
  ticketCode: string
  qrCodeDataUrl: string
}): string {
  const { playerName, eventName, eventDate, eventLocation, ticketCode, qrCodeDataUrl } = params

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Ticket for ${eventName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #059669; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">APGC Golf</h1>
              <p style="margin: 10px 0 0; color: #d1fae5; font-size: 16px;">Event Ticket Confirmation</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">Dear <strong>${playerName}</strong>,</p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px;">Your payment has been confirmed! Here is your ticket for the event.</p>

              <!-- Event Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600;">${eventName}</h2>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Date:</strong> ${eventDate}
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      <strong>Location:</strong> ${eventLocation}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- QR Code -->
              <div style="text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 16px; color: #374151; font-size: 14px; font-weight: 600;">Scan this QR code at check-in:</p>
                <img src="${qrCodeDataUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <p style="margin: 16px 0 0; color: #6b7280; font-size: 12px; font-family: monospace;">${ticketCode}</p>
              </div>

              <!-- Instructions -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Check-in Instructions:</strong><br>
                  Please present this QR code (from your phone or printed) at the event entrance. Each ticket can only be scanned once.
                </p>
              </div>

              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                If you have any questions, please contact us at <a href="mailto:info@apgc-golf.com" style="color: #059669;">info@apgc-golf.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; ${new Date().getFullYear()} APGC Golf. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
