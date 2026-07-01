import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utilities/whatsapp/sendWhatsAppNotification', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}))

import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { notifyEventRegistration } from '@/collections/EventRegistrations/hooks/notifyWhatsApp'

const sendMock = vi.mocked(sendWhatsAppNotification)

describe('notifyEventRegistration', () => {
  beforeEach(() => sendMock.mockClear())

  it('sends a registration message on create, resolving the event title', async () => {
    const req = { payload: { findByID: vi.fn().mockResolvedValue({ title: 'Polinema Cup' }) } }
    const doc = {
      id: 20,
      playerName: 'Sita',
      category: 'alumni',
      paymentMethod: 'bank-transfer',
      event: 10,
    }
    // @ts-expect-error partial hook args for unit test
    await notifyEventRegistration({ doc, operation: 'create', req })
    expect(sendMock).toHaveBeenCalledTimes(1)
    const msg = sendMock.mock.calls[0][0]
    expect(msg).toContain('reg-20')
    expect(msg).toContain('Sita')
    expect(msg).toContain('Polinema Cup')
  })

  it('does nothing on update', async () => {
    // @ts-expect-error partial hook args for unit test
    await notifyEventRegistration({ doc: { id: 1 }, operation: 'update', req: {} })
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('still sends (title omitted) if event lookup fails', async () => {
    const req = { payload: { findByID: vi.fn().mockRejectedValue(new Error('no')) } }
    // @ts-expect-error partial hook args for unit test
    await notifyEventRegistration({
      doc: { id: 5, playerName: 'X', event: 99 },
      operation: 'create',
      req,
    })
    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock.mock.calls[0][0]).toContain('reg-5')
  })
})
