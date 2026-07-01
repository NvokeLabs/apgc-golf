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
        <h1 className="text-xl font-bold text-[#0b3d2e]">Invalid upload link</h1>
        <p className="mt-2 text-[#636364]">This link is missing its access token.</p>
      </Shell>
    )
  }

  const verified = verifyUploadToken(token)
  if (!verified.valid) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-[#0b3d2e]">
          {verified.reason === 'expired' ? 'This link has expired' : 'Invalid upload link'}
        </h1>
        <p className="mt-2 text-[#636364]">
          {verified.reason === 'expired'
            ? 'Please contact us to complete your registration.'
            : 'This upload link could not be verified.'}
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
        <h1 className="text-xl font-bold text-[#0b3d2e]">Registration not found</h1>
        <p className="mt-2 text-[#636364]">We couldn&apos;t find this registration.</p>
      </Shell>
    )
  }

  // Already approved — read-only.
  if (registration.paymentStatus === 'paid') {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-[#0b3d2e]">Payment already confirmed</h1>
        <p className="mt-2 text-[#636364]">
          Your registration is confirmed and your ticket has been emailed to you.
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
      <h1 className="text-xl font-bold text-[#0b3d2e]">Complete your payment</h1>
      <p className="mt-2 text-[#636364]">
        Transfer the exact amount below, then upload your transfer proof. We&apos;ll verify it and
        email your ticket.
      </p>

      {registration.paymentStatus === 'rejected' && registration.rejectionReason && (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800">
          <span className="font-semibold">Your previous proof was rejected:</span>{' '}
          {registration.rejectionReason}
        </div>
      )}

      {isResubmit && (
        <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-800">
          Your proof is pending review. You may upload a replacement if needed.
        </div>
      )}

      <dl className="mt-6 space-y-3 rounded-lg bg-[#0b3d2e]/5 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-[#636364]">Amount</dt>
          <dd className="font-bold text-[#0b3d2e]">{formatPrice(amount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#636364]">Reference</dt>
          <dd className="font-mono font-semibold text-[#0b3d2e]">{reference}</dd>
        </div>
        {settings.configured ? (
          <>
            <div className="flex justify-between">
              <dt className="text-[#636364]">Bank</dt>
              <dd className="font-semibold text-[#0b3d2e]">{settings.bankName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#636364]">Account number</dt>
              <dd className="font-mono font-semibold text-[#0b3d2e]">{settings.accountNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#636364]">Account holder</dt>
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
            Bank transfer details will be provided by our team — please contact us.
          </p>
        )}
      </dl>

      <div className="mt-6">
        <UploadProofForm token={token} />
      </div>
    </Shell>
  )
}
