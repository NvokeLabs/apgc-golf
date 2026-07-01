import { describe, it, expect } from 'vitest'
import {
  generatePaymentInstructionsHtml,
  PAYMENT_EMAIL_SUBJECT,
  type PaymentInstructionsParams,
} from '@/utilities/email/sendPaymentInstructionsEmail'

/**
 * Story 11 — "Complete your payment" follow-up email.
 * The HTML must carry the bank details, exact amount, reg-{id} reference, and
 * the tokenized upload link so the registrant can pay and submit proof later.
 */

const base: PaymentInstructionsParams = {
  playerName: 'Jane Doe',
  bankName: 'BCA',
  accountNumber: '1234567890',
  accountHolder: 'APGC Golf',
  instructions: 'Transfer the exact amount.',
  amount: 500_000,
  reference: 'reg-42',
  uploadUrl: 'https://apgc.test/register/event/spring-open/upload?token=abc.def',
}

describe('payment instructions email', () => {
  it('has a "Complete your payment" subject', () => {
    expect(PAYMENT_EMAIL_SUBJECT.toLowerCase()).toContain('complete your payment')
  })

  it('includes bank details, amount, reference and the upload link', () => {
    const html = generatePaymentInstructionsHtml(base)
    expect(html).toContain('BCA')
    expect(html).toContain('1234567890')
    expect(html).toContain('APGC Golf')
    expect(html).toContain('reg-42')
    expect(html).toContain('Transfer the exact amount.')
    // exact amount, formatted as IDR
    expect(html).toContain('500.000')
    // tokenized upload link present as an href
    expect(html).toContain(
      'href="https://apgc.test/register/event/spring-open/upload?token=abc.def"',
    )
  })

  it('still shows the link, amount and reference when bank details are unconfigured', () => {
    const html = generatePaymentInstructionsHtml({
      ...base,
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      instructions: '',
    })
    expect(html).toContain('reg-42')
    expect(html).toContain('500.000')
    expect(html).toContain(
      'href="https://apgc.test/register/event/spring-open/upload?token=abc.def"',
    )
  })

  it('escapes the player name to avoid HTML injection', () => {
    const html = generatePaymentInstructionsHtml({ ...base, playerName: '<script>x</script>' })
    expect(html).not.toContain('<script>x</script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
