import type { Payload } from 'payload'

import type { Event } from '@/payload-types'
import { resolveEventPrice } from './resolveEventPrice'

const DAY_MS = 86_400_000
/** Days after the event date that the upload link stays valid (Story 3 TTL). */
export const DEFAULT_TOKEN_BUFFER_DAYS = 3

export type ManualRegistrationInput = {
  eventId: number
  playerName: string
  email: string
  phone?: string
  category: 'general' | 'alumni'
  notes?: string
}

export type ManualRegistrationDeps = {
  payload: Pick<Payload, 'findByID' | 'create'>
  mintToken: (registrationId: number, expiresAt: number) => string
  /** Defaults to DEFAULT_TOKEN_BUFFER_DAYS. */
  bufferDays?: number
}

export type ManualRegistrationResult =
  | {
      success: true
      registrationId: number
      uploadToken: string
      expiresAt: number
      amount: number
    }
  | { success: false; error: string }

/**
 * Story 5 — create a manual bank-transfer registration (no Xendit).
 *
 * Prices by category, persists the registration as `bank-transfer` /
 * `awaiting-payment`, and mints a signed upload token (Story 3) whose expiry is
 * derived from the event's end/start date plus a buffer. Returns the token +
 * amount so the caller can show bank instructions and a tokenized upload link.
 *
 * Dependency-injected (payload + token minter) so it is unit-testable without a
 * DB or the payment gateway.
 */
export async function issueManualRegistration(
  deps: ManualRegistrationDeps,
  input: ManualRegistrationInput,
): Promise<ManualRegistrationResult> {
  const { payload, mintToken } = deps
  const bufferDays = deps.bufferDays ?? DEFAULT_TOKEN_BUFFER_DAYS

  const event = (await payload.findByID({
    collection: 'events',
    id: input.eventId,
    depth: 0,
  })) as Event | null

  if (!event) {
    return { success: false, error: 'Event not found' }
  }

  const amount = resolveEventPrice(event, input.category)

  if (amount <= 0) {
    return { success: false, error: 'Event price is not configured' }
  }

  // TTL anchored on the event's last day so the link stays usable up to (and a
  // little past) the event. endDate when present, else the start date.
  const baseDate = event.endDate || event.date
  const expiresAt = new Date(baseDate).getTime() + bufferDays * DAY_MS

  const registration = await payload.create({
    collection: 'event-registrations',
    data: {
      event: input.eventId,
      playerName: input.playerName,
      email: input.email,
      phone: input.phone ? `+62${input.phone.replace(/^0+/, '')}` : undefined,
      category: input.category,
      notes: input.notes || undefined,
      agreedToTerms: true,
      status: 'pending',
      paymentMethod: 'bank-transfer',
      paymentStatus: 'awaiting-payment',
    },
  })

  const uploadToken = mintToken(registration.id, expiresAt)

  return { success: true, registrationId: registration.id, uploadToken, expiresAt, amount }
}
