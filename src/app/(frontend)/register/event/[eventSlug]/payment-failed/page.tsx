import type { Metadata } from 'next'
import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { GlassCard } from '@/components/golf'
import { Button } from '@/components/ui/button'
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

        <h1 className="mb-4 text-3xl font-bold text-[#0b3d2e] md:text-4xl">
          {errorContent?.paymentFailedTitle || 'Payment Failed'}
        </h1>

        <p className="mb-6 text-[#636364] text-lg">
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
          <Button asChild variant="brand" size="cta" className="w-full gap-2 font-semibold">
            <Link href={`/register/event/${eventSlug}`}>
              <RefreshCw className="h-4 w-4" />
              {labels?.buttonLabels?.tryAgain || 'Try Again'}
            </Link>
          </Button>

          <Button asChild variant="brandOutline" size="cta" className="w-full gap-2 font-medium">
            <Link href="/events">
              <ArrowLeft className="h-4 w-4" />
              {labels?.navigationLabels?.backToEvents || 'Back to Events'}
            </Link>
          </Button>

          <p className="text-sm text-[#636364]">
            {errorContent?.needHelpText || 'Need help?'}{' '}
            <a
              href={`mailto:${errorContent?.contactEmail || 'info@apgc-golf.com'}`}
              className="text-[#0b3d2e] hover:underline"
            >
              {errorContent?.contactUsText || 'Contact us'}
            </a>
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
