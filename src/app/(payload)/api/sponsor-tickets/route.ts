import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

import { issueSponsorRegistration } from '@/utilities/registration/issueSponsorRegistration'
import { issueTicketForRegistration } from '@/utilities/ticketing/issueTicketForRegistration'

/**
 * Admin endpoint to issue a complimentary sponsor ticket. Any authenticated
 * staff user (admin or registration-staff) may issue — they already run manual
 * transfers and check-in. No payment proof, no quota check.
 */
export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))

  const category = body.category === 'alumni' ? 'alumni' : 'general'
  const alumniClassYear =
    category === 'alumni' && body.alumniClassYear ? Number(body.alumniClassYear) : undefined

  const result = await issueSponsorRegistration(
    { payload, issueTicket: (p, id) => issueTicketForRegistration(p, id) },
    {
      eventId: Number(body.eventId),
      sponsorId: Number(body.sponsorId),
      playerName: String(body.playerName ?? ''),
      email: String(body.email ?? ''),
      phone: body.phone ? String(body.phone) : undefined,
      category,
      tshirtSize: body.tshirtSize,
      alumniClassYear,
      alumniMajor: category === 'alumni' && body.alumniMajor ? String(body.alumniMajor) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      issuedById: user.id,
    },
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
