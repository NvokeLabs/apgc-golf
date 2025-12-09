import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Application Submitted | APGC Golf',
}

export default function SponsorRegistrationSuccessPage() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <GlassCard className="max-w-md p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">Application Submitted!</h1>

        <p className="mb-6 text-white/70">
          Thank you for your interest in partnering with APGC Golf. Our sponsorship
          team will review your application and contact you within 2-3 business days.
        </p>

        <div className="space-y-3">
          <Link
            href="/sponsors"
            className="block w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            View Current Sponsors
          </Link>
          <Link
            href="/"
            className="block w-full rounded-lg border border-white/10 py-3 font-semibold text-white transition-colors hover:bg-white/5"
          >
            Back to Home
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}
