/**
 * Guards the Story 0 privacy invariant: payment proofs must live in their own
 * PRIVATE bucket, never the public media bucket.
 *
 * This catches the two configuration footguns that would silently make proofs
 * world-readable:
 *   1. The proofs bucket is unset while storage is otherwise configured.
 *   2. The proofs bucket is pointed at the same bucket as public media.
 *
 * It cannot verify the bucket is actually marked private on the storage
 * provider (a Supabase-side setting) — that stays an ops checklist item — but
 * it removes the in-code ways to defeat the isolation.
 *
 * @throws if the proofs bucket is missing or collides with the media bucket.
 */
export function assertProofsBucketIsolated(mediaBucket: string, proofsBucket: string): void {
  // No storage configured at all (e.g. a build/test env without S3) — not our
  // concern; let the storage layer no-op rather than block startup.
  if (!mediaBucket && !proofsBucket) return

  if (mediaBucket && !proofsBucket) {
    throw new Error(
      'Private proofs bucket is not configured (SUPABASE_STORAGE_PROOFS_BUCKET is empty) ' +
        'while storage is active. Set it to a dedicated PRIVATE bucket, separate from the public media bucket.',
    )
  }

  if (proofsBucket && proofsBucket === mediaBucket) {
    throw new Error(
      `Private proofs bucket must differ from the public media bucket (both are "${proofsBucket}"). ` +
        'Proofs hold financial PII and must live in a dedicated private bucket.',
    )
  }
}
