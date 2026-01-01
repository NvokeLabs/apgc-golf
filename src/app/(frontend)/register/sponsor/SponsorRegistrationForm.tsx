'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SponsorRegistrationForm() {
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
          interestedTier: formData.get('interestedTier'),
          message: formData.get('message'),
          status: 'new',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      // Redirect to success page
      router.push('/register/sponsor/success')
    } catch (err) {
      setError('Failed to submit application. Please try again.')
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
        <h3 className="mb-4 font-semibold text-[#0b3d2e]">Company Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="companyName" className="mb-2 block text-sm text-[#636364]">
              Company Name *
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              required
              className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder="Enter company name"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="website" className="mb-2 block text-sm text-[#636364]">
              Company Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder="https://www.example.com"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="mb-4 font-semibold text-[#0b3d2e]">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contactName" className="mb-2 block text-sm text-[#636364]">
              Contact Person *
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              required
              className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder="Full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-[#636364]">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder="contact@company.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="phone" className="mb-2 block text-sm text-[#636364]">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
              placeholder="+62 xxx xxxx xxxx"
            />
          </div>
        </div>
      </div>

      {/* Sponsorship Interest */}
      <div>
        <h3 className="mb-4 font-semibold text-[#0b3d2e]">Sponsorship Interest</h3>
        <div>
          <label htmlFor="interestedTier" className="mb-2 block text-sm text-[#636364]">
            Interested Tier *
          </label>
          <select
            id="interestedTier"
            name="interestedTier"
            required
            className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
          >
            <option value="">Select a tier</option>
            <option value="title">Title Sponsor (Rp 500,000,000+)</option>
            <option value="platinum">Platinum Partner (Rp 250,000,000+)</option>
            <option value="gold">Gold Partner (Rp 100,000,000+)</option>
            <option value="custom">Custom Package</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-2 block text-sm text-[#636364]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full rounded-lg border border-[#0b3d2e]/20 bg-white px-4 py-3 text-[#0b3d2e] placeholder:text-[#636364]/50 focus:border-[#0b3d2e] focus:outline-none focus:ring-1 focus:ring-[#0b3d2e]"
          placeholder="Tell us about your company and sponsorship goals..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-[#0b3d2e] py-4 font-semibold text-white transition-colors hover:bg-[#091f18] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>

      <p className="text-center text-xs text-[#636364]">
        Our sponsorship team will review your application and contact you within 2-3 business days.
      </p>
    </form>
  )
}
