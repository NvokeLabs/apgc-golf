/**
 * App-layer guard for the alumni-only fields. The DB columns are nullable, so
 * "required for alumni" is enforced here (and on the form). Returns a
 * Bahasa Indonesia error string, or null when the input is acceptable.
 */
export function alumniFieldError(data: {
  category: string
  alumniClassYear?: number
  alumniMajor?: string
}): string | null {
  if (data.category !== 'alumni') return null
  if (!data.alumniClassYear) return 'Angkatan wajib diisi'
  if (!data.alumniMajor || !data.alumniMajor.trim()) return 'Jurusan wajib diisi'
  return null
}
