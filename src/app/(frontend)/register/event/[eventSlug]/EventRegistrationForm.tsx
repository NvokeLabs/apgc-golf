'use client'

import { useState } from 'react'
import { createRegistrationWithPayment, type RegistrationFormData } from './actions'
import type { FormContent } from '@/payload-types'
import { Button } from '@/components/ui/button'

type EventFormContent = FormContent['eventRegistration']
type CategoryOption = { value?: string | null; label?: string | null; id?: string | null }

interface EventRegistrationFormProps {
  eventId: number
  eventSlug: string
  formContent?: EventFormContent
  categoryOptions?: CategoryOption[] | null
}

export function EventRegistrationForm({
  eventId,
  eventSlug,
  formContent,
  categoryOptions,
}: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState('general')
  const currentYear = new Date().getFullYear()
  const angkatanYears = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => currentYear - i)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      // All registration and payment logic happens server-side via server action
      const result = await createRegistrationWithPayment({
        eventId,
        playerName: formData.get('playerName') as string,
        email: formData.get('email') as string,
        phone: (formData.get('phone') as string) || undefined,
        category: formData.get('category') as RegistrationFormData['category'],
        tshirtSize: formData.get('tshirtSize') as RegistrationFormData['tshirtSize'],
        alumniClassYear: formData.get('alumniClassYear')
          ? Number(formData.get('alumniClassYear'))
          : undefined,
        alumniMajor: (formData.get('alumniMajor') as string) || undefined,
        notes: (formData.get('notes') as string) || undefined,
      })

      if (!result.success) {
        throw new Error(result.error || 'Gagal memproses pendaftaran')
      }

      // Manual bank transfer (launch default): go to the tokenized upload page
      // to view bank instructions and submit the transfer proof.
      if (result.uploadToken) {
        window.location.href = `/register/event/${eventSlug}/upload?token=${encodeURIComponent(
          result.uploadToken,
        )}`
      } else if (result.checkoutUrl) {
        // Legacy Xendit path
        window.location.href = result.checkoutUrl
      } else {
        throw new Error('Tautan unggah tidak tersedia')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(
        err instanceof Error ? err.message : 'Gagal mengirim pendaftaran. Silakan coba lagi.',
      )
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

      {/* Personal Information */}
      <div>
        <h3 className="mb-4 font-semibold text-gray-900">
          {formContent?.personalInfoHeading || 'Informasi Pribadi'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="playerName" className="mb-2 block text-sm text-gray-600">
              {formContent?.fullNameLabel || 'Nama Lengkap *'}
            </label>
            <input
              type="text"
              id="playerName"
              name="playerName"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder={formContent?.fullNamePlaceholder || 'Masukkan nama lengkap Anda'}
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-gray-600">
              {formContent?.emailLabel || 'Alamat Email *'}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder={formContent?.emailPlaceholder || 'your@email.com'}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="phone" className="mb-2 block text-sm text-gray-600">
              {formContent?.phoneLabel || 'Nomor Telepon'}
            </label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-4 text-gray-500">
                {formContent?.phonePrefix || '+62'}
              </span>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
                placeholder={formContent?.phonePlaceholder || '8xx xxxx xxxx'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Registration Details */}
      <div>
        <h3 className="mb-4 font-semibold text-gray-900">
          {formContent?.registrationDetailsHeading || 'Detail Pendaftaran'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="category" className="mb-2 block text-sm text-gray-600">
              {formContent?.categoryLabel || 'Kategori *'}
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue="general"
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
            >
              <option value="general">
                {categoryOptions?.find((c) => c.value === 'general')?.label || 'Umum'}
              </option>
              {categoryOptions && categoryOptions.length > 0 ? (
                categoryOptions
                  .filter((cat) => cat.value !== 'general')
                  .map((cat) => (
                    <option key={cat.id || cat.value} value={cat.value || ''}>
                      {cat.label}
                    </option>
                  ))
              ) : (
                <option value="alumni">Alumni</option>
              )}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="tshirtSize" className="mb-2 block text-sm text-gray-600">
              Ukuran Kaos Golf *
            </label>
            <select
              id="tshirtSize"
              name="tshirtSize"
              required
              defaultValue=""
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
            >
              <option value="" disabled>
                Pilih ukuran
              </option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
          {category === 'alumni' && (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="alumniClassYear" className="mb-2 block text-sm text-gray-600">
                  Angkatan *
                </label>
                <select
                  id="alumniClassYear"
                  name="alumniClassYear"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
                >
                  <option value="" disabled>
                    Pilih angkatan
                  </option>
                  {angkatanYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="alumniMajor" className="mb-2 block text-sm text-gray-600">
                  Jurusan *
                </label>
                <input
                  type="text"
                  id="alumniMajor"
                  name="alumniMajor"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
                  placeholder="Contoh: Teknik Sipil"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="notes" className="mb-2 block text-sm text-gray-600">
          {formContent?.notesLabel || 'Catatan Tambahan'}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
          placeholder={
            formContent?.notesPlaceholder || 'Permintaan khusus atau catatan tambahan...'
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
          ? formContent?.processingText || 'Memproses...'
          : formContent?.submitButtonText || 'Lanjut ke Pembayaran'}
      </Button>

      <p className="text-center text-xs text-gray-500">
        {formContent?.termsText ||
          'Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami. Selanjutnya Anda akan melihat instruksi transfer bank dan mengunggah bukti transfer Anda.'}
      </p>
    </form>
  )
}
