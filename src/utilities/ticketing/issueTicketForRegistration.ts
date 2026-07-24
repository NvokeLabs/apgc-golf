import type { Payload } from 'payload'
import type { Ticket, Event, EventRegistration } from '@/payload-types'
import { generateTicketCode as defaultGenerateTicketCode } from './generateTicketCode'
import { generateQRCode as defaultGenerateQRCode } from './generateQRCode'
import { sendTicketEmail as defaultSendTicketEmail } from '@/utilities/email/sendTicketEmail'
import { renderTicketPdf as defaultRenderTicketPdf } from './renderTicketPdf'
import type { RenderTicketPdfParams } from './renderTicketPdf'

export type IssueTicketDeps = {
  generateTicketCode: (registrationId: number | string) => string
  generateQRCode: (data: string) => Promise<string>
  renderTicketPdf: (params: RenderTicketPdfParams) => Promise<Buffer>
  sendTicketEmail: (params: {
    to: string
    playerName: string
    eventName: string
    eventDate: string
    eventLocation: string
    ticketCode: string
    qrCodeDataUrl: string
    pdfBuffer?: Buffer
  }) => Promise<{ success: boolean; error?: string }>
}

export type IssueTicketResult = {
  /** The ticket object (newly created or existing). */
  ticket: Ticket
  /** true if a ticket was already linked — no-op path, nothing created or emailed. */
  alreadyIssued: boolean
  /** false if the email send failed or was skipped (alreadyIssued). */
  emailSent: boolean
}

/**
 * Idempotent, email-safe ticket issuance.
 *
 * - Fetches the registration at depth:1 so `event` is an object and `ticket` is resolved.
 * - If `ticket` is already set (object or id), returns immediately with alreadyIssued:true.
 * - Otherwise: generates a ticket code + QR, creates the `tickets` record, links it to the
 *   registration, then sends the ticket email.
 * - If the email send fails (success:false) OR throws, it does NOT re-throw — it records
 *   ticketEmailSent:false on the registration and returns emailSent:false.
 *
 * Note: when the ticket link is already an id (not resolved), the function returns it as-is
 * without an extra fetch — callers that need the full object should fetch it separately.
 *
 * `deps` defaults to the three real helpers; tests may pass fakes.
 *
 * Does NOT call revalidatePath — that is the caller's responsibility.
 */
export async function issueTicketForRegistration(
  payload: Payload,
  registrationId: number | string,
  deps?: Partial<IssueTicketDeps>,
): Promise<IssueTicketResult> {
  const generateTicketCode = deps?.generateTicketCode ?? defaultGenerateTicketCode
  const generateQRCode = deps?.generateQRCode ?? defaultGenerateQRCode
  const renderTicketPdf = deps?.renderTicketPdf ?? defaultRenderTicketPdf
  const sendTicketEmail = deps?.sendTicketEmail ?? defaultSendTicketEmail

  // 1. Fetch registration (depth:1 resolves event + ticket)
  const registration = (await payload.findByID({
    collection: 'event-registrations',
    id: registrationId,
    depth: 1,
  })) as EventRegistration & { event: Event }

  // 2. Idempotency check — ticket already linked?
  if (registration.ticket != null) {
    const existingTicket = registration.ticket as Ticket | number
    let ticket: Ticket
    if (typeof existingTicket === 'object') {
      // Already a resolved Ticket object — return it directly, no extra fetch.
      ticket = existingTicket
    } else {
      // Bare id — fetch the full ticket record so callers get a real Ticket.
      ticket = (await payload.findByID({
        collection: 'tickets',
        id: existingTicket,
      })) as Ticket
    }
    return { ticket, alreadyIssued: true, emailSent: false }
  }

  // 3. Generate code + QR
  const ticketCode = generateTicketCode(registrationId)
  const qrCodeData = await generateQRCode(ticketCode)

  const event = registration.event as Event
  const eventId = typeof event === 'object' ? event.id : event

  // 4. Next sequential participant number for this event (printed on the ticket stub).
  // ponytail: read-then-write, not atomic — two simultaneous issuances could duplicate
  // a number; volumes here are one-at-a-time admin/webhook actions, so acceptable.
  const lastNumbered = await payload.find({
    collection: 'tickets',
    where: { event: { equals: eventId } },
    sort: '-ticketNumber',
    limit: 1,
  })
  const ticketNumber = (lastNumbered.docs[0]?.ticketNumber ?? 0) + 1

  // 5. Create ticket record
  const ticket = (await payload.create({
    collection: 'tickets',
    data: {
      ticketCode,
      ticketNumber,
      registration: Number(registrationId),
      event: eventId,
      qrCodeData,
      status: 'pending',
    },
  })) as Ticket

  // 6. Link ticket to registration
  await payload.update({
    collection: 'event-registrations',
    id: registrationId,
    data: {
      ticket: ticket.id,
    },
  })

  // 7. Build event date string (same logic as the webhook)
  const eventDate =
    typeof event === 'object' && event.date
      ? new Date(event.date).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'TBD'

  // 8. Render the ticket PDF (email-safe) and send the ticket email — never throw
  let emailSent = false
  try {
    let pdfBuffer: Buffer | undefined
    try {
      pdfBuffer = await renderTicketPdf({
        playerName: registration.playerName,
        category: registration.category,
        alumniMajor: registration.alumniMajor,
        alumniClassYear: registration.alumniClassYear,
        ticketNumber,
        qrCodeDataUrl: qrCodeData,
      })
    } catch (pdfErr) {
      const msg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr)
      console.error(`[issueTicketForRegistration] PDF render failed: ${msg}`)
      pdfBuffer = undefined
    }

    const emailResult = await sendTicketEmail({
      to: registration.email,
      playerName: registration.playerName,
      eventName: typeof event === 'object' ? event.title : String(event),
      eventDate,
      eventLocation: typeof event === 'object' ? event.location || 'TBD' : 'TBD',
      ticketCode,
      qrCodeDataUrl: qrCodeData,
      pdfBuffer,
    })
    emailSent = emailResult.success
    if (!emailSent) {
      console.error(`[issueTicketForRegistration] Email failed: ${emailResult.error}`)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[issueTicketForRegistration] Email threw: ${msg}`)
    emailSent = false
  }

  // 9. Persist email-sent status to the registration.
  // Wrapped in its own try/catch: the ticket has already been created and linked, so a
  // failure here must never surface to the caller.
  try {
    await payload.update({
      collection: 'event-registrations',
      id: registrationId,
      data: {
        ticketEmailSent: emailSent,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[issueTicketForRegistration] Failed to persist ticketEmailSent: ${msg}`)
  }

  return { ticket, alreadyIssued: false, emailSent }
}
