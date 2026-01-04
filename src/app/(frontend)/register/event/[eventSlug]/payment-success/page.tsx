import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/golf'

export const metadata: Metadata = {
  title: 'Payment Successful | APGC Golf',
  description: 'Your payment has been processed successfully.',
}

export default function PaymentSuccessPage() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center pt-24 pb-16">
      <GlassCard className="max-w-lg p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900">Payment Successful!</h1>

        <p className="mb-6 text-gray-600">
          Thank you for your registration. Your payment has been processed successfully.
        </p>

        <div className="mb-8 rounded-lg bg-emerald-50 p-4">
          <div className="flex items-center justify-center gap-2 text-emerald-700">
            <Mail className="h-5 w-5" />
            <span className="font-medium">Check your email</span>
          </div>
          <p className="mt-2 text-sm text-emerald-600">
            Your ticket with QR code has been sent to your email address. Please present it at the
            event for check-in.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/events"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Browse More Events
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/"
            className="block text-sm text-gray-500 hover:text-gray-700"
          >
            Return to Home
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}
