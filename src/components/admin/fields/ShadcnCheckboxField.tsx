'use client'

import type { CheckboxFieldClientComponent } from 'payload'

import { useField } from '@payloadcms/ui'
import React from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { FieldDescription, FieldError, labelToString } from './shared'

export const ShadcnCheckboxField: CheckboxFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue, showError, errorMessage } = useField<boolean>({ path })
  const labelText = labelToString(field.label)

  return (
    <div className="apgc-admin space-y-1.5">
      <div className="flex items-center gap-2">
        <Checkbox
          id={path}
          checked={Boolean(value)}
          disabled={readOnly}
          onCheckedChange={(checked) => setValue(checked === true)}
        />
        {labelText ? (
          <label htmlFor={path} className="text-[13px] font-semibold text-[#0b3d2e]">
            {labelText}
            {field.required ? <span className="ml-0.5 text-accent">*</span> : null}
          </label>
        ) : null}
      </div>
      <FieldDescription description={field.admin?.description} />
      <FieldError showError={showError} message={errorMessage} />
    </div>
  )
}

export default ShadcnCheckboxField
