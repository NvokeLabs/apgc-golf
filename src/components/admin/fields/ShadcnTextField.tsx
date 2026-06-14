'use client'

import type { TextFieldClientComponent } from 'payload'

import { useField } from '@payloadcms/ui'
import React from 'react'

import { Input } from '@/components/ui/input'
import { FieldDescription, FieldError, FieldLabel } from './shared'

export const ShadcnTextField: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })

  return (
    <div className="apgc-admin space-y-1.5">
      <FieldLabel htmlFor={path} label={field.label} required={field.required} />
      <Input
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

export default ShadcnTextField
