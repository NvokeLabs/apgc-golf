'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

import { verifyUploadToken } from '@/utilities/uploadToken'
import { processProofUpload, MAX_PROOF_BYTES } from '@/utilities/registration/processProofUpload'
import { createRateLimiter } from '@/utilities/rateLimiter'

export type UploadProofState = { status: 'idle' | 'success' | 'error'; message?: string }

// Module-level so counts persist across requests within a warm instance.
// Per-token caps a single link; per-IP caps an attacker rotating tokens.
const tokenLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 })
const ipLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 })

/**
 * Server action for the tokenized proof-upload form (Story 6). Parses the
 * upload, applies per-token + per-IP rate limiting, then defers all guard logic
 * (token verification, status gating, file validation, private storage,
 * field-scoped update) to processProofUpload.
 */
export async function submitTransferProof(
  _prev: UploadProofState,
  formData: FormData,
): Promise<UploadProofState> {
  const token = String(formData.get('token') || '')
  const file = formData.get('file')

  if (!token) {
    return { status: 'error', message: 'This upload link is invalid.' }
  }
  if (!(file instanceof File) || file.size === 0) {
    return { status: 'error', message: 'Please choose a file to upload.' }
  }
  // Reject oversize at the boundary, before reading the whole file into memory.
  if (file.size > MAX_PROOF_BYTES) {
    return { status: 'error', message: 'The file must be 10MB or smaller.' }
  }

  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!tokenLimiter.check(token).allowed || !ipLimiter.check(ip).allowed) {
    return {
      status: 'error',
      message: 'Too many attempts. Please wait a minute and try again.',
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const payload = await getPayload({ config })

  const result = await processProofUpload(
    { payload, verifyToken: verifyUploadToken },
    {
      token,
      file: { filename: file.name, mimeType: file.type, size: file.size, data: buffer },
    },
  )

  if (!result.success) {
    return { status: 'error', message: result.error }
  }

  return {
    status: 'success',
    message: 'Your transfer proof was uploaded. We will verify it and email your ticket shortly.',
  }
}
