import { describe, it, expect } from 'vitest'
import { assertProofsBucketIsolated } from '@/utilities/storage/assertProofsBucketIsolated'

/**
 * Story 0 hardening: the private proofs bucket must never collide with the
 * public media bucket. If it did, proofs would be written to a world-readable
 * bucket and the entire access-control guarantee would silently break.
 */
describe('assertProofsBucketIsolated', () => {
  it('passes when the buckets are distinct and both set', () => {
    expect(() => assertProofsBucketIsolated('golf', 'proofs')).not.toThrow()
  })

  it('throws when the proofs bucket equals the public media bucket', () => {
    expect(() => assertProofsBucketIsolated('golf', 'golf')).toThrow(/proofs bucket/i)
  })

  it('throws when the proofs bucket is empty', () => {
    expect(() => assertProofsBucketIsolated('golf', '')).toThrow(/proofs bucket/i)
  })

  it('does not throw merely because the media bucket is unset (storage off)', () => {
    // An environment with no storage configured at all should not be blocked by
    // this guard — only the dangerous collision / missing-private-bucket cases.
    expect(() => assertProofsBucketIsolated('', '')).not.toThrow()
  })
})
