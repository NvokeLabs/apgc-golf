import { describe, it, expect } from 'vitest'
import { formatTicketFrom } from '@/utilities/ticketing/formatTicketFrom'

describe('formatTicketFrom', () => {
  it('alumni with both fields → "{major} · {year}"', () => {
    expect(formatTicketFrom('alumni', 'Teknik Sipil', 2015)).toBe('Teknik Sipil · 2015')
  })

  it('alumni missing major → "Non Alumni"', () => {
    expect(formatTicketFrom('alumni', null, 2015)).toBe('Non Alumni')
    expect(formatTicketFrom('alumni', '', 2015)).toBe('Non Alumni')
  })

  it('alumni missing class year → "Non Alumni"', () => {
    expect(formatTicketFrom('alumni', 'Teknik Sipil', null)).toBe('Non Alumni')
    expect(formatTicketFrom('alumni', 'Teknik Sipil', undefined)).toBe('Non Alumni')
  })

  it('non-alumni (general) → "Non Alumni" even with fields present', () => {
    expect(formatTicketFrom('general', 'Teknik Sipil', 2015)).toBe('Non Alumni')
  })

  it('undefined/null category → "Non Alumni"', () => {
    expect(formatTicketFrom(undefined, undefined, undefined)).toBe('Non Alumni')
    expect(formatTicketFrom(null, null, null)).toBe('Non Alumni')
  })
})
