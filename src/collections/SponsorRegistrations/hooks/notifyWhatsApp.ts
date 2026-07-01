import type { CollectionAfterChangeHook } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { buildSponsorInquiryMessage } from '@/utilities/whatsapp/messages'

export const notifySponsorInquiry: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation !== 'create') return
  try {
    const baseUrl = process.env.BASE_URL || getServerSideURL()
    await sendWhatsAppNotification(
      buildSponsorInquiryMessage(
        doc as {
          id: number | string
          companyName?: string
          contactName?: string
          phone?: string
          email?: string
          selectedTier?: string
        },
        baseUrl,
      ),
    )
  } catch (err) {
    console.error('Sponsor WhatsApp notify failed:', err instanceof Error ? err.message : err)
  }
}
