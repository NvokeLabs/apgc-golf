import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utilities/whatsapp/sendWhatsAppNotification', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}))

import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { notifyContactSubmission } from '@/hooks/notifyContactSubmission'

const sendMock = vi.mocked(sendWhatsAppNotification)

describe('notifyContactSubmission', () => {
  beforeEach(() => sendMock.mockClear())

  it('sends a contact message on create with submission fields', async () => {
    const doc = {
      id: 3,
      submissionData: [
        { field: 'name', value: 'Rama' },
        { field: 'message', value: 'Tanya tiket' },
      ],
    }
    await notifyContactSubmission({
      doc,
      operation: 'create',
      req: {},
    } as unknown as Parameters<typeof notifyContactSubmission>[0])
    expect(sendMock).toHaveBeenCalledTimes(1)
    const msg = sendMock.mock.calls[0][0]
    expect(msg).toContain('Pesan Kontak Baru')
    expect(msg).toContain('Rama')
    expect(msg).toContain('Tanya tiket')
  })

  it('does nothing on update', async () => {
    await notifyContactSubmission({
      doc: { id: 3 },
      operation: 'update',
      req: {},
    } as unknown as Parameters<typeof notifyContactSubmission>[0])
    expect(sendMock).not.toHaveBeenCalled()
  })
})
