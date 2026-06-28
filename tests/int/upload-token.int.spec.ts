import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mintUploadToken, verifyUploadToken } from '@/utilities/uploadToken'

const SECRET_A = 'test-secret-alpha-1234567890'
const SECRET_B = 'test-secret-beta-0987654321'

describe('uploadToken utility', () => {
  let originalSecret: string | undefined
  let FUTURE: number
  let PAST: number

  beforeEach(() => {
    originalSecret = process.env.UPLOAD_TOKEN_SECRET
    process.env.UPLOAD_TOKEN_SECRET = SECRET_A
    FUTURE = Date.now() + 1000 * 60 * 60 // 1 hour from now
    PAST = Date.now() - 1000 * 60 * 60 // 1 hour ago
  })

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.UPLOAD_TOKEN_SECRET
    } else {
      process.env.UPLOAD_TOKEN_SECRET = originalSecret
    }
  })

  // S3.1 — valid token round-trips
  it('S3.1: valid token round-trips with correct registrationId', () => {
    const registrationId = 42
    const token = mintUploadToken(registrationId, FUTURE)
    const result = verifyUploadToken(token)
    expect(result).toEqual({ valid: true, registrationId })
  })

  // S3.4 — expiry
  it('S3.4a: token with exp in the future verifies as valid', () => {
    const token = mintUploadToken(99, FUTURE)
    const result = verifyUploadToken(token)
    expect(result.valid).toBe(true)
  })

  it('S3.4b: token with exp in the past returns expired', () => {
    const token = mintUploadToken(99, PAST)
    const result = verifyUploadToken(token)
    expect(result).toEqual({ valid: false, reason: 'expired' })
  })

  // S3.2 — tampered signature
  it('S3.2a: tampering with the signature segment returns bad-signature', () => {
    const token = mintUploadToken(7, FUTURE)
    const [payload] = token.split('.')
    const tamperedToken = payload + '.invalidsignatureXXXX'
    const result = verifyUploadToken(tamperedToken)
    expect(result).toEqual({ valid: false, reason: 'bad-signature' })
  })

  // S3.2/S3.3 — tampered payload (changed rid without re-signing)
  it('S3.2b: tampering with the payload (changed rid) returns bad-signature', () => {
    const token = mintUploadToken(7, FUTURE)
    const [, sig] = token.split('.')
    // Build a payload with a different rid but keep the original signature
    const tamperedPayload = Buffer.from(JSON.stringify({ rid: 999, exp: FUTURE })).toString(
      'base64url',
    )
    const tamperedToken = tamperedPayload + '.' + sig
    const result = verifyUploadToken(tamperedToken)
    expect(result).toEqual({ valid: false, reason: 'bad-signature' })
  })

  // S3.2c — tampered exp field without re-signing
  it('S3.2c: tampering with the payload (changed exp) returns bad-signature', () => {
    const token = mintUploadToken(7, FUTURE)
    const [, sig] = token.split('.')
    // Push exp far into the future but keep the original signature — must not validate
    const tamperedPayload = Buffer.from(
      JSON.stringify({ rid: 7, exp: Date.now() + 1000 * 60 * 60 * 24 * 365 }),
    ).toString('base64url')
    const tamperedToken = tamperedPayload + '.' + sig
    const result = verifyUploadToken(tamperedToken)
    expect(result).toEqual({ valid: false, reason: 'bad-signature' })
  })

  // S3.3 — malformed inputs
  it('S3.3a: a bare integer string returns malformed', () => {
    const result = verifyUploadToken('1234')
    expect(result).toEqual({ valid: false, reason: 'malformed' })
  })

  it('S3.3b: empty string returns malformed', () => {
    const result = verifyUploadToken('')
    expect(result).toEqual({ valid: false, reason: 'malformed' })
  })

  it('S3.3c: string missing the "." separator returns malformed', () => {
    const result = verifyUploadToken('nodothere')
    expect(result).toEqual({ valid: false, reason: 'malformed' })
  })

  it('S3.3d: non-base64/JSON payload returns malformed', () => {
    const result = verifyUploadToken('!!!invalid!!!.abc')
    expect(result).toEqual({ valid: false, reason: 'malformed' })
  })

  it.each(['1234', '', 'nodot', 'bad.b64', '..', 'null.null'])(
    'S3.3e: malformed input "%s" never returns valid:true and never throws',
    (input) => {
      let result: ReturnType<typeof verifyUploadToken> | undefined
      expect(() => {
        result = verifyUploadToken(input)
      }).not.toThrow()
      expect(result?.valid).not.toBe(true)
    },
  )

  // S3.3 — cannot forge a token for another registrationId without the secret
  it('S3.3f: cannot forge a valid token for registrationId+1 without the secret', () => {
    // Construct a payload for rid+1 without a correct HMAC — just make up a sig
    const forgedPayload = Buffer.from(JSON.stringify({ rid: 1001, exp: FUTURE })).toString(
      'base64url',
    )
    const fakeSig = Buffer.from('fakesignature').toString('base64url')
    const forgedToken = forgedPayload + '.' + fakeSig
    const result = verifyUploadToken(forgedToken)
    expect(result).toEqual({ valid: false, reason: 'bad-signature' })
  })

  // S3.5 — secret rotation
  it('S3.5: token minted with secret A is invalid after rotating to secret B', () => {
    const token = mintUploadToken(55, FUTURE)
    process.env.UPLOAD_TOKEN_SECRET = SECRET_B
    const result = verifyUploadToken(token)
    expect(result).toEqual({ valid: false, reason: 'bad-signature' })
  })

  // S3.6 — missing/empty secret throws
  it('S3.6a: mintUploadToken throws when UPLOAD_TOKEN_SECRET is missing', () => {
    delete process.env.UPLOAD_TOKEN_SECRET
    expect(() => mintUploadToken(1, FUTURE)).toThrow()
  })

  it('S3.6b: mintUploadToken throws when UPLOAD_TOKEN_SECRET is empty string', () => {
    process.env.UPLOAD_TOKEN_SECRET = ''
    expect(() => mintUploadToken(1, FUTURE)).toThrow()
  })

  it('S3.6c: verifyUploadToken throws when UPLOAD_TOKEN_SECRET is missing', () => {
    // Mint a valid token first while secret is set
    const token = mintUploadToken(1, FUTURE)
    delete process.env.UPLOAD_TOKEN_SECRET
    expect(() => verifyUploadToken(token)).toThrow()
  })

  it('S3.6d: verifyUploadToken throws when UPLOAD_TOKEN_SECRET is empty string', () => {
    const token = mintUploadToken(1, FUTURE)
    process.env.UPLOAD_TOKEN_SECRET = ''
    expect(() => verifyUploadToken(token)).toThrow()
  })
})
