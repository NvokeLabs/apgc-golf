# Local Supabase setup

Local dev runs a full Supabase stack (Postgres + Storage + Studio) in Docker so
schema auto-push and storage experiments don't touch the **shared cloud Supabase
project** that `.env` points at.

> Why local: `bun run dev` **auto-pushes schema changes** to whatever
> `DATABASE_URI` points at (this project has no migrations). Running dev against
> the cloud DB mutates shared state on every field change. A local stack isolates
> that. It also gives a real private/public bucket model for the manual-transfer
> proof storage (Story 0).

## Prerequisites
- Docker running
- Supabase CLI: `brew install supabase/tap/supabase` (or `npm i -g supabase`)

## First-time setup
```bash
supabase start                 # boots the stack; prints local URLs + S3 keys
cp .env.local.example .env.local
```
Then fill `.env.local` with the values `supabase start` printed:
- **S3 Access Key** → `SUPABASE_STORAGE_ACCESS_KEY`
- **S3 Secret Key** → `SUPABASE_STORAGE_SECRET_ACCESS_KEY`

(`DATABASE_URI`, ports, and bucket names in the template already match the
`config.toml` in `supabase/`.)

Buckets `golf` (public) and `proofs` (private) are declared in
`supabase/config.toml`, so they exist after `supabase start` — no manual setup.

## Daily use
```bash
supabase start        # if not already running
bun run dev           # connects to local DB; auto-pushes schema changes safely
bun run test:int      # int tests now reach a real local Postgres
```
`supabase stop` to shut down. `supabase status` to re-print ports/keys.
Studio (DB browser) is at http://localhost:54323.

## Caveats
- **Direct connection, no pgbouncer.** Local `DATABASE_URI` uses port 54322 with
  no `?pgbouncer=true` (that flag is for the cloud pooler only).
- **Public-URL rewriting.** `payload.config.ts`'s `generateFileURL` rewrites
  `*.storage.supabase.co/...s3` → public object URLs. That regex won't match the
  local endpoint (`127.0.0.1:54321`), so public media URLs differ locally — to be
  handled when Story 0 reworks storage config (private proofs don't use public
  URLs anyway).
- If `supabase start` rejects `config.toml` (CLI version drift), run
  `supabase init` to regenerate it, then re-add the `[storage.buckets.proofs]`
  block (private; required for Story 0).
