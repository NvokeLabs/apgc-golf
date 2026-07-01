import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/golf'
import { Button } from '@/components/ui/button'
import { getFormContent, getSiteLabels } from '@/utilities/getSiteContent'

export const metadata: Metadata = {
  title: 'Pembayaran Berhasil | APGC Golf',
  description: 'Pembayaran Anda telah berhasil diproses.',
}

type Args = {
  params: Promise<{ eventSlug: string }>
}

export default async function PaymentSuccessPage({ params }: Args) {
  const { eventSlug } = await params
  const [formContent, labels] = await Promise.all([getFormContent(), getSiteLabels()])
  const successContent = formContent?.successMessages

  return (
    <div className="container flex min-h-[60vh] items-center justify-center pt-24 pb-16">
      <GlassCard className="max-w-lg p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#0b3d2e]/10 border-2 border-[#0b3d2e]/20">
          <CheckCircle className="h-10 w-10 text-[#0b3d2e]" />
        </div>

        <h1 className="mb-4 text-3xl font-bold text-[#0b3d2e] md:text-4xl">
          {successContent?.paymentSuccessTitle || 'Pembayaran Berhasil!'}
        </h1>

        <p className="mb-6 text-[#636364] text-lg">
          {successContent?.paymentSuccessDescription ||
            'Terima kasih atas pendaftaran Anda. Pembayaran Anda telah berhasil diproses.'}
        </p>

        <div className="mb-8 rounded-lg bg-[#0b3d2e]/5 p-4 border border-[#0b3d2e]/10">
          <div className="flex items-center justify-center gap-2 text-[#0b3d2e]">
            <Mail className="h-5 w-5" />
            <span className="font-medium">
              {successContent?.checkEmailTitle || 'Periksa email Anda'}
            </span>
          </div>
          <p className="mt-2 text-sm text-[#636364]">
            {successContent?.checkEmailDescription ||
              'Tiket Anda beserta kode QR telah dikirim ke alamat email Anda. Silakan tunjukkan saat check-in di acara.'}
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild variant="brand" size="cta" className="w-full gap-2 font-semibold">
            <Link href={`/events/${eventSlug}`}>
              {labels?.buttonLabels?.browseMoreEvents || 'Lihat Detail Acara'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Link href="/" className="block text-sm text-[#636364] hover:text-[#0b3d2e]">
            {labels?.buttonLabels?.returnToHome || 'Kembali ke Beranda'}
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}
