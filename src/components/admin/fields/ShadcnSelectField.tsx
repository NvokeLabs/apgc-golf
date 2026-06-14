'use client'

import type { SelectFieldClientComponent } from 'payload'

import { useField } from '@payloadcms/ui'
import React from 'react'

import { cn } from '@/utilities/ui'
import { FieldDescription, FieldError, FieldLabel, labelToString } from './shared'

type NormalizedOption = { label: string; value: string }

type RawOption = string | { label: string | Record<string, string>; value: string }

function normalizeOptions(options: readonly RawOption[] | undefined): NormalizedOption[] {
  if (!Array.isArray(options)) return []
  return options.map((opt) => {
    if (typeof opt === 'string') return { label: opt, value: opt }
    return { label: labelToString(opt.label) || String(opt.value), value: String(opt.value) }
  })
}

export const ShadcnSelectField: SelectFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })
  const options = normalizeOptions(field.options as RawOption[] | undefined)

  return (
    <div className="apgc-admin space-y-1.5">
      <FieldLabel htmlFor={path} label={field.label} required={field.required} />
      <select
        id={path}
        value={value ?? ''}
        disabled={readOnly}
        onChange={(e) => setValue(e.target.value === '' ? undefined : e.target.value)}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {!field.required && <option value="">Select an option</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldDescription description={field.admin?.description} />
      <FieldError showError={showError} message={errorMessage} />
    </div>
  )
}

export default ShadcnSelectField
