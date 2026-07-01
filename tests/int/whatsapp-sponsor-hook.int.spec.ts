import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utilities/whatsapp/sendWhatsAppNotification', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}))

import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { notifySponsorInquiry } from '@/collections/SponsorRegistrations/hooks/notifyWhatsApp'

const sendMock = vi.mocked(sendWhatsAppNotification)

describe('notifySponsorInquiry', () => {
  beforeEach(() => sendMock.mockClear())

  it('sends a sponsor message on create', async () => {
    const doc = {
      id: 7,
      companyName: 'Acme',
      contactName: 'Budi',
      email: 'b@acme.id',
      selectedTier: 'EAGLE',
    }
    await notifySponsorInquiry({
      doc,
      operation: 'create',
      req: {},
    } as unknown as Parameters<typeof notifySponsorInquiry>[0])
    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock.mock.calls[0][0]).toContain('Acme')
    expect(sendMock.mock.calls[0][0]).toContain('Pengajuan Sponsor Baru')
  })

  it('does nothing on update', async () => {
    await notifySponsorInquiry({
      doc: { id: 7 },
      operation: 'update',
      req: {},
    } as unknown as Parameters<typeof notifySponsorInquiry>[0])
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('never throws even if the sender rejects', async () => {
    sendMock.mockRejectedValueOnce(new Error('boom'))
    await expect(
      notifySponsorInquiry({
        doc: { id: 1 },
        operation: 'create',
        req: {},
      } as unknown as Parameters<typeof notifySponsorInquiry>[0]),
    ).resolves.toBeUndefined()
  })
})
