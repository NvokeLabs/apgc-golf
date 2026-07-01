import type { Payload } from 'payload'

import type { IssueTicketResult } from '@/utilities/ticketing/issueTicketForRegistration'

export type ApproveTransferDeps = {
  payload: Pick<Payload, 'findByID' | 'update'>
  issueTicket: (payload: Payload, registrationId: number) => Promise<IssueTicketResult>
  /** Injectable clock; defaults to Date.now. */
  now?: () => number
}

export type ApproveTransferInput = {
  registrationId: number
  amountPaid: number
  verifiedById: number
}

export type ApproveTransferResult =
  | { success: true; ticketId: number; alreadyIssued: boolean; emailSent: boolean }
  | { success: false; error: string }

/**
 * Story 8 — approve a manual transfer and issue the ticket.
 *
 * Marks the registration paid/confirmed and records who/when verified + the
 * amount paid, then defers ticket creation to the shared idempotent utility
 * (Story 2). Re-approving an already-paid registration is a no-op write that
 * still returns the existing ticket — no double issue, no metadata rewrite.
 */
export async function approveTransfer(
  deps: ApproveTransferDeps,
  input: ApproveTransferInput,
): Promise<ApproveTransferResult> {
  const { payload, issueTicket } = deps
  const now = deps.now ?? Date.now

  const registration = (await payload.findByID({
    collection: 'event-registrations',
    id: input.registrationId,
    depth: 0,
  })) as { id: number; paymentStatus?: string | null } | null

  if (!registration) {
    return { success: false, error: 'Registration not found' }
  }

  // Already approved — ensure the ticket exists (idempotent) without rewriting
  // the verification metadata.
  if (registration.paymentStatus === 'paid') {
    const issued = await issueTicket(payload as Payload, input.registrationId)
    return {
      success: true,
      ticketId: issued.ticket.id,
      alreadyIssued: true,
      emailSent: issued.emailSent,
    }
  }

  const timestamp = new Date(now()).toISOString()

  await payload.update({
    collection: 'event-registrations',
    id: input.registrationId,
    overrideAccess: true,
    data: {
      paymentStatus: 'paid',
      status: 'confirmed',
      amountPaid: input.amountPaid,
      paidAt: timestamp,
      verifiedBy: input.verifiedById,
      verifiedAt: timestamp,
    },
  })

  const issued = await issueTicket(payload as Payload, input.registrationId)

  return {
    success: true,
    ticketId: issued.ticket.id,
    alreadyIssued: issued.alreadyIssued,
    emailSent: issued.emailSent,
  }
}
