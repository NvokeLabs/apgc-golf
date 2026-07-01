import type { Payload } from 'payload'

const DAY_MS = 86_400_000
export const DEFAULT_TOKEN_BUFFER_DAYS = 3

export type RejectTransferDeps = {
  payload: Pick<Payload, 'findByID' | 'update'>
  mintToken: (registrationId: number, expiresAt: number) => string
  sendRejectionEmail: (args: {
    to: string
    playerName: string
    reason: string
    uploadUrl: string
  }) => Promise<{ success: boolean; error?: string }>
  baseUrl: string
  bufferDays?: number
}

export type RejectTransferInput = {
  registrationId: number
  rejectionReason: string
}

export type RejectTransferResult =
  | { success: true; emailSent: boolean; emailError?: string }
  | { success: false; error: string }

type RegistrationWithEvent = {
  id: number
  email: string
  playerName: string
  event: { slug?: string | null; date?: string | null; endDate?: string | null } | number | null
}

/**
 * Story 9 — reject a manual transfer.
 *
 * Records the rejection reason, issues NO ticket, and emails the registrant the
 * reason plus a fresh signed re-upload link (same tokenized upload page). The
 * email result is returned so the caller can surface a send failure to the
 * admin rather than swallow it.
 */
export async function rejectTransfer(
  deps: RejectTransferDeps,
  input: RejectTransferInput,
): Promise<RejectTransferResult> {
  const { payload, mintToken, sendRejectionEmail, baseUrl } = deps
  const bufferDays = deps.bufferDays ?? DEFAULT_TOKEN_BUFFER_DAYS

  const reason = input.rejectionReason.trim()
  if (!reason) {
    return { success: false, error: 'A rejection reason is required' }
  }

  const registration = (await payload.findByID({
    collection: 'event-registrations',
    id: input.registrationId,
    depth: 1,
  })) as RegistrationWithEvent | null

  if (!registration) {
    return { success: false, error: 'Registration not found' }
  }

  await payload.update({
    collection: 'event-registrations',
    id: input.registrationId,
    overrideAccess: true,
    data: {
      paymentStatus: 'rejected',
      rejectionReason: reason,
    },
  })

  const event =
    typeof registration.event === 'object' && registration.event ? registration.event : {}
  const slug = ('slug' in event && event.slug) || String(input.registrationId)
  const baseDate = ('endDate' in event && event.endDate) || ('date' in event && event.date) || ''
  const expiresAt = new Date(baseDate).getTime() + bufferDays * DAY_MS

  const token = mintToken(input.registrationId, expiresAt)
  const uploadUrl = `${baseUrl}/register/event/${slug}/upload?token=${encodeURIComponent(token)}`

  const email = await sendRejectionEmail({
    to: registration.email,
    playerName: registration.playerName,
    reason,
    uploadUrl,
  })

  return { success: true, emailSent: email.success, emailError: email.error }
}
