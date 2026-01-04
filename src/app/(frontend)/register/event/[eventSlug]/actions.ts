'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { createXenditInvoice } from '@/utilities/xendit/createSession'
import type { Event } from '@/payload-types'

export type RegistrationFormData = {
  eventId: number
  playerName: string
  email: string
  phone?: string
  category: 'alumni' | 'guest' | 'member' | 'vip'
  notes?: string
}

export type RegistrationResult = {
  success: boolean
  checkoutUrl?: string
  error?: string
}

/**
 * Server action to create registration and payment invoice
 * All sensitive operations happen server-side
 */
export async function createRegistrationWithPayment(
  data: RegistrationFormData
): Promise<RegistrationResult> {
  try {
    const payload = await getPayload({ config })

    // Fetch event details
    const event = await payload.findByID({
      collection: 'events',
      id: data.eventId,
      depth: 0,
    }) as Event

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    // Determine price based on category
    const isAlumni = data.category === 'alumni'
    const price = isAlumni && event.alumniPrice ? event.alumniPrice : (event.price || 0)

    if (price <= 0) {
      return { success: false, error: 'Event price is not configured' }
    }

    // Create registration
    const registration = await payload.create({
      collection: 'event-registrations',
      data: {
        event: data.eventId,
        playerName: data.playerName,
        email: data.email,
        phone: data.phone || undefined,
        category: data.category,
        notes: data.notes || undefined,
        agreedToTerms: true,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
    })

    // Create Xendit Invoice
    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const eventSlug = event.slug || event.id

    const invoice = await createXenditInvoice({
      externalId: `reg-${registration.id}`,
      amount: price,
      currency: 'IDR',
      description: `Registration for ${event.title}`,
      customerName: data.playerName,
      customerEmail: data.email,
      successRedirectUrl: `${baseUrl}/register/event/${eventSlug}/payment-success?registrationId=${registration.id}`,
      failureRedirectUrl: `${baseUrl}/register/event/${eventSlug}/payment-failed?registrationId=${registration.id}`,
    })

    // Update registration with invoice details
    await payload.update({
      collection: 'event-registrations',
      id: registration.id,
      data: {
        paymentStatus: 'pending',
        xenditSessionId: invoice.id,
        xenditCheckoutUrl: invoice.invoiceUrl,
      },
    })

    return {
      success: true,
      checkoutUrl: invoice.invoiceUrl,
    }
  } catch (error) {
    console.error('Error creating registration with payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process registration',
    }
  }
}
