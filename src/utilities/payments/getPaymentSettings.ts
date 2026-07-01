import type { Payload } from 'payload'

export type PaymentSettings = {
  bankName: string
  accountNumber: string
  accountHolder: string
  instructions: string
  /** True only when the bank name, number and holder are all present. */
  configured: boolean
}

const asString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

/**
 * Reads the bank-transfer instructions from the `site-labels` global (Story 4).
 *
 * Degrades gracefully: a missing global, missing group, or any blank required
 * field yields `configured: false` rather than throwing, so the registration
 * confirmation/upload screen can show a safe fallback instead of breaking.
 */
export async function getPaymentSettings(payload: Payload): Promise<PaymentSettings> {
  let group: Record<string, unknown> = {}
  try {
    const global = (await payload.findGlobal({ slug: 'site-labels', depth: 0 })) as {
      paymentSettings?: Record<string, unknown>
    } | null
    group = global?.paymentSettings ?? {}
  } catch {
    group = {}
  }

  const bankName = asString(group.bankName)
  const accountNumber = asString(group.accountNumber)
  const accountHolder = asString(group.accountHolder)
  const instructions = asString(group.instructions)

  return {
    bankName,
    accountNumber,
    accountHolder,
    instructions,
    configured: Boolean(bankName && accountNumber && accountHolder),
  }
}
