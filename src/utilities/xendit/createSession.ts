import Xendit from 'xendit-node'
import type { Invoice } from 'xendit-node/invoice/models'

export type CreateInvoiceParams = {
  externalId: string
  amount: number
  currency?: string
  description: string
  customerName: string
  customerEmail: string
  successRedirectUrl: string
  failureRedirectUrl: string
}

/**
 * Create a Xendit Invoice using xendit-node SDK
 * See: https://developers.xendit.co/api-reference/invoices/create-invoice
 */
export async function createXenditInvoice(
  params: CreateInvoiceParams,
): Promise<Invoice> {
  const {
    externalId,
    amount,
    currency = 'IDR',
    description,
    customerName,
    customerEmail,
    successRedirectUrl,
    failureRedirectUrl,
  } = params

  const secretKey = process.env.XENDIT_SECRET_KEY
  if (!secretKey) {
    throw new Error('XENDIT_SECRET_KEY is not configured')
  }

  const xendit = new Xendit({ secretKey })

  const invoice = await xendit.Invoice.createInvoice({
    data: {
      externalId,
      amount,
      currency,
      description,
      payerEmail: customerEmail,
      customer: {
        givenNames: customerName,
        email: customerEmail,
      },
      successRedirectUrl,
      failureRedirectUrl,
      invoiceDuration: 86400, // 24 hours in seconds
    },
  })

  console.log('Created Xendit invoice:', invoice.id)

  return invoice
}
