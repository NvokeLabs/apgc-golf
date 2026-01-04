import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createXenditInvoice } from '@/utilities/xendit/createSession'
import type { Event, EventRegistration } from '@/payload-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { registrationId } = body

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Fetch the registration with event details
    const registration = await payload.findByID({
      collection: 'event-registrations',
      id: registrationId,
      depth: 1,
    }) as EventRegistration & { event: Event }

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 },
      )
    }

    // Check if already paid
    if (registration.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Registration already paid' },
        { status: 400 },
      )
    }

    const event = registration.event as Event

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 },
      )
    }

    // Determine price based on category
    const isAlumni = registration.category === 'alumni'
    const price = isAlumni && event.alumniPrice ? event.alumniPrice : (event.price || 0)

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Event price is not configured' },
        { status: 400 },
      )
    }

    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const eventSlug = event.slug || event.id

    // Create Xendit Invoice
    const invoice = await createXenditInvoice({
      externalId: `reg-${registration.id}`,
      amount: price,
      currency: 'IDR',
      description: `Registration for ${event.title}`,
      customerName: registration.playerName,
      customerEmail: registration.email,
      successRedirectUrl: `${baseUrl}/register/event/${eventSlug}/payment-success?registrationId=${registration.id}`,
      failureRedirectUrl: `${baseUrl}/register/event/${eventSlug}/payment-failed?registrationId=${registration.id}`,
    })

    // Update registration with invoice details
    await payload.update({
      collection: 'event-registrations',
      id: registrationId,
      data: {
        paymentStatus: 'pending',
        xenditSessionId: invoice.id,
        xenditCheckoutUrl: invoice.invoiceUrl,
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: invoice.invoiceUrl,
      invoiceId: invoice.id,
    })
  } catch (error) {
    console.error('Error creating payment invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create payment invoice' },
      { status: 500 },
    )
  }
}
