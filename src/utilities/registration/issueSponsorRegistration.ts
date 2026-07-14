import type { Payload } from 'payload'

import type { IssueTicketResult } from '@/utilities/ticketing/issueTicketForRegistration'

export type SponsorTicketDeps = {
  payload: Pick<Payload, 'create'>
  issueTicket: (payload: Payload, registrationId: number) => Promise<IssueTicketResult>
  /** Injectable clock; defaults to Date.now. */
  now?: () => number
}

export type SponsorTicketInput = {
  eventId: number
  sponsorId: number
  playerName: string
  email: string
  phone?: string
  category: 'general' | 'alumni'
  tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL'
  alumniClassYear?: number
  alumniMajor?: string
  notes?: string
  issuedById: number
}

export type SponsorTicketResult =
  | {
      success: true
      registrationId: number
      ticketId: number
      ticketCode: string
      emailSent: boolean
    }
  | { success: false; error: string }

/**
 * Issue a complimentary sponsor ticket.
 *
 * Collapses "create the registration" and "approve it" into one step: the
 * registration is written already paid at zero cost, attributed to a sponsor,
 * with no transfer proof and no upload token — there is nothing to pay and
 * nothing to upload. Ticket creation (code + QR + PDF + email) is delegated to
 * the shared idempotent utility, so the guest receives exactly the same ticket
 * as a paying registrant.
 *
 * No quota is enforced. A sponsor's ticket allowance follows from their tier as
 * a business agreement; the system only records who the ticket was issued under.
 *
 * Dependency-injected (payload + issueTicket) so it is unit-testable without a
 * DB or a mail provider.
 */
export async function issueSponsorRegistration(
  deps: SponsorTicketDeps,
  input: SponsorTicketInput,
): Promise<SponsorTicketResult> {
  const { payload, issueTicket } = deps
  const now = deps.now ?? Date.now

  const missing: string[] = []
  if (!input.eventId) missing.push('eventId')
  if (!input.sponsorId) missing.push('sponsorId')
  if (!input.playerName?.trim()) missing.push('playerName')
  if (!input.email?.trim()) missing.push('email')
  if (!input.tshirtSize) missing.push('tshirtSize')
  if (missing.length > 0) {
    return { success: false, error: `Missing required field(s): ${missing.join(', ')}` }
  }

  const timestamp = new Date(now()).toISOString()

  const registration = await payload.create({
    collection: 'event-registrations',
    overrideAccess: true,
    data: {
      event: input.eventId,
      sponsor: input.sponsorId,
      playerName: input.playerName.trim(),
      email: input.email.trim(),
      phone: input.phone ? `+62${input.phone.replace(/^0+/, '')}` : undefined,
      category: input.category,
      tshirtSize: input.tshirtSize,
      alumniClassYear: input.alumniClassYear,
      alumniMajor: input.alumniMajor || undefined,
      notes: input.notes || undefined,
      agreedToTerms: true,
      status: 'confirmed',
      paymentMethod: 'sponsor',
      paymentStatus: 'paid',
      amountDue: 0,
      amountPaid: 0,
      paidAt: timestamp,
      verifiedBy: input.issuedById,
      verifiedAt: timestamp,
    },
  })

  const issued = await issueTicket(payload as Payload, registration.id)

  return {
    success: true,
    registrationId: registration.id,
    ticketId: issued.ticket.id,
    ticketCode: issued.ticket.ticketCode,
    emailSent: issued.emailSent,
  }
}
