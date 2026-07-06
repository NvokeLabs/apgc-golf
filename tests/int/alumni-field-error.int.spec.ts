import { describe, it, expect } from 'vitest'
import { alumniFieldError } from '@/utilities/registration/alumniFieldError'

describe('alumniFieldError', () => {
  it('returns null for a general registration (fields irrelevant)', () => {
    expect(alumniFieldError({ category: 'general' })).toBeNull()
    expect(alumniFieldError({ category: 'general', alumniClassYear: undefined })).toBeNull()
  })

  it('requires angkatan for alumni', () => {
    expect(alumniFieldError({ category: 'alumni', alumniMajor: 'Teknik Sipil' })).toBe(
      'Angkatan wajib diisi',
    )
  })

  it('requires jurusan for alumni (blank/whitespace is missing)', () => {
    expect(alumniFieldError({ category: 'alumni', alumniClassYear: 2015 })).toBe(
      'Jurusan wajib diisi',
    )
    expect(
      alumniFieldError({ category: 'alumni', alumniClassYear: 2015, alumniMajor: '   ' }),
    ).toBe('Jurusan wajib diisi')
  })

  it('returns null when an alumni supplies both fields', () => {
    expect(
      alumniFieldError({ category: 'alumni', alumniClassYear: 2015, alumniMajor: 'Teknik Sipil' }),
    ).toBeNull()
  })
})
