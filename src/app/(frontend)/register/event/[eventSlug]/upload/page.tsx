import { getPayload } from 'payload'
import config from '@payload-config'

import { verifyUploadToken } from '@/utilities/uploadToken'
import { getPaymentSettings } from '@/utilities/payments/getPaymentSettings'
import { resolveEventPrice } from '@/utilities/registration/resolveEventPrice'
import type { Event, EventRegistration } from '@/payload-types'
import { UploadProofForm } from './UploadProofForm'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ token?: string }>

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-[#0b3d2e]/10 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </main>
  )
}

export default async function UploadProofPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams

  if (!token) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-[#0b3d2e]">Tautan unggah tidak valid</h1>
        <p className="mt-2 text-[#636364]">Tautan ini tidak memiliki token akses.</p>
      </Shell>
    )
  }

  const verified = verifyUploadToken(token)
  if (!verified.valid) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-[#0b3d2e]">
          {verified.reason === 'expired'
            ? 'Tautan ini telah kedaluwarsa'
            : 'Tautan unggah tidak valid'}
        </h1>
        <p className="mt-2 text-[#636364]">
          {verified.reason === 'expired'
            ? 'Silakan hubungi kami untuk menyelesaikan pendaftaran Anda.'
            : 'Tautan unggah ini tidak dapat diverifikasi.'}
        </p>
      </Shell>
    )
  }

  const payload = await getPayload({ config })
  const registration = (await payload
    .findByID({ collection: 'event-registrations', id: verified.registrationId, depth: 1 })
    .catch(() => null)) as EventRegistration | null

  if (!registration) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-[#0b3d2e]">Pendaftaran tidak ditemukan</h1>
        <p className="mt-2 text-[#636364]">Kami tidak dapat menemukan pendaftaran ini.</p>
      </Shell>
    )
  }

  // Already approved — read-only.
  if (registration.paymentStatus === 'paid') {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-[#0b3d2e]">Pembayaran sudah dikonfirmasi</h1>
        <p className="mt-2 text-[#636364]">
          Pendaftaran Anda telah dikonfirmasi dan tiket Anda telah dikirim ke email Anda.
        </p>
      </Shell>
    )
  }

  const event = registration.event as Event
  // Prefer the amount snapshotted at registration; fall back to a live compute
  // for any registration created before amountDue existed.
  const amount = registration.amountDue ?? resolveEventPrice(event, registration.category)
  const reference = `reg-${registration.id}`
  const settings = await getPaymentSettings(payload)
  const isResubmit = registration.paymentStatus === 'awaiting-verification'

  return (
    <Shell>
      <h1 className="text-xl font-bold text-[#0b3d2e]">Selesaikan pembayaran Anda</h1>
      <p className="mt-2 text-[#636364]">
        Transfer sesuai nominal di bawah ini, lalu unggah bukti transfer Anda. Kami akan
        memverifikasinya dan mengirim tiket Anda melalui email.
      </p>

      {registration.paymentStatus === 'rejected' && registration.rejectionReason && (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800">
          <span className="font-semibold">Bukti transfer Anda sebelumnya ditolak:</span>{' '}
          {registration.rejectionReason}
        </div>
      )}

      {isResubmit && (
        <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-800">
          Bukti transfer Anda sedang ditinjau. Anda dapat mengunggah ulang jika diperlukan.
        </div>
      )}

      <dl className="mt-6 space-y-3 rounded-lg bg-[#0b3d2e]/5 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-[#636364]">Nominal</dt>
          <dd className="font-bold text-[#0b3d2e]">{formatPrice(amount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#636364]">Referensi</dt>
          <dd className="font-mono font-semibold text-[#0b3d2e]">{reference}</dd>
        </div>
        {settings.configured ? (
          <>
            <div className="flex justify-between">
              <dt className="text-[#636364]">Bank</dt>
              <dd className="font-semibold text-[#0b3d2e]">{settings.bankName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#636364]">Nomor rekening</dt>
              <dd className="font-mono font-semibold text-[#0b3d2e]">{settings.accountNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#636364]">Atas nama</dt>
              <dd className="font-semibold text-[#0b3d2e]">{settings.accountHolder}</dd>
            </div>
            {settings.instructions && (
              <p className="border-t border-[#0b3d2e]/10 pt-3 text-[#636364]">
                {settings.instructions}
              </p>
            )}
          </>
        ) : (
          <p className="text-[#636364]">
            Detail transfer bank akan diberikan oleh tim kami — silakan hubungi kami.
          </p>
        )}
      </dl>

      <div className="mt-6">
        <UploadProofForm token={token} />
      </div>
    </Shell>
  )
}
