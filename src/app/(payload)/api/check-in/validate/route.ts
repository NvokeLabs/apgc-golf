import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Ticket, Event, EventRegistration } from '@/payload-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketCode, eventId } = body

    if (!ticketCode) {
      return NextResponse.json(
        { valid: false, reason: 'Ticket code is required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Find ticket by code
    const ticketResult = await payload.find({
      collection: 'tickets',
      where: {
        ticketCode: {
          equals: ticketCode,
        },
      },
      depth: 2,
      limit: 1,
    })

    if (ticketResult.docs.length === 0) {
      return NextResponse.json({
        valid: false,
        reason: 'Ticket not found',
      })
    }

    const ticket = ticketResult.docs[0] as Ticket & {
      event: Event
      registration: EventRegistration
    }

    // Check if ticket belongs to the selected event
    const ticketEventId = typeof ticket.event === 'object' ? ticket.event.id : ticket.event
    if (eventId && ticketEventId !== eventId) {
      const eventName = typeof ticket.event === 'object' ? ticket.event.title : 'another event'
      return NextResponse.json({
        valid: false,
        reason: `Ticket is for a different event: ${eventName}`,
      })
    }

    // Check if ticket is cancelled
    if (ticket.status === 'cancelled') {
      return NextResponse.json({
        valid: false,
        reason: 'Ticket has been cancelled',
      })
    }

    // Check if already checked in
    if (ticket.status === 'checked_in') {
      const checkedInTime = ticket.checkedInAt
        ? new Date(ticket.checkedInAt).toLocaleString()
        : 'previously'
      return NextResponse.json({
        valid: false,
        reason: `Already checked in at ${checkedInTime}`,
      })
    }

    // Get current user from request (if authenticated)
    // For now, we'll set checkedInBy based on request context
    const now = new Date().toISOString()

    // Update ticket status
    await payload.update({
      collection: 'tickets',
      id: ticket.id,
      data: {
        status: 'checked_in',
        checkedInAt: now,
      },
    })

    const registration = ticket.registration as EventRegistration
    const event = ticket.event as Event

    return NextResponse.json({
      valid: true,
      attendee: {
        name: registration.playerName,
        email: registration.email,
        category: registration.category,
      },
      event: {
        name: event.title,
        date: event.date,
      },
      status: 'checked_in',
      checkedInAt: now,
    })
  } catch (error) {
    console.error('Error validating ticket:', error)
    return NextResponse.json(
      { valid: false, reason: 'Failed to validate ticket' },
      { status: 500 },
    )
  }
}
