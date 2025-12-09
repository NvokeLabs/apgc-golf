'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EventRegistrationFormProps {
  eventId: number
  eventSlug: string
}

export function EventRegistrationForm({ eventId, eventSlug }: EventRegistrationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/event-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventId,
          playerName: formData.get('playerName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          category: formData.get('category'),
          handicap: formData.get('handicap') ? Number(formData.get('handicap')) : null,
          isAlumni: formData.get('isAlumni') === 'on',
          paymentMethod: formData.get('paymentMethod'),
          notes: formData.get('notes'),
          status: 'pending',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit registration')
      }

      // Redirect to success page
      router.push(`/register/event/${eventSlug}/success`)
    } catch (err) {
      setError('Failed to submit registration. Please try again.')
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

      {/* Personal Information */}
      <div>
        <h3 className="mb-4 font-semibold text-white">Personal Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="playerName" className="mb-2 block text-sm text-white/70">
              Full Name *
            </label>
            <input
              type="text"
              id="playerName"
              name="playerName"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-white/70">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm text-white/70">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="+62 xxx xxxx xxxx"
            />
          </div>
          <div>
            <label htmlFor="handicap" className="mb-2 block text-sm text-white/70">
              Handicap
            </label>
            <input
              type="number"
              id="handicap"
              name="handicap"
              min="0"
              max="54"
              step="0.1"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g., 12.5"
            />
          </div>
        </div>
      </div>

      {/* Registration Details */}
      <div>
        <h3 className="mb-4 font-semibold text-white">Registration Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="mb-2 block text-sm text-white/70">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select category</option>
              <option value="professional">Professional</option>
              <option value="amateur">Amateur</option>
              <option value="senior">Senior (50+)</option>
              <option value="ladies">Ladies</option>
            </select>
          </div>
          <div>
            <label htmlFor="paymentMethod" className="mb-2 block text-sm text-white/70">
              Payment Method *
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select payment method</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="credit-card">Credit Card</option>
              <option value="cash">Cash (at venue)</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isAlumni"
              className="h-5 w-5 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-white/70">
              I am an APGC Alumni (eligible for discounted rate)
            </span>
          </label>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="notes" className="mb-2 block text-sm text-white/70">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Any special requirements or notes..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-600 py-4 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Registration'}
      </button>

      <p className="text-center text-xs text-white/50">
        By registering, you agree to our terms and conditions. Payment instructions
        will be sent to your email after registration.
      </p>
    </form>
  )
}
