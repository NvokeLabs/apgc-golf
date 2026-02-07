'use client'

import { useState } from 'react'
import { createRegistrationWithPayment, type RegistrationFormData } from './actions'
import type { FormContent } from '@/payload-types'

type EventFormContent = FormContent['eventRegistration']
type CategoryOption = { value?: string | null; label?: string | null; id?: string | null }

interface EventRegistrationFormProps {
  eventId: number
  formContent?: EventFormContent
  categoryOptions?: CategoryOption[] | null
}

export function EventRegistrationForm({
  eventId,
  formContent,
  categoryOptions,
}: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        notes: (formData.get('notes') as string) || undefined,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to process registration')
      }

      // Redirect to Xendit checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to submit registration. Please try again.',
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
          {formContent?.personalInfoHeading || 'Personal Information'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="playerName" className="mb-2 block text-sm text-gray-600">
              {formContent?.fullNameLabel || 'Full Name *'}
            </label>
            <input
              type="text"
              id="playerName"
              name="playerName"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder={formContent?.fullNamePlaceholder || 'Enter your full name'}
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-gray-600">
              {formContent?.emailLabel || 'Email Address *'}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder={formContent?.emailPlaceholder || 'your@email.com'}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="phone" className="mb-2 block text-sm text-gray-600">
              {formContent?.phoneLabel || 'Phone Number'}
            </label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-4 text-gray-500">
                {formContent?.phonePrefix || '+62'}
              </span>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder={formContent?.phonePlaceholder || '8xx xxxx xxxx'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Registration Details */}
      <div>
        <h3 className="mb-4 font-semibold text-gray-900">
          {formContent?.registrationDetailsHeading || 'Registration Details'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="category" className="mb-2 block text-sm text-gray-600">
              {formContent?.categoryLabel || 'Category *'}
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="general">
                {categoryOptions?.find((c) => c.value === 'general')?.label || 'General'}
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
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="notes" className="mb-2 block text-sm text-gray-600">
          {formContent?.notesLabel || 'Additional Notes'}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder={formContent?.notesPlaceholder || 'Any special requirements or notes...'}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-600 py-4 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? formContent?.processingText || 'Processing...'
          : formContent?.submitButtonText || 'Continue to Payment'}
      </button>

      <p className="text-center text-xs text-gray-500">
        {formContent?.termsText ||
          'By registering, you agree to our terms and conditions. You will be redirected to complete payment securely via Xendit.'}
      </p>
    </form>
  )
}
