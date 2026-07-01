// Any setup scripts you might need go here

// Load env files with Next.js-style precedence: `.env.local` wins over `.env`.
// dotenv does NOT override already-set vars, so loading `.env.local` FIRST makes
// its values take precedence. This points int tests at the LOCAL Supabase stack
// (see docs/local-supabase-setup.md) instead of the shared cloud project.
import dotenv from 'dotenv'
import { vi } from 'vitest'

dotenv.config({ path: '.env.local' })
dotenv.config()

// Payload collection `afterChange` hooks call `revalidateTag`/`revalidatePath`
// from next/cache on every create/update. Those throw outside a Next request
// context (which integration tests don't have), so stub them to no-ops. This
// applies to all int test files (setup runs before each).
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))
