import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react'
import { getFormContent, getSiteLabels } from '@/utilities/getSiteContent'

export const metadata: Metadata = {
  title: 'Pendaftaran Berhasil | APGC Golf',
}

export default async function EventRegistrationSuccessPage() {
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
            {successContent?.eventRegistrationTitle || 'Pendaftaran Berhasil!'}
          </h1>

          <p className="text-[#636364] mb-8 leading-relaxed">
            {successContent?.eventRegistrationDescription ||
              'Terima kasih telah mendaftar. Kami telah mengirim email konfirmasi berisi instruksi pembayaran ke alamat email Anda. Silakan periksa kotak masuk Anda.'}
          </p>

          <div className="bg-[#0b3d2e]/5 rounded-xl p-6 mb-8 border border-[#0b3d2e]/10">
            <div className="flex items-center justify-center gap-2 text-[#0b3d2e] mb-2">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                {successContent?.whatsNextTitle || 'Langkah Selanjutnya?'}
              </span>
            </div>
            <p className="text-sm text-[#636364]">
              {successContent?.whatsNextDescription ||
                'Selesaikan pembayaran Anda dalam 48 jam untuk mengamankan tempat Anda. Anda akan menerima konfirmasi akhir setelah pembayaran diverifikasi.'}
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild variant="brand" size="cta" className="w-full gap-2 font-bold">
              <Link href="/events">
                {labels?.buttonLabels?.viewAllEvents || 'Lihat Acara Lainnya'}
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
