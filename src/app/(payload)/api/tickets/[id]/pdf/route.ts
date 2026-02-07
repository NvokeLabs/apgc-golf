import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderToBuffer } from '@react-pdf/renderer'
import { TicketPDF } from '@/components/TicketPDF/TicketPDF'
import type { Event, Ticket, EventRegistration } from '@/payload-types'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    // Fetch the ticket with related data
    const ticket = (await payload.findByID({
      collection: 'tickets',
      id,
      depth: 2,
    })) as Ticket & {
      registration: EventRegistration
      event: Event
    }

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const registration = ticket.registration as EventRegistration
    const event = ticket.event as Event

    if (!registration || !event) {
      return NextResponse.json({ error: 'Invalid ticket data' }, { status: 400 })
    }

    // Format date
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'TBD'

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      TicketPDF({
        playerName: registration.playerName,
        playerEmail: registration.email,
        category: registration.category || 'General',
        eventName: event.title,
        eventDate,
        eventLocation: event.location || 'TBD',
        ticketCode: ticket.ticketCode,
        qrCodeDataUrl: ticket.qrCodeData || '',
      }),
    )

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${ticket.ticketCode}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating ticket PDF:', error)
    return NextResponse.json({ error: 'Failed to generate ticket PDF' }, { status: 500 })
  }
}
