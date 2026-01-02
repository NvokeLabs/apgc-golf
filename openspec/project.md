# Project Context

## Purpose
APGC Golf is a Payload CMS-powered website built with Next.js 15 and React 19. It serves as a content management platform for a golf-related website, combining a headless CMS backend with a production-ready frontend. The application supports content publishing with draft/publish workflows, SEO optimization, and a flexible layout builder system.

## Tech Stack

### Core
- **Framework:** Next.js 15.4.7 (App Router)
- **React:** 19.1.0
- **Language:** TypeScript 5.7.3 (strict mode)
- **CMS:** Payload 3.64.0
- **Database:** PostgreSQL via @payloadcms/db-postgres
- **Styling:** TailwindCSS 3.4.3
- **UI Components:** shadcn/ui (Radix UI primitives)

### Payload Plugins
- Form Builder (@payloadcms/plugin-form-builder)
- Nested Docs (@payloadcms/plugin-nested-docs)
- Redirects (@payloadcms/plugin-redirects)
- SEO (@payloadcms/plugin-seo)
- Search (@payloadcms/plugin-search)
- Live Preview (@payloadcms/live-preview-react)

### Testing
- **E2E:** Playwright 1.56.1
- **Unit/Integration:** Vitest 3.2.3
- **Test Utilities:** @testing-library/react 16.3.0

### Development
- **Linting:** ESLint 9.16.0
- **Formatting:** Prettier 3.4.2
- **Package Manager:** pnpm (^9 or ^10)
- **Node:** ^18.20.2 or >=20.9.0

## Project Conventions

### Code Style
- **Quotes:** Single quotes
- **Semicolons:** None
- **Trailing Commas:** Always
- **Line Width:** 100 characters
- **Component Naming:** PascalCase for React components
- **Function Naming:** camelCase for functions and utilities
- **File Names:** Match component names (e.g., `Link/index.tsx`)
- **Imports:** Use path aliases `@/*` for `./src/*`

### Architecture Patterns
- **Server Components by Default:** Use 'use client' only when necessary
- **Feature-Based Organization:** Code organized by feature/domain in `/src`
- **Collections Pattern:** Payload collections in `/src/collections/`
- **Reusable Blocks:** Layout blocks in `/src/blocks/` for page building
- **Access Control:** Dedicated access functions in `/src/access/`
- **Utilities:** Helper functions in `/src/utilities/`
- **Context Providers:** Theme and header providers in `/src/providers/`

### Component Structure
```typescript
type ComponentProps = {
  prop1: string
  prop2?: boolean
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>
}
```

### Styling Conventions
- TailwindCSS with custom HSL color variables
- Dark mode via `data-theme="dark"` selector
- Use `cn()` utility for conditional classes (from `/src/utilities/ui.ts`)
- No CSS modules - Tailwind + inline styles only

### Testing Strategy
- **Unit/Integration Tests:** Located in `tests/int/**/*.int.spec.ts`
- **E2E Tests:** Located in `tests/e2e/**/*.e2e.spec.ts`
- **Commands:**
  - `pnpm test` - Run all tests
  - `pnpm test:int` - Unit/integration only
  - `pnpm test:e2e` - E2E only (Playwright)

### Git Workflow
- Feature branches for new work
- Commit messages should be descriptive
- No linter configured on backend (per project guidelines)

## Domain Context
- **Golf Website:** Content focused on golf-related topics
- **Content Types:**
  - Posts (blog articles with categories, authors, related posts)
  - Pages (landing pages with layout builder blocks)
  - Media (images with focal point support)
  - Categories (nested taxonomy)
- **Globals:**
  - Header (navigation configuration)
  - Footer (footer links)

### Layout Blocks Available
- ArchiveBlock (post/page archives)
- Content (rich text)
- MediaBlock (images/videos)
- CallToAction (CTA buttons)
- Form (form builder)
- Code (code snippets)
- Banner (hero banners)
- RelatedPosts (related content)

## Important Constraints
- **TypeScript Strict Mode:** All code must pass strict TypeScript checks
- **No Backend Linter:** Linting not configured for backend code
- **PostgreSQL Required:** Database must be PostgreSQL (configured via DATABASE_URI)
- **Environment Variables Required:**
  - `DATABASE_URI` - PostgreSQL connection string
  - `PAYLOAD_SECRET` - JWT encryption secret
  - `NEXT_PUBLIC_SERVER_URL` - Public URL for CORS/links
  - `CRON_SECRET` - Scheduled publishing auth
  - `PREVIEW_SECRET` - Draft preview validation
  - `XENDIT_SECRET_KEY` - Xendit payment gateway secret key
  - `XENDIT_PUBLIC_KEY` - Xendit payment gateway public key
  - `XENDIT_WEBHOOK_TOKEN` - Token to verify Xendit webhooks
  - `RESEND_API_KEY` - Resend email service API key
  - `BASE_URL` - Base URL for payment callbacks and email links

## External Dependencies
- **PostgreSQL Database:** Primary data store
- **Payload CMS Admin:** Available at `/admin`
- **Next.js API Routes:** Available at `/api/*`

### Key API Endpoints
- `/api/posts` - Posts collection API
- `/api/pages` - Pages collection API
- `/api/media` - Media uploads API
- `/api/users` - User authentication API
- `/api/search` - Search functionality

## Directory Structure Overview
```
src/
├── app/                 # Next.js App Router
│   ├── (frontend)/      # Public routes
│   └── (payload)/       # Admin panel
├── collections/         # Payload collections
├── blocks/              # Layout builder blocks
├── components/          # React components
│   └── ui/              # shadcn/ui components
├── heros/               # Hero section variants
├── access/              # Access control policies
├── fields/              # Reusable field configs
├── hooks/               # Custom hooks
├── providers/           # React context providers
├── utilities/           # Helper functions
└── payload.config.ts    # Main Payload config
```
