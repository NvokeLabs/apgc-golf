/**
 * Build the ticket "FROM" line.
 * Alumni with both a major and a class year → "{major} · {year}" (e.g. "Teknik Sipil · 2015").
 * Everyone else (general, or alumni missing a field) → "Non Alumni".
 */
export function formatTicketFrom(
  category?: string | null,
  alumniMajor?: string | null,
  alumniClassYear?: number | null,
): string {
  if (category === 'alumni' && alumniMajor && alumniClassYear) {
    return `${alumniMajor} · ${alumniClassYear}`
  }
  return 'Non Alumni'
}
