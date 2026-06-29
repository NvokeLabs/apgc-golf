import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

import { approveTransfer } from '@/utilities/registration/approveTransfer'
import { issueTicketForRegistration } from '@/utilities/ticketing/issueTicketForRegistration'

/**
 * Admin endpoint to approve a manual transfer (Story 8). Authenticated admin
 * only. Delegates to the shared approveTransfer core (idempotent ticket issue).
 */
export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const registrationId = Number(body.registrationId)
  const amountPaid = Number(body.amountPaid)

  if (!registrationId || Number.isNaN(amountPaid) || amountPaid < 0) {
    return NextResponse.json(
      { success: false, error: 'registrationId and a valid amountPaid are required' },
      { status: 400 },
    )
  }

  const result = await approveTransfer(
    { payload, issueTicket: (p, id) => issueTicketForRegistration(p, id) },
    { registrationId, amountPaid, verifiedById: user.id },
  )

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  try {
    revalidatePath('/events')
  } catch {
    // best-effort cache refresh
  }

  return NextResponse.json(result)
}
