import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import Link from 'next/link'
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Registration Successful | APGC Golf',
}

export default function EventRegistrationSuccessPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-6 max-w-lg">
        <GlassCard className="p-12 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#0b3d2e]/10 border-2 border-[#0b3d2e]/20">
            <CheckCircle className="h-10 w-10 text-[#0b3d2e]" />
          </div>

          <h1 className="text-3xl font-serif italic text-[#0b3d2e] mb-4">
            Registration Successful!
          </h1>

          <p className="text-[#636364] mb-8 leading-relaxed">
            Thank you for registering. We have sent a confirmation email with payment
            instructions to your email address. Please check your inbox.
          </p>

          <div className="bg-[#0b3d2e]/5 rounded-xl p-6 mb-8 border border-[#0b3d2e]/10">
            <div className="flex items-center justify-center gap-2 text-[#0b3d2e] mb-2">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">What&apos;s Next?</span>
            </div>
            <p className="text-sm text-[#636364]">
              Complete your payment within 48 hours to secure your spot.
              You&apos;ll receive a final confirmation once payment is verified.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/events"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#0b3d2e] py-4 font-bold text-white transition-colors hover:bg-[#091f18] shadow-lg"
            >
              View More Events
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="block w-full rounded-xl border border-[#0b3d2e]/20 py-4 font-medium text-[#0b3d2e] transition-colors hover:bg-[#0b3d2e]/5"
            >
              Back to Home
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
