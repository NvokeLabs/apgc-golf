import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { rejectTransfer } from '@/utilities/registration/rejectTransfer'
import { mintUploadToken } from '@/utilities/uploadToken'
import { sendRejectionEmail } from '@/utilities/email/sendRejectionEmail'

/**
 * Admin endpoint to reject a manual transfer (Story 9). Authenticated admin
 * only. Records the reason, issues no ticket, emails a re-upload link. The
 * email result is returned so the UI can surface a send failure.
 */
export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const registrationId = Number(body.registrationId)
  const rejectionReason = String(body.rejectionReason || '')

  if (!registrationId) {
    return NextResponse.json(
      { success: false, error: 'registrationId is required' },
      { status: 400 },
    )
  }

  const baseUrl =
    process.env.BASE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  const result = await rejectTransfer(
    { payload, mintToken: mintUploadToken, sendRejectionEmail, baseUrl },
    { registrationId, rejectionReason },
  )

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}
