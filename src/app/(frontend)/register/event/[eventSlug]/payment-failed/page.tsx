import type { Metadata } from 'next'
import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { GlassCard } from '@/components/golf'
import { getFormContent, getSiteLabels } from '@/utilities/getSiteContent'

export const metadata: Metadata = {
  title: 'Payment Failed | APGC Golf',
  description: 'Your payment could not be processed.',
}

type Props = {
  params: Promise<{ eventSlug: string }>
}

export default async function PaymentFailedPage({ params }: Props) {
  const { eventSlug } = await params
  const [formContent, labels] = await Promise.all([getFormContent(), getSiteLabels()])
  const errorContent = formContent?.errorMessages

  return (
    <div className="container flex min-h-[60vh] items-center justify-center pt-24 pb-16">
      <GlassCard className="max-w-lg p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          {errorContent?.paymentFailedTitle || 'Payment Failed'}
        </h1>

        <p className="mb-6 text-gray-600">
          {errorContent?.paymentFailedDescription ||
            'Unfortunately, your payment could not be processed. This may be due to insufficient funds, an expired card, or a temporary issue with the payment provider.'}
        </p>

        <div className="mb-8 rounded-lg bg-amber-50 p-4">
          <p className="text-sm text-amber-700">
            {errorContent?.paymentFailedSecondary ||
              'Your registration has been saved. You can try again with a different payment method or contact us if you continue to experience issues.'}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/register/event/${eventSlug}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4" />
            {labels?.buttonLabels?.tryAgain || 'Try Again'}
          </Link>

          <Link
            href="/events"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {labels?.navigationLabels?.backToEvents || 'Back to Events'}
          </Link>

          <p className="text-sm text-gray-500">
            {errorContent?.needHelpText || 'Need help?'}{' '}
            <a
              href={`mailto:${errorContent?.contactEmail || 'info@apgc-golf.com'}`}
              className="text-emerald-600 hover:underline"
            >
              {errorContent?.contactUsText || 'Contact us'}
            </a>
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
