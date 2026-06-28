import { createHmac, timingSafeEqual } from 'crypto'

function getSecret(): string {
  const secret = process.env.UPLOAD_TOKEN_SECRET
  if (!secret) {
    throw new Error('UPLOAD_TOKEN_SECRET environment variable is missing or empty')
  }
  return secret
}

function base64urlEncode(input: string): string {
  return Buffer.from(input).toString('base64url')
}

function base64urlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8')
}

function computeHmac(payloadJson: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadJson).digest('base64url')
}

export function mintUploadToken(registrationId: number, expiresAt: number): string {
  const secret = getSecret()
  const payloadJson = JSON.stringify({ rid: registrationId, exp: expiresAt })
  const encodedPayload = base64urlEncode(payloadJson)
  const signature = computeHmac(payloadJson, secret)
  return encodedPayload + '.' + signature
}

export type VerifyResult =
  | { valid: true; registrationId: number }
  | { valid: false; reason: 'malformed' | 'bad-signature' | 'expired' }

export function verifyUploadToken(token: string): VerifyResult {
  const secret = getSecret()

  if (!token || !token.includes('.')) {
    return { valid: false, reason: 'malformed' }
  }

  const dotIndex = token.indexOf('.')
  const encodedPayload = token.slice(0, dotIndex)
  const providedSig = token.slice(dotIndex + 1)

  // Decode and parse payload
  let payloadJson: string
  let parsed: unknown
  try {
    payloadJson = base64urlDecode(encodedPayload)
    parsed = JSON.parse(payloadJson)
  } catch {
    return { valid: false, reason: 'malformed' }
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('rid' in parsed) ||
    !('exp' in parsed) ||
    typeof (parsed as Record<string, unknown>).rid !== 'number' ||
    typeof (parsed as Record<string, unknown>).exp !== 'number'
  ) {
    return { valid: false, reason: 'malformed' }
  }

  const { rid, exp } = parsed as { rid: number; exp: number }

  // Constant-time signature comparison
  const expectedSig = computeHmac(payloadJson, secret)

  let sigMatch: boolean
  try {
    const expectedBuf = Buffer.from(expectedSig, 'base64url')
    const providedBuf = Buffer.from(providedSig, 'base64url')
    // Guard against length mismatch (timingSafeEqual requires same length)
    if (expectedBuf.length !== providedBuf.length) {
      sigMatch = false
    } else {
      sigMatch = timingSafeEqual(expectedBuf, providedBuf)
    }
  } catch {
    sigMatch = false
  }

  if (!sigMatch) {
    return { valid: false, reason: 'bad-signature' }
  }

  // Check expiry only after confirming signature is valid
  if (exp < Date.now()) {
    return { valid: false, reason: 'expired' }
  }

  return { valid: true, registrationId: rid }
}
