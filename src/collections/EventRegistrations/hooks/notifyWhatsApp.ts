import type { CollectionAfterChangeHook } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { buildEventRegistrationMessage } from '@/utilities/whatsapp/messages'

async function resolveEventTitle(
  req: {
    payload?: {
      findByID: (args: {
        collection: string
        id: unknown
        depth?: number
      }) => Promise<{ title?: unknown } | null>
    }
  },
  event: unknown,
): Promise<string | undefined> {
  if (event && typeof event === 'object' && 'title' in event)
    return String((event as { title: unknown }).title)
  const id = typeof event === 'number' || typeof event === 'string' ? event : undefined
  if (id == null || !req.payload) return undefined
  try {
    const ev = await req.payload.findByID({ collection: 'events', id, depth: 0 })
    return ev?.title ? String(ev.title) : undefined
  } catch {
    return undefined
  }
}

export const notifyEventRegistration: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return
  try {
    const baseUrl = process.env.BASE_URL || getServerSideURL()
    const eventTitle = await resolveEventTitle(req as never, (doc as { event?: unknown }).event)
    const baseDoc = doc as {
      id: number | string
      playerName?: string
      category?: string
      paymentMethod?: string
    }
    await sendWhatsAppNotification(
      buildEventRegistrationMessage({ ...baseDoc, eventTitle }, baseUrl),
    )
  } catch (err) {
    console.error('Registration WhatsApp notify failed:', err instanceof Error ? err.message : err)
  }
}
