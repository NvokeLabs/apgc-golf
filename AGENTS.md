# Agent Instructions

> This file mirrors `CLAUDE.md` so any agent runtime (Codex, Cursor, etc.) gets the same guidance. Keep the two in sync — edit both when project conventions change.

## Workflow Policy (MUST follow)

- **Always use TDD.** For every feature or bugfix: write a failing test first (RED), implement the minimum to pass (GREEN), then refactor. No implementation code before a failing test exists. Tests live in `tests/` (Vitest int / Playwright e2e); run with `bun run test:int` / `bun run test:e2e`.
- **Lead with the superpowers skill set** (or your runtime's equivalent process skills): brainstorm before creative work, systematic-debugging before fixing bugs, plan before multi-step work, dispatch subagents for independent tasks, request review and verify before claiming done. Skills define HOW; the task only says WHAT.
- Specs and plans live in `docs/superpowers/specs/` and `docs/superpowers/plans/`.

## Project Overview

**APGC Golf** — a golf-club website and admin for managing events, players, news, sponsors, and paid event registrations. Built on **Payload CMS 3.64** + **Next.js 15.4 (App Router)** + **React 19** + **PostgreSQL** (Supabase), TypeScript throughout.

## Package Manager

This project uses **bun** (`bun.lock` is the canonical, current lockfile). Always use `bun`, not npm/yarn/pnpm:

- Install all: `bun install` · Add: `bun add <pkg>` · Dev dep: `bun add -d <pkg>` · Run script: `bun run <script>`

Note: some `package.json` scripts still call `pnpm`/`tsx` internally (Payload template leftovers). Stale `package-lock.json`/`yarn.lock` exist but are not authoritative — bun is.

## Key Commands

- `bun run dev` — Next dev server (also **auto-pushes DB schema changes**, see below)
- `bun run build` — production build (`next build` + sitemap)
- `bun run generate:types` — regenerate `src/payload-types.ts` after collection/field changes
- `bun run generate:importmap` — regenerate admin import map after adding admin components
- `bun run seed` — seed content (`src/seed/run-seed.ts`)
- `bun run test:int` — Vitest integration tests · `bun run test:e2e` — Playwright E2E
- `bun run lint` / `bun run lint:fix` — ESLint

## Database Schema (IMPORTANT)

**No Payload migrations.** Schema syncs via Payload's **dev auto-push**: after adding/renaming a collection field, run `bun run dev` once to push the column before `bun run build`. Symptom of a missed push: build compiles fine but fails at prerender with `column <x> does not exist`.

## Architecture

- **Payload config:** `src/payload.config.ts` — registers collections, globals, plugins, S3 storage, Resend email, jobs.
- **Collections** (`src/collections/`): `Pages`, `Posts`, `Players`, `Events`, `News`, `Sponsors`, `SponsorshipTiers`, `EventRegistrations`, `SponsorRegistrations`, `Tickets`, `Media`, `Categories`, `Users`. Collection-specific logic lives in per-collection `hooks/`.
- **Globals** (`src/`): `Header`, `Footer`, `SiteLabels`, `HomePage`, `SponsorsPage`, `FormContent` — each in a `config.ts`.
- **Frontend** (`src/app/(frontend)/`): public site — `[slug]` pages, `events/`, `news/`, `players/`, `posts/`, `sponsors/`, `contact/`, `register/`, `search/`. Section components in `_components/`.
- **Admin** (`src/app/(payload)/`): Payload admin + custom API routes under `api/`. Custom admin UI in `src/components/admin/` (custom `Nav`, `BackButton`, `Logo`, `Provider`, and a `CheckInView` at admin path `/check-in`). Admin is shadcn/Radix + Tailwind themed.

## Payments, Tickets & Check-in (domain flow)

- **Payment provider: Xendit.** Event registration creates a payment session via `src/app/(payload)/api/payments/create-session/route.ts` (helpers in `src/utilities/xendit/`). Xendit calls back to `api/payments/webhook/route.ts` (signature verified by `verifyWebhook.ts`).
- On successful payment, **Tickets** are issued with **QR codes** (`qrcode`); a **PDF ticket** is rendered via `@react-pdf/renderer` at `api/tickets/[id]/pdf/route.ts`.
- **Check-in**: staff scan QR (`html5-qrcode`) in the admin `CheckInView`; validated at `api/check-in/validate/route.ts`. Admin dashboard data at `api/admin/dashboard/route.ts`.

## Integrations

- **Storage:** Supabase via `@payloadcms/storage-s3` (forcePathStyle, public URL rewriting). Configured by `SUPABASE_STORAGE_*` env vars.
- **Email:** Resend (`@payloadcms/email-resend`), `RESEND_*` env vars.
- **Jobs/cron:** authorized via `CRON_SECRET` bearer (Vercel cron pattern).
- See `.env.example` for the full env var list.

## UI Conventions

shadcn-style components (`components.json`), Radix primitives, Tailwind 3, `framer-motion`, `lucide-react` icons, Geist font. Class merging via `clsx` + `tailwind-merge`; variants via `class-variance-authority`.
