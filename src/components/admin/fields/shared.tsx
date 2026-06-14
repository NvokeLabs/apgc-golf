'use client'

import React from 'react'

/**
 * Payload field labels can be a string, a localized record, or `false`.
 * Normalize to a display string for our custom shadcn admin fields.
 */
type FieldLabelValue = string | Record<string, string> | false | undefined

export function labelToString(label: FieldLabelValue): string {
  if (!label) return ''
  if (typeof label === 'string') return label
  // Localized record: pick the first available value.
  const first = Object.values(label)[0]
  return typeof first === 'string' ? first : ''
}

export const FieldLabel: React.FC<{
  htmlFor?: string
  label: FieldLabelValue
  required?: boolean
}> = ({ htmlFor, label, required }) => {
  const text = labelToString(label)
  if (!text) return null
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-[#0b3d2e]">
      {text}
      {required ? <span className="ml-0.5 text-accent">*</span> : null}
    </label>
  )
}

export const FieldDescription: React.FC<{
  description?: string | Record<string, string>
}> = ({ description }) => {
  const text = labelToString(description)
  if (!text) return null
  return <p className="text-xs text-muted-foreground">{text}</p>
}

export const FieldError: React.FC<{ showError?: boolean; message?: string }> = ({
  showError,
  message,
}) => {
  if (!showError || !message) return null
  return <p className="text-xs font-medium text-red-600">{message}</p>
}
