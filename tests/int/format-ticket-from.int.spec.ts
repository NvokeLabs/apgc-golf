import { describe, it, expect } from 'vitest'
import { formatTicketFrom } from '@/utilities/ticketing/formatTicketFrom'

describe('formatTicketFrom', () => {
  it('alumni with both fields → "{major} · {year}"', () => {
    expect(formatTicketFrom('alumni', 'Teknik Sipil', 2015)).toBe('Teknik Sipil · 2015')
  })

  it('alumni missing major → "Alumni"', () => {
    expect(formatTicketFrom('alumni', null, 2015)).toBe('Alumni')
    expect(formatTicketFrom('alumni', '', 2015)).toBe('Alumni')
  })

  it('alumni missing class year → "Alumni"', () => {
    expect(formatTicketFrom('alumni', 'Teknik Sipil', null)).toBe('Alumni')
    expect(formatTicketFrom('alumni', 'Teknik Sipil', undefined)).toBe('Alumni')
  })

  it('non-alumni (general) → "Non Alumni" even with fields present', () => {
    expect(formatTicketFrom('general', 'Teknik Sipil', 2015)).toBe('Non Alumni')
  })

  it('undefined/null category → "Non Alumni"', () => {
    expect(formatTicketFrom(undefined, undefined, undefined)).toBe('Non Alumni')
    expect(formatTicketFrom(null, null, null)).toBe('Non Alumni')
  })
})
