const idr = (n?: number | null): string =>
  typeof n === 'number'
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(n)
    : '-'

const dash = (v?: string | null): string => (v && String(v).trim() ? String(v) : '-')

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s
}

export function buildSponsorInquiryMessage(
  input: {
    id: number | string
    companyName?: string
    contactName?: string
    phone?: string
    email?: string
    selectedTier?: string
  },
  baseUrl: string,
): string {
  const contact = input.phone
    ? `${dash(input.contactName)} (${input.phone})`
    : dash(input.contactName)
  return [
    '🤝 Pengajuan Sponsor Baru',
    `Perusahaan: ${dash(input.companyName)}`,
    `Narahubung: ${contact}`,
    `Email: ${dash(input.email)}`,
    `Tier: ${dash(input.selectedTier)}`,
    `Lihat: ${baseUrl}/admin/collections/sponsor-registrations/${input.id}`,
  ].join('\n')
}

export function buildEventRegistrationMessage(
  input: {
    id: number | string
    playerName?: string
    category?: string
    paymentMethod?: string
    eventTitle?: string
  },
  baseUrl: string,
): string {
  return [
    '📝 Pendaftaran Baru',
    `Nama: ${dash(input.playerName)}`,
    `Acara: ${dash(input.eventTitle)}`,
    `Kategori: ${dash(input.category)}`,
    `Metode: ${dash(input.paymentMethod)}`,
    `Ref: reg-${input.id}`,
    `Lihat: ${baseUrl}/admin/collections/event-registrations/${input.id}`,
  ].join('\n')
}

export function buildContactMessage(
  input: { id: number | string; submissionData?: Array<{ field: string; value: unknown }> },
  baseUrl: string,
): string {
  const lines = (input.submissionData ?? []).map(
    ({ field, value }) => `${field}: ${truncate(String(value ?? ''), 500)}`,
  )
  const link = `Lihat: ${baseUrl}/admin/collections/form-submissions/${input.id}`
  const body = truncate(['📩 Pesan Kontak Baru', ...lines].join('\n'), 900)
  return `${body}\n${link}`
}

export function buildTransferProofMessage(
  input: {
    id: number | string
    playerName?: string
    eventTitle?: string
    amountDue?: number | null
    tshirtSize?: string
  },
  baseUrl: string,
): string {
  const lines = [
    '💸 Bukti Transfer Masuk',
    `Ref: reg-${input.id}`,
    `Nama: ${dash(input.playerName)}`,
    `Acara: ${dash(input.eventTitle)}`,
    `Nominal: ${idr(input.amountDue)}`,
  ]
  if (input.tshirtSize) lines.push(`Ukuran kaos: ${input.tshirtSize}`)
  lines.push(`Verifikasi: ${baseUrl}/admin/manual-transfers`)
  return lines.join('\n')
}
