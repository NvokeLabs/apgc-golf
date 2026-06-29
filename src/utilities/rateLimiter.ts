export type RateLimitCheck = { allowed: boolean; remaining: number; retryAfterMs: number }

export type RateLimiter = { check: (key: string) => RateLimitCheck }

export type RateLimiterOptions = {
  limit: number
  windowMs: number
  /** Injectable clock for testing; defaults to Date.now. */
  now?: () => number
}

/**
 * Fixed-window in-memory rate limiter.
 *
 * NOTE: in-memory state is per-process, so on serverless (Vercel) this is
 * best-effort per warm instance, not a global guarantee. It raises the cost of
 * abuse for Phase 1; a distributed store (Redis/Upstash) is the production
 * hardening (tracked follow-up).
 */
export function createRateLimiter(opts: RateLimiterOptions): RateLimiter {
  const { limit, windowMs } = opts
  const now = opts.now ?? Date.now
  const buckets = new Map<string, { count: number; resetAt: number }>()

  return {
    check(key: string): RateLimitCheck {
      const t = now()
      const bucket = buckets.get(key)

      if (!bucket || t >= bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: t + windowMs })
        return { allowed: true, remaining: limit - 1, retryAfterMs: 0 }
      }

      if (bucket.count < limit) {
        bucket.count += 1
        return { allowed: true, remaining: limit - bucket.count, retryAfterMs: 0 }
      }

      return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - t }
    },
  }
}
