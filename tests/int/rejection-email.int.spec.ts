import { describe, it, expect } from 'vitest'
import {
  generateRejectionHtml,
  REJECTION_EMAIL_SUBJECT,
  type RejectionEmailParams,
} from '@/utilities/email/sendRejectionEmail'

const base: RejectionEmailParams = {
  playerName: 'Jane Doe',
  reason: 'The amount transferred did not match.',
  uploadUrl: 'https://apgc.test/register/event/spring-open/upload?token=abc.def',
}

describe('rejection email', () => {
  it('has an action-needed subject', () => {
    expect(REJECTION_EMAIL_SUBJECT.length).toBeGreaterThan(0)
  })

  it('includes the rejection reason and the re-upload link', () => {
    const html = generateRejectionHtml(base)
    expect(html).toContain('The amount transferred did not match.')
    expect(html).toContain(
      'href="https://apgc.test/register/event/spring-open/upload?token=abc.def"',
    )
  })

  it('escapes the reason and player name to avoid HTML injection', () => {
    const html = generateRejectionHtml({
      ...base,
      playerName: '<b>x</b>',
      reason: '<script>alert(1)</script>',
    })
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<b>x</b>')
  })
})
