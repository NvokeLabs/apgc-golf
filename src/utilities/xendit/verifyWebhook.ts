/**
 * Verify Xendit webhook callback token
 * @param callbackToken - The token from x-callback-token header
 * @returns true if the token is valid
 */
export function verifyXenditWebhook(callbackToken: string | null): boolean {
  const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN

  if (!webhookToken) {
    console.error('XENDIT_WEBHOOK_TOKEN is not configured')
    return false
  }

  if (!callbackToken) {
    console.error('No callback token provided in webhook request')
    return false
  }

  return callbackToken === webhookToken
}

/**
 * Xendit Invoice webhook payload
 * See: https://developers.xendit.co/api-reference/invoices/invoice-callback
 */
export type XenditInvoiceWebhookPayload = {
  id: string
  external_id: string
  user_id: string
  status: 'PAID' | 'EXPIRED' | 'PENDING' | 'FAILED'
  merchant_name: string
  amount: number
  paid_amount?: number
  bank_code?: string
  paid_at?: string
  payer_email?: string
  description?: string
  currency: string
  payment_method?: string
  payment_channel?: string
  payment_destination?: string
}

/**
 * Parse and validate Invoice webhook payload
 */
export function parseWebhookPayload(body: unknown): XenditInvoiceWebhookPayload | null {
  if (!body || typeof body !== 'object') {
    return null
  }

  const payload = body as Record<string, unknown>

  // Invoice webhooks use external_id
  if (!payload.id || !payload.external_id || !payload.status) {
    console.error('Invalid webhook payload: missing required fields', payload)
    return null
  }

  return payload as unknown as XenditInvoiceWebhookPayload
}
