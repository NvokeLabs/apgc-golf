import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import Link from 'next/link'
import { CheckCircle, Handshake, ArrowRight } from 'lucide-react'
import { getFormContent, getSiteLabels } from '@/utilities/getSiteContent'

export const metadata: Metadata = {
  title: 'Application Submitted | APGC Golf',
}

export default async function SponsorRegistrationSuccessPage() {
  const [formContent, labels] = await Promise.all([getFormContent(), getSiteLabels()])
  const successContent = formContent?.successMessages

  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-6 max-w-lg">
        <GlassCard className="p-12 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#0b3d2e]/10 border-2 border-[#0b3d2e]/20">
            <CheckCircle className="h-10 w-10 text-[#0b3d2e]" />
          </div>

          <h1 className="text-3xl font-serif italic text-[#0b3d2e] mb-4">
            {successContent?.sponsorApplicationTitle || 'Application Submitted!'}
          </h1>

          <p className="text-[#636364] mb-8 leading-relaxed">
            {successContent?.sponsorApplicationDescription ||
              'Thank you for your interest in partnering with APGC Golf. Our sponsorship team will review your application and contact you within 2-3 business days.'}
          </p>

          <div className="bg-[#0b3d2e]/5 rounded-xl p-6 mb-8 border border-[#0b3d2e]/10">
            <div className="flex items-center justify-center gap-2 text-[#0b3d2e] mb-2">
              <Handshake className="w-5 h-5" />
              <span className="font-medium">
                {successContent?.sponsorWhatsNextTitle || "What's Next?"}
              </span>
            </div>
            <p className="text-sm text-[#636364]">
              {successContent?.sponsorWhatsNextDescription ||
                'Our team will reach out to discuss partnership details, benefits, and customize a sponsorship package that fits your needs.'}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/sponsors"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#0b3d2e] py-4 font-bold text-white transition-colors hover:bg-[#091f18] shadow-lg"
            >
              {labels?.buttonLabels?.viewAll || 'View Current Sponsors'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="block w-full rounded-xl border border-[#0b3d2e]/20 py-4 font-medium text-[#0b3d2e] transition-colors hover:bg-[#0b3d2e]/5"
            >
              {labels?.buttonLabels?.backToHome || 'Back to Home'}
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
