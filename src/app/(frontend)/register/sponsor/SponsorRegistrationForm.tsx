'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FormContent, SponsorshipTier } from '@/payload-types'
import { Button } from '@/components/ui/button'

type SponsorFormContent = FormContent['sponsorRegistration']

interface SponsorRegistrationFormProps {
  formContent?: SponsorFormContent
  sponsorshipTiers?: SponsorshipTier[]
}

export function SponsorRegistrationForm({
  formContent,
  sponsorshipTiers,
}: SponsorRegistrationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/sponsor-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.get('companyName'),
          contactName: formData.get('contactName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          website: formData.get('website'),
          selectedTier: formData.get('selectedTier'),
          message: formData.get('message'),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      // Redirect to success page
      router.push('/register/sponsor/success')
    } catch (err) {
      setError('Gagal mengirim pengajuan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Company Information */}
      <div>
        <h3 className="mb-4 font-semibold text-[#0b3d2e]">
          {formContent?.companyInfoHeading || 'Informasi Perusahaan'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="companyName" className="mb-2 block text-sm text-[#636364]">
              {formContent?.companyNameLabel || 'Nama Perusahaan *'}
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              required
              className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder={formContent?.companyNamePlaceholder || 'Masukkan nama perusahaan'}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="website" className="mb-2 block text-sm text-[#636364]">
              {formContent?.companyWebsiteLabel || 'Situs Web Perusahaan'}
            </label>
            <input
              type="url"
              id="website"
              name="website"
              className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder={formContent?.companyWebsitePlaceholder || 'https://www.example.com'}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="mb-4 font-semibold text-[#0b3d2e]">
          {formContent?.contactInfoHeading || 'Informasi Kontak'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contactName" className="mb-2 block text-sm text-[#636364]">
              {formContent?.contactPersonLabel || 'Narahubung *'}
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              required
              className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder={formContent?.contactPersonPlaceholder || 'Nama lengkap'}
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-[#636364]">
              {formContent?.emailLabel || 'Alamat Email *'}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder={formContent?.emailPlaceholder || 'contact@company.com'}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="phone" className="mb-2 block text-sm text-[#636364]">
              {formContent?.phoneLabel || 'Nomor Telepon *'}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder={formContent?.phonePlaceholder || '+62 xxx xxxx xxxx'}
            />
          </div>
        </div>
      </div>

      {/* Sponsorship Interest */}
      <div>
        <h3 className="mb-4 font-semibold text-[#0b3d2e]">
          {formContent?.sponsorshipInterestHeading || 'Minat Sponsorship'}
        </h3>
        <div>
          <label htmlFor="selectedTier" className="mb-2 block text-sm text-[#636364]">
            {formContent?.tierLabel || 'Tier yang Diminati *'}
          </label>
          <select
            id="selectedTier"
            name="selectedTier"
            required
            className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
          >
            <option value="">{formContent?.tierPlaceholder || 'Pilih tier'}</option>
            {sponsorshipTiers && sponsorshipTiers.length > 0 ? (
              <>
                {sponsorshipTiers.map((tier) => (
                  <option key={tier.id} value={tier.name}>
                    {tier.name} ({tier.price})
                  </option>
                ))}
                <option value="Custom">Paket Khusus</option>
              </>
            ) : (
              <>
                <option value="ALBATROS">ALBATROS (Rp 100.000.000)</option>
                <option value="EAGLE">EAGLE (Rp 75.000.000)</option>
                <option value="BIRDIE">BIRDIE (Rp 50.000.000)</option>
                <option value="PAR">PAR (Rp 25.000.000)</option>
                <option value="Custom">Paket Khusus</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-2 block text-sm text-[#636364]">
          {formContent?.messageLabel || 'Pesan'}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
          placeholder={
            formContent?.messagePlaceholder ||
            'Ceritakan tentang perusahaan dan tujuan sponsorship Anda...'
          }
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="brand"
        size="cta"
        disabled={isSubmitting}
        className="w-full font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? formContent?.processingText || 'Mengirim...'
          : formContent?.submitButtonText || 'Kirim Pengajuan'}
      </Button>

      <p className="text-center text-xs text-[#636364]">
        {formContent?.footerText ||
          'Tim sponsorship kami akan meninjau pengajuan Anda dan menghubungi Anda dalam 2-3 hari kerja.'}
      </p>
    </form>
  )
}
