import type { Payload } from 'payload'

import type { VerifyResult } from '@/utilities/uploadToken'

/** Allowed proof MIME types — mirrors the private bucket's allow-list (Story 0). */
export const ALLOWED_PROOF_MIME = ['image/jpeg', 'image/png', 'application/pdf'] as const
/** Max proof size: 10 MB (matches the bucket file_size_limit). */
export const MAX_PROOF_BYTES = 10 * 1024 * 1024

export type ProofUploadFile = {
  filename: string
  mimeType: string
  size: number
  data: Buffer
}

export type ProofUploadDeps = {
  payload: Pick<Payload, 'findByID' | 'create' | 'update'>
  verifyToken: (token: string) => VerifyResult
  notifyProofUploaded?: (registrationId: number) => Promise<void>
}

export type ProofUploadInput = {
  token: string
  file: ProofUploadFile
}

export type ProofUploadErrorCode =
  | 'invalid-token'
  | 'expired'
  | 'not-found'
  | 'already-confirmed'
  | 'invalid-file'

export type ProofUploadResult =
  | { success: true; registrationId: number; status: 'awaiting-verification' }
  | { success: false; code: ProofUploadErrorCode; error: string }

// Statuses from which a registrant may (re)submit a proof. Notably excludes
// `paid` — once approved, the link is read-only.
const UPLOADABLE_STATUSES = new Set([
  'awaiting-payment',
  'awaiting-verification',
  'rejected',
  'unpaid',
])

/**
 * Story 6 — verify a signed upload token and attach a transfer proof.
 *
 * The single highest-risk public surface (T1): driven only by an unguessable
 * token, never a bare registration id. Status-gated (read-only after approval),
 * server-side file validation, writes to the PRIVATE proofs collection, and is
 * field-scoped — only transferProof / paymentStatus / rejectionReason change.
 *
 * Dependency-injected (payload + token verifier) for unit testing.
 */
export async function processProofUpload(
  deps: ProofUploadDeps,
  input: ProofUploadInput,
): Promise<ProofUploadResult> {
  const { payload, verifyToken } = deps

  const verified = verifyToken(input.token)
  if (!verified.valid) {
    if (verified.reason === 'expired') {
      return { success: false, code: 'expired', error: 'Tautan unggah ini telah kedaluwarsa.' }
    }
    return { success: false, code: 'invalid-token', error: 'Tautan unggah ini tidak valid.' }
  }

  const registrationId = verified.registrationId

  const registration = (await payload.findByID({
    collection: 'event-registrations',
    id: registrationId,
    depth: 0,
  })) as { id: number; paymentStatus?: string | null; status?: string | null } | null

  if (!registration) {
    return { success: false, code: 'not-found', error: 'Pendaftaran tidak ditemukan.' }
  }

  // A cancelled registration is terminal — a still-valid token must not be able
  // to flip it back into the verification queue.
  if (registration.status === 'cancelled') {
    return {
      success: false,
      code: 'already-confirmed',
      error: 'Pendaftaran ini telah dibatalkan.',
    }
  }

  // Status gate — checked on the server, not just the token. Once paid, the
  // upload page is read-only.
  if (registration.paymentStatus === 'paid') {
    return {
      success: false,
      code: 'already-confirmed',
      error: 'Pendaftaran ini sudah dikonfirmasi.',
    }
  }
  if (!UPLOADABLE_STATUSES.has(registration.paymentStatus ?? '')) {
    return {
      success: false,
      code: 'already-confirmed',
      error: 'Pendaftaran ini tidak sedang menunggu bukti transfer.',
    }
  }

  // Server-side file validation — never trust the client.
  if (!ALLOWED_PROOF_MIME.includes(input.file.mimeType as (typeof ALLOWED_PROOF_MIME)[number])) {
    return {
      success: false,
      code: 'invalid-file',
      error: 'Hanya berkas JPG, PNG, atau PDF yang diterima.',
    }
  }
  if (input.file.size > MAX_PROOF_BYTES || input.file.size <= 0) {
    return {
      success: false,
      code: 'invalid-file',
      error: 'Ukuran berkas harus 10MB atau lebih kecil.',
    }
  }

  // Store the bytes in the private proofs collection (overrideAccess: this runs
  // server-side on behalf of an unauthenticated registrant).
  const proof = (await payload.create({
    collection: 'proofs',
    overrideAccess: true,
    data: { registration: registrationId },
    file: {
      data: input.file.data,
      mimetype: input.file.mimeType,
      name: input.file.filename,
      size: input.file.size,
    },
  })) as { id: number }

  // Field-scoped update: only these three fields. Clear any prior rejection so a
  // re-upload returns cleanly to the queue (Story 10).
  await payload.update({
    collection: 'event-registrations',
    id: registrationId,
    overrideAccess: true,
    data: {
      transferProof: proof.id,
      paymentStatus: 'awaiting-verification',
      rejectionReason: null,
    },
  })

  try {
    await deps.notifyProofUploaded?.(registrationId)
  } catch (err) {
    console.error('Proof WhatsApp notify failed:', err instanceof Error ? err.message : err)
  }

  return { success: true, registrationId, status: 'awaiting-verification' }
}
