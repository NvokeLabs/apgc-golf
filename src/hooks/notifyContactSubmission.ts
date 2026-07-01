import type { CollectionAfterChangeHook } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { buildContactMessage } from '@/utilities/whatsapp/messages'

type ContactSubmissionDoc = {
  id: number | string
  submissionData?: Array<{ field: string; value: unknown }>
}

export const notifyContactSubmission: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation !== 'create') return
  try {
    const baseUrl = process.env.BASE_URL || getServerSideURL()
    await sendWhatsAppNotification(buildContactMessage(doc as ContactSubmissionDoc, baseUrl))
  } catch (err) {
    console.error('Contact WhatsApp notify failed:', err instanceof Error ? err.message : err)
  }
}
