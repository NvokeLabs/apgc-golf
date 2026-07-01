import type { Payload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { buildTransferProofMessage } from '@/utilities/whatsapp/messages'

export async function notifyProofUploaded(
  payload: Pick<Payload, 'findByID'>,
  registrationId: number,
): Promise<void> {
  const baseUrl = process.env.BASE_URL || getServerSideURL()
  const reg = (await payload.findByID({
    collection: 'event-registrations',
    id: registrationId,
    depth: 0,
  })) as {
    id: number
    playerName?: string
    amountDue?: number | null
    event?: unknown
    tshirtSize?: string
  } | null
  if (!reg) return

  let eventTitle: string | undefined
  const ev = reg.event
  if (ev != null && (typeof ev === 'number' || typeof ev === 'string')) {
    try {
      const e = await payload.findByID({ collection: 'events', id: ev, depth: 0 })
      eventTitle = e?.title ? String(e.title) : undefined
    } catch {
      /* best-effort */
    }
  }

  await sendWhatsAppNotification(
    buildTransferProofMessage(
      {
        id: reg.id,
        playerName: reg.playerName,
        amountDue: reg.amountDue,
        eventTitle,
        tshirtSize: reg.tshirtSize,
      },
      baseUrl,
    ),
  )
}
