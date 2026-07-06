import { describe, it, expect } from 'vitest'
import {
  buildSponsorInquiryMessage,
  buildEventRegistrationMessage,
  buildContactMessage,
  buildTransferProofMessage,
} from '@/utilities/whatsapp/messages'

const BASE = 'https://www.polinemagolf.com'

describe('whatsapp message builders', () => {
  it('sponsor message has key fields + admin doc link', () => {
    const m = buildSponsorInquiryMessage(
      {
        id: 7,
        companyName: 'Acme',
        contactName: 'Budi',
        phone: '0812',
        email: 'b@acme.id',
        selectedTier: 'EAGLE',
      },
      BASE,
    )
    expect(m).toContain('Pengajuan Sponsor Baru')
    expect(m).toContain('Acme')
    expect(m).toContain('Budi')
    expect(m).toContain('EAGLE')
    expect(m).toContain(`${BASE}/admin/collections/sponsor-registrations/7`)
  })

  it('event registration message has ref + admin doc link', () => {
    const m = buildEventRegistrationMessage(
      {
        id: 20,
        playerName: 'Sita',
        category: 'alumni',
        paymentMethod: 'bank-transfer',
        eventTitle: 'Polinema Cup',
      },
      BASE,
    )
    expect(m).toContain('Pendaftaran Baru')
    expect(m).toContain('Sita')
    expect(m).toContain('Polinema Cup')
    expect(m).toContain('reg-20')
    expect(m).toContain(`${BASE}/admin/collections/event-registrations/20`)
  })

  it('contact message lists fields + links to the submission doc', () => {
    const m = buildContactMessage(
      {
        id: 3,
        submissionData: [
          { field: 'name', value: 'Rama' },
          { field: 'email', value: 'r@x.id' },
          { field: 'message', value: 'Tanya tiket' },
        ],
      },
      BASE,
    )
    expect(m).toContain('Pesan Kontak Baru')
    expect(m).toContain('Rama')
    expect(m).toContain('r@x.id')
    expect(m).toContain('Tanya tiket')
    expect(m).toContain(`${BASE}/admin/collections/form-submissions/3`)
  })

  it('contact message truncates an over-long value', () => {
    const long = 'x'.repeat(2000)
    const m = buildContactMessage(
      { id: 1, submissionData: [{ field: 'message', value: long }] },
      BASE,
    )
    expect(m.length).toBeLessThan(1200)
    expect(m).toContain('…')
  })

  it('transfer proof message has ref, IDR amount + manual-transfers link', () => {
    const m = buildTransferProofMessage(
      { id: 20, playerName: 'Sita', eventTitle: 'Polinema Cup', amountDue: 4000000 },
      BASE,
    )
    expect(m).toContain('Bukti Transfer Masuk')
    expect(m).toContain('reg-20')
    expect(m).toContain('4.000.000')
    expect(m).toContain(`${BASE}/admin/manual-transfers`)
  })

  it('builders degrade gracefully on missing fields (no "undefined")', () => {
    const m = buildTransferProofMessage({ id: 9 }, BASE)
    expect(m).not.toContain('undefined')
    expect(m).toContain('reg-9')
  })

  it('keeps the admin link even with several long fields', () => {
    const long = 'y'.repeat(600)
    const m = buildContactMessage(
      {
        id: 5,
        submissionData: [
          { field: 'name', value: long },
          { field: 'email', value: long },
          { field: 'message', value: long },
        ],
      },
      BASE,
    )
    expect(m).toContain(`${BASE}/admin/collections/form-submissions/5`)
  })

  it('transfer proof message includes tshirt size when present', () => {
    const m = buildTransferProofMessage(
      {
        id: 20,
        playerName: 'Sita',
        eventTitle: 'Polinema Cup',
        amountDue: 4000000,
        tshirtSize: 'L',
      },
      BASE,
    )
    expect(m).toContain('Ukuran kaos: L')
  })

  it('transfer proof message omits the tshirt line (no "undefined") when size is absent', () => {
    const m = buildTransferProofMessage({ id: 20, playerName: 'Sita' }, BASE)
    expect(m).not.toContain('Ukuran kaos')
    expect(m).not.toContain('undefined')
  })

  it('transfer proof message includes angkatan + jurusan when present', () => {
    const m = buildTransferProofMessage(
      {
        id: 20,
        playerName: 'Sita',
        eventTitle: 'Polinema Cup',
        amountDue: 4000000,
        alumniClassYear: 2015,
        alumniMajor: 'Teknik Sipil',
      },
      BASE,
    )
    expect(m).toContain('Angkatan: 2015')
    expect(m).toContain('Jurusan: Teknik Sipil')
  })

  it('omits angkatan + jurusan lines (no "undefined") when absent', () => {
    const m = buildTransferProofMessage({ id: 20, playerName: 'Sita' }, BASE)
    expect(m).not.toContain('Angkatan')
    expect(m).not.toContain('Jurusan')
    expect(m).not.toContain('undefined')
  })
})
