import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utilities/whatsapp/sendWhatsAppNotification', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true }),
}))

import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'
import { notifyProofUploaded } from '@/utilities/whatsapp/notifyProofUploaded'

const sendMock = vi.mocked(sendWhatsAppNotification)

describe('notifyProofUploaded', () => {
  beforeEach(() => sendMock.mockClear())

  it('fetches the registration + event and sends a transfer-proof message', async () => {
    const payload = {
      findByID: vi
        .fn()
        .mockResolvedValueOnce({ id: 20, playerName: 'Sita', amountDue: 4000000, event: 10 }) // event-registrations
        .mockResolvedValueOnce({ title: 'Polinema Cup' }), // events
    }
    await notifyProofUploaded(payload as never, 20)
    expect(sendMock).toHaveBeenCalledTimes(1)
    const msg = sendMock.mock.calls[0][0]
    expect(msg).toContain('reg-20')
    expect(msg).toContain('4.000.000')
    expect(msg).toContain('Polinema Cup')
  })

  it('includes the registration tshirt size in the message', async () => {
    const payload = {
      findByID: vi
        .fn()
        .mockResolvedValueOnce({
          id: 20,
          playerName: 'Sita',
          amountDue: 4000000,
          tshirtSize: 'XL',
          event: 10,
        })
        .mockResolvedValueOnce({ title: 'Polinema Cup' }),
    }
    await notifyProofUploaded(payload as never, 20)
    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock.mock.calls[0][0]).toContain('Ukuran kaos: XL')
  })

  it('includes the registration angkatan + jurusan in the message', async () => {
    const payload = {
      findByID: vi
        .fn()
        .mockResolvedValueOnce({
          id: 20,
          playerName: 'Sita',
          amountDue: 4000000,
          alumniClassYear: 2015,
          alumniMajor: 'Teknik Sipil',
          event: 10,
        })
        .mockResolvedValueOnce({ title: 'Polinema Cup' }),
    }
    await notifyProofUploaded(payload as never, 20)
    expect(sendMock).toHaveBeenCalledTimes(1)
    const msg = sendMock.mock.calls[0][0]
    expect(msg).toContain('Angkatan: 2015')
    expect(msg).toContain('Jurusan: Teknik Sipil')
  })
})
