import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, Handshake, ArrowRight } from 'lucide-react'
import { getFormContent, getSiteLabels } from '@/utilities/getSiteContent'

export const metadata: Metadata = {
  title: 'Pengajuan Terkirim | APGC Golf',
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
            {successContent?.sponsorApplicationTitle || 'Pengajuan Terkirim!'}
          </h1>

          <p className="text-[#636364] mb-8 leading-relaxed">
            {successContent?.sponsorApplicationDescription ||
              'Terima kasih atas minat Anda bermitra dengan APGC Golf. Tim sponsorship kami akan meninjau pengajuan Anda dan menghubungi Anda dalam 2-3 hari kerja.'}
          </p>

          <div className="bg-[#0b3d2e]/5 rounded-xl p-6 mb-8 border border-[#0b3d2e]/10">
            <div className="flex items-center justify-center gap-2 text-[#0b3d2e] mb-2">
              <Handshake className="w-5 h-5" />
              <span className="font-medium">
                {successContent?.sponsorWhatsNextTitle || 'Langkah Selanjutnya?'}
              </span>
            </div>
            <p className="text-sm text-[#636364]">
              {successContent?.sponsorWhatsNextDescription ||
                'Tim kami akan menghubungi Anda untuk membahas detail kemitraan, manfaat, dan menyusun paket sponsorship yang sesuai dengan kebutuhan Anda.'}
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild variant="brand" size="cta" className="w-full gap-2 font-bold">
              <Link href="/sponsors">
                {labels?.buttonLabels?.viewAll || 'Lihat Sponsor Saat Ini'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="brandOutline" size="cta" className="w-full font-medium">
              <Link href="/">{labels?.buttonLabels?.backToHome || 'Kembali ke Beranda'}</Link>
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
