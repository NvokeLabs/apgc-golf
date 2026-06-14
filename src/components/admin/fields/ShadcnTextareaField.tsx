'use client'

import type { TextareaFieldClientComponent } from 'payload'

import { useField } from '@payloadcms/ui'
import React from 'react'

import { Textarea } from '@/components/ui/textarea'
import { FieldDescription, FieldError, FieldLabel } from './shared'

export const ShadcnTextareaField: TextareaFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })

  return (
    <div className="apgc-admin space-y-1.5">
      <FieldLabel htmlFor={path} label={field.label} required={field.required} />
      <Textarea
        id={path}
        value={value ?? ''}
        disabled={readOnly}
        onChange={(e) => setValue(e.target.value)}
      />
      <FieldDescription description={field.admin?.description} />
      <FieldError showError={showError} message={errorMessage} />
    </div>
  )
}

export default ShadcnTextareaField
