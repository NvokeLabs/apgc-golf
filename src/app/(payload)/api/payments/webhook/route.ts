import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyXenditWebhook, parseWebhookPayload } from '@/utilities/xendit/verifyWebhook'
import { generateTicketCode } from '@/utilities/ticketing/generateTicketCode'
import { generateQRCode } from '@/utilities/ticketing/generateQRCode'
import { sendTicketEmail } from '@/utilities/email/sendTicketEmail'
import { revalidatePath } from 'next/cache'
import type { Event, EventRegistration } from '@/payload-types'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook token
    const callbackToken = request.headers.get('x-callback-token')
    if (!verifyXenditWebhook(callbackToken)) {
      console.error('Invalid webhook token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received webhook payload:', JSON.stringify(body, null, 2))

    const webhookPayload = parseWebhookPayload(body)

    if (!webhookPayload) {
      console.error('Invalid webhook payload')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { external_id, status, paid_amount, paid_at } = webhookPayload

    // Extract registration ID from external_id (format: reg-{id})
    const registrationId = external_id.replace('reg-', '')

    const payload = await getPayload({ config })

    // Fetch the registration
    const registration = (await payload.findByID({
      collection: 'event-registrations',
      id: registrationId,
      depth: 1,
    })) as EventRegistration & { event: Event }

    if (!registration) {
      console.error(`Registration not found: ${registrationId}`)
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Handle different statuses (Invoice uses PAID)
    if (status === 'PAID') {
      // Check if already processed (idempotency)
      if (registration.paymentStatus === 'paid') {
        console.log(`Registration ${registrationId} already processed`)
        return NextResponse.json({ success: true, message: 'Already processed' })
      }

      // Update registration to paid
      await payload.update({
        collection: 'event-registrations',
        id: registrationId,
        data: {
          paymentStatus: 'paid',
          amountPaid: paid_amount || 0,
          paidAt: paid_at || new Date().toISOString(),
        },
      })

      // Generate ticket
      const ticketCode = generateTicketCode(registrationId)
      const qrCodeData = await generateQRCode(ticketCode)

      const event = registration.event as Event

      // Create ticket record
      const ticket = await payload.create({
        collection: 'tickets',
        data: {
          ticketCode,
          registration: Number(registrationId),
          event: typeof event === 'object' ? event.id : event,
          qrCodeData: qrCodeData,
          status: 'pending',
        },
      })

      // Link ticket to registration
      await payload.update({
        collection: 'event-registrations',
        id: registrationId,
        data: {
          ticket: ticket.id,
        },
      })

      // Send ticket email
      const eventDate = event.date
        ? new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'TBD'

      console.log(`Sending ticket email to ${registration.email}...`)
      const emailResult = await sendTicketEmail({
        to: registration.email,
        playerName: registration.playerName,
        eventName: event.title,
        eventDate,
        eventLocation: event.location || 'TBD',
        ticketCode,
        qrCodeDataUrl: qrCodeData,
      })

      if (!emailResult.success) {
        console.error(`Failed to send ticket email: ${emailResult.error}`)
        // Continue processing - ticket was created, just email failed
      } else {
        console.log(`Ticket email sent successfully to ${registration.email}`)
      }

      // Revalidate event page so participant list updates immediately
      if (typeof event === 'object' && event.slug) {
        revalidatePath(`/events/${event.slug}`)
      }

      console.log(`Ticket generated for registration ${registrationId}`)
      return NextResponse.json({ success: true, ticketId: ticket.id })
    }

    if (status === 'EXPIRED') {
      await payload.update({
        collection: 'event-registrations',
        id: registrationId,
        data: {
          paymentStatus: 'expired',
        },
      })

      console.log(`Payment expired for registration ${registrationId}`)
      return NextResponse.json({ success: true, message: 'Marked as expired' })
    }

    if (status === 'FAILED') {
      await payload.update({
        collection: 'event-registrations',
        id: registrationId,
        data: {
          paymentStatus: 'failed',
        },
      })

      console.log(`Payment failed for registration ${registrationId}`)
      return NextResponse.json({ success: true, message: 'Marked as failed' })
    }

    // For other statuses, just acknowledge
    return NextResponse.json({ success: true, message: `Status ${status} acknowledged` })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}
