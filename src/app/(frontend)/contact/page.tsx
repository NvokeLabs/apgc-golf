import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Hubungi Kami | APGC Golf',
  description:
    'Hubungi Alumni Polinema Golf Club. Kami siap membantu pertanyaan Anda tentang turnamen, sponsorship, dan keanggotaan.',
}

export const revalidate = 3600

async function getContactFormId(): Promise<string | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const forms = await payload.find({
      collection: 'forms',
      where: { title: { equals: 'Contact Form' } },
      limit: 1,
    })
    return forms.docs[0]?.id ? String(forms.docs[0].id) : null
  } catch {
    return null
  }
}

const contactInfo = [
  {
    icon: MapPin,
    label: 'Alamat',
    value: 'Politeknik Negeri Malang, Jl. Soekarno Hatta No.9, Malang, Jawa Timur',
  },
  {
    icon: Phone,
    label: 'Telepon / WhatsApp',
    value: '+62 851-5678-9012',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@polinemagolf.com',
  },
  {
    icon: Clock,
    label: 'Jam Operasional',
    value: 'Senin – Jumat, 08.00 – 17.00 WIB',
  },
]

export default async function ContactPage() {
  const formId = await getContactFormId()

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="text-[#0b3d2e] text-xs font-bold tracking-widest uppercase mb-4 block">
            Hubungi Kami
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-[#0b3d2e] mb-6">
            Kami Siap <span className="font-serif italic font-medium">Membantu Anda</span>
          </h1>
          <p className="text-[#636364] text-lg leading-relaxed">
            Punya pertanyaan tentang turnamen, sponsorship, atau keanggotaan? Jangan ragu untuk
            menghubungi kami. Tim kami akan segera merespons.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
          {/* Left column – contact info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Info cards */}
            <GlassCard className="p-8 bg-[#0b3d2e] border-[#0b3d2e]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
              <div className="relative z-10">
                <div className="mb-6 inline-flex rounded-xl bg-white/10 p-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h2 className="mb-2 text-2xl font-light text-white">
                  Informasi <span className="font-serif italic font-medium">Kontak</span>
                </h2>
                <p className="mb-8 text-white/60 text-sm leading-relaxed">
                  Hubungi kami melalui salah satu saluran di bawah ini atau isi formulir untuk
                  pertanyaan lebih lanjut.
                </p>

                <div className="space-y-6">
                  {contactInfo.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="mt-0.5 flex-shrink-0 rounded-lg bg-white/10 p-2.5">
                        <Icon className="h-4 w-4 text-[#D66232]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">
                          {label}
                        </p>
                        <p className="text-sm text-white/90 leading-snug">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Quick links */}
            <GlassCard className="p-6 bg-white/40 border-[#0b3d2e]/10">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#0b3d2e]">
                Tautan Cepat
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Daftar sebagai Sponsor', href: '/register/sponsor' },
                  { label: 'Daftar Event Golf', href: '/events' },
                  { label: 'Lihat Profil Pemain', href: '/players' },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between rounded-lg px-4 py-3 text-sm text-[#0b3d2e] hover:bg-[#0b3d2e]/5 transition-colors group"
                  >
                    <span>{label}</span>
                    <span className="text-[#D66232] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right column – form */}
          <div className="lg:col-span-3">
            <GlassCard className="p-8 md:p-10 bg-white/60 border-[#0b3d2e]/10">
              <div className="mb-8">
                <h2 className="text-2xl font-light text-[#0b3d2e] mb-2">
                  Kirim <span className="font-serif italic font-medium">Pesan</span>
                </h2>
                <p className="text-sm text-[#636364]">
                  Isi formulir di bawah ini dan kami akan menghubungi Anda secepatnya.
                </p>
              </div>

              {formId ? (
                <ContactForm formId={formId} />
              ) : (
                <div className="py-8 text-center text-[#636364] text-sm">
                  Formulir kontak sedang tidak tersedia. Silakan hubungi kami melalui email atau
                  telepon.
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 rounded-2xl bg-[#0b3d2e] p-12 text-center relative overflow-hidden max-w-6xl mx-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
          <h3 className="text-2xl font-light text-white mb-3">
            Tertarik menjadi bagian dari{' '}
            <span className="font-serif italic font-medium">APGC Golf?</span>
          </h3>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Bergabunglah dengan komunitas golf Alumni Polinema dan nikmati jaringan eksklusif
            bersama para profesional terbaik.
          </p>
          <Link
            href="/register/sponsor"
            className="inline-block rounded-xl bg-white px-8 py-4 font-bold text-[#0b3d2e] transition-transform hover:scale-105 hover:bg-[#f8f5e9]"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  )
}
