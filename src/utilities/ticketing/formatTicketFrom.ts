/**
 * Build the ticket "FROM" line.
 * Alumni with both a major and a class year → "{major} · {year}" (e.g. "Teknik Sipil · 2015").
 * Alumni missing a field → "Alumni" (never "Non Alumni" — the category wins).
 * Everyone else → "Non Alumni".
 */
export function formatTicketFrom(
  category?: string | null,
  alumniMajor?: string | null,
  alumniClassYear?: number | null,
): string {
  if (category === 'alumni') {
    if (alumniMajor && alumniClassYear) {
      return `${alumniMajor} · ${alumniClassYear}`
    }
    return 'Alumni'
  }
  return 'Non Alumni'
}
