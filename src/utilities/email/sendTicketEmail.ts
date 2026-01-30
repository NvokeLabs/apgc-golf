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
export async function sendTicketEmail(
  params: TicketEmailParams,
): Promise<{ success: boolean; error?: string }> {
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

  // In development, use Resend's test email if no verified domain is configured
  // For production, set RESEND_FROM_EMAIL to your verified domain email
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  // Convert base64 QR code data URL to buffer for inline attachment
  const qrCodeBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '')
  const qrCodeBuffer = Buffer.from(qrCodeBase64, 'base64')

  const attachments: Array<{
    filename: string
    content: Buffer | string
    contentId?: string
  }> = [
    {
      filename: 'qrcode.png',
      content: qrCodeBuffer,
      contentId: 'qrcode',
    },
  ]

  if (pdfBuffer) {
    attachments.push({
      filename: `ticket-${ticketCode}.pdf`,
      content: pdfBuffer,
    })
  }

  try {
    console.log(`Attempting to send email from: ${fromEmail} to: ${to}`)

    const { data, error } = await resend.emails.send({
      from: `APGC Golf <${fromEmail}>`,
      to: [to],
      subject: `Tiket Anda untuk ${eventName}`,
      html: generateEmailHtml({
        playerName,
        eventName,
        eventDate,
        eventLocation,
        ticketCode,
      }),
      attachments,
    })

    if (error) {
      console.error('Resend API error:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message }
    }

    console.log(`Email sent successfully. ID: ${data?.id}`)
    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to send email:', errorMessage, err)
    return { success: false, error: errorMessage }
  }
}

function generateEmailHtml(params: {
  playerName: string
  eventName: string
  eventDate: string
  eventLocation: string
  ticketCode: string
}): string {
  const { playerName, eventName, eventDate, eventLocation, ticketCode } = params

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiket Anda untuk ${eventName}</title>
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
              <p style="margin: 10px 0 0; color: #d1fae5; font-size: 16px;">Konfirmasi Tiket Acara</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">Yth. <strong>${playerName}</strong>,</p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px;">Pembayaran Anda telah dikonfirmasi! Berikut adalah tiket Anda untuk acara ini.</p>

              <!-- Event Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600;">${eventName}</h2>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Tanggal:</strong> ${eventDate}
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      <strong>Lokasi:</strong> ${eventLocation}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- QR Code -->
              <div style="text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 16px; color: #374151; font-size: 14px; font-weight: 600;">Pindai kode QR ini saat check-in:</p>
                <img src="cid:qrcode" alt="Kode QR Tiket" style="width: 200px; height: 200px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <p style="margin: 16px 0 0; color: #6b7280; font-size: 12px; font-family: monospace;">${ticketCode}</p>
              </div>

              <!-- Instructions -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Petunjuk Check-in:</strong><br>
                  Silakan tunjukkan kode QR ini (dari ponsel atau hasil cetak) di pintu masuk acara. Setiap tiket hanya dapat dipindai satu kali.
                </p>
              </div>

              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Jika Anda memiliki pertanyaan, silakan hubungi kami di <a href="mailto:admin@polinemagolf.com" style="color: #059669;">admin@polinemagolf.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; ${new Date().getFullYear()} APGC Golf. Hak cipta dilindungi.
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
