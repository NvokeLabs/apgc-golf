import { describe, it, expect } from 'vitest'
import { createRateLimiter } from '@/utilities/rateLimiter'

/**
 * Story 6 abuse protection — a fixed-window in-memory rate limiter used to cap
 * proof-upload attempts per token and per IP.
 */
describe('createRateLimiter', () => {
  it('allows up to the limit, then denies within the window', () => {
    const t = 1000
    const rl = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => t })
    expect(rl.check('k').allowed).toBe(true)
    expect(rl.check('k').allowed).toBe(true)
    expect(rl.check('k').allowed).toBe(true)
    const denied = rl.check('k')
    expect(denied.allowed).toBe(false)
    expect(denied.retryAfterMs).toBeGreaterThan(0)
  })

  it('tracks distinct keys independently', () => {
    const t = 0
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t })
    expect(rl.check('a').allowed).toBe(true)
    expect(rl.check('b').allowed).toBe(true) // different key, fresh budget
    expect(rl.check('a').allowed).toBe(false)
  })

  it('resets after the window elapses', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t })
    expect(rl.check('k').allowed).toBe(true)
    expect(rl.check('k').allowed).toBe(false)
    t = 1001
    expect(rl.check('k').allowed).toBe(true)
  })
})
