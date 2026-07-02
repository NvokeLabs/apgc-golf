'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { createXenditInvoice } from '@/utilities/xendit/createSession'
import { issueManualRegistration } from '@/utilities/registration/issueManualRegistration'
import { mintUploadToken } from '@/utilities/uploadToken'
import { getPaymentSettings } from '@/utilities/payments/getPaymentSettings'
import { sendPaymentInstructionsEmail } from '@/utilities/email/sendPaymentInstructionsEmail'
import type { Event } from '@/payload-types'

export type RegistrationFormData = {
  eventId: number
  playerName: string
  email: string
  phone?: string
  category: 'general' | 'alumni'
  tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL'
  notes?: string
  /**
   * Launch is manual-transfer only; defaults to 'bank-transfer'. The 'xendit'
   * branch is retained in the repo but not reachable from the UI yet.
   */
  paymentMethod?: 'bank-transfer' | 'xendit'
}

export type RegistrationResult = {
  success: boolean
  error?: string
  /** Xendit path. */
  checkoutUrl?: string
  /** Manual-transfer path: signed token + the new registration id + price. */
  uploadToken?: string
  registrationId?: number
  amount?: number
}

/**
 * Server action to create a registration. At launch this creates a manual
 * bank-transfer registration (no payment gateway) and returns a signed upload
 * token; the caller builds the tokenized upload link. The legacy Xendit branch
 * is kept for when the gateway is enabled.
 */
export async function createRegistrationWithPayment(
  data: RegistrationFormData,
): Promise<RegistrationResult> {
  try {
    const payload = await getPayload({ config })

    // T-shirt size is required for registrants; the form enforces it client-side,
    // but re-check on the server so a JS-bypassed or non-form caller can't create
    // a registration without a size.
    if (!data.tshirtSize) {
      return { success: false, error: 'Ukuran kaos wajib dipilih' }
    }

    const method = data.paymentMethod ?? 'bank-transfer'

    if (method === 'bank-transfer') {
      const result = await issueManualRegistration(
        { payload, mintToken: mintUploadToken },
        {
          eventId: data.eventId,
          playerName: data.playerName,
          email: data.email,
          phone: data.phone,
          category: data.category,
          tshirtSize: data.tshirtSize,
          notes: data.notes,
        },
      )
      if (!result.success) {
        return { success: false, error: result.error }
      }

      // Send the "complete your payment" email with bank details + upload link.
      // Non-fatal: a send failure must not break registration — the on-screen
      // redirect still shows the same instructions and link.
      try {
        const baseUrl =
          process.env.BASE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        const uploadUrl = `${baseUrl}/register/event/${result.eventSlug}/upload?token=${encodeURIComponent(
          result.uploadToken,
        )}`
        const settings = await getPaymentSettings(payload)
        await sendPaymentInstructionsEmail({
          to: data.email,
          playerName: data.playerName,
          bankName: settings.bankName,
          accountNumber: settings.accountNumber,
          accountHolder: settings.accountHolder,
          instructions: settings.instructions,
          amount: result.amount,
          reference: `reg-${result.registrationId}`,
          uploadUrl,
        })
      } catch (emailErr) {
        console.error('Failed to send payment instructions email:', emailErr)
      }

      return {
        success: true,
        registrationId: result.registrationId,
        uploadToken: result.uploadToken,
        amount: result.amount,
      }
    }

    // --- Legacy Xendit path (not reached from the UI at launch) ---

    // Fetch event details
    const event = (await payload.findByID({
      collection: 'events',
      id: data.eventId,
      depth: 0,
    })) as Event

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    // Determine price based on category
    const isAlumni = data.category === 'alumni'
    const price = isAlumni && event.alumniPrice ? event.alumniPrice : event.price || 0

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
        phone: data.phone ? `+62${data.phone.replace(/^0+/, '')}` : undefined,
        category: data.category,
        tshirtSize: data.tshirtSize,
        notes: data.notes || undefined,
        agreedToTerms: true,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
    })

    // Create Xendit Invoice
    const baseUrl =
      process.env.BASE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
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
