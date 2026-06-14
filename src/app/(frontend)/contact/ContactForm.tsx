'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { getClientSideURL } from '@/utilities/getURL'
import { Button } from '@/components/ui/button'

interface ContactFormProps {
  formId: string
}

export function ContactForm({ formId }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const submissionData = [
      { field: 'full-name', value: formData.get('full-name') as string },
      { field: 'email', value: formData.get('email') as string },
      { field: 'phone', value: formData.get('phone') as string },
      { field: 'message', value: formData.get('message') as string },
    ]

    try {
      const res = await fetch(`${getClientSideURL()}/api/form-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: formId, submissionData }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body?.errors?.[0]?.message || 'Gagal mengirim pesan.')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim pesan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 rounded-full bg-[#0b3d2e]/10 p-5">
          <CheckCircle2 className="h-10 w-10 text-[#0b3d2e]" />
        </div>
        <h3 className="mb-3 text-2xl font-light text-[#0b3d2e]">
          Pesan <span className="font-serif italic font-medium">Terkirim</span>
        </h3>
        <p className="text-[#636364] max-w-sm">
          Terima kasih telah menghubungi kami. Tim kami akan segera merespons pesan Anda.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-400/40 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium text-[#0b3d2e]">
          Nama Lengkap <span className="text-[#D66232]">*</span>
        </label>
        <input
          type="text"
          id="full-name"
          name="full-name"
          required
          placeholder="Masukkan nama lengkap Anda"
          className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e] transition"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0b3d2e]">
            Email <span className="text-[#D66232]">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="email@contoh.com"
            className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e] transition"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[#0b3d2e]">
            Nomor Telepon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+62 xxx xxxx xxxx"
            className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e] transition"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-[#0b3d2e]">
          Pesan <span className="text-[#D66232]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tuliskan pesan Anda di sini..."
          className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e] transition resize-none"
        />
      </div>

      <Button
        type="submit"
        variant="brand"
        size="cta"
        disabled={isSubmitting}
        className="w-full gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Mengirim...
          </>
        ) : (
          'Kirim Pesan'
        )}
      </Button>
    </form>
  )
}
