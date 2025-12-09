# Design: Golf Site SPA Migration

## Context

The "Golf Site - Codes" is a React/Vite SPA for the APGC Alumni Polinema Golf Club. It features:
- Player directory with stats and profiles
- Tournament/event management with schedules and pairings
- News articles and content
- Sponsor showcase with tiered packages
- Registration flows for events and sponsorships

The target platform (apgc-golf) is a Next.js 15 + Payload CMS 3.x application with PostgreSQL.

### Stakeholders
- APGC club administrators (content managers)
- Golf club members (players, sponsors)
- Public visitors

### Constraints
- Must preserve existing visual design (glass-morphism, emerald green theme)
- Must support content management without code changes
- Must be mobile-responsive
- TypeScript strict mode required

## Goals / Non-Goals

### Goals
- Migrate all SPA features to Next.js with server-side rendering
- Create Payload CMS collections for all content types
- Enable non-technical users to manage content via admin panel
- Preserve existing UI/UX and design system
- Support draft/publish workflows for content moderation

### Non-Goals
- User authentication for public visitors (admin-only auth)
- Payment processing integration (registrations are inquiry-only)
- Real-time features (leaderboards, live scoring)
- Mobile app development

## Decisions

### 1. Collection Architecture

**Decision**: Create 6 Payload collections with clear separation of concerns

```
Collections:
├── Players      - Core player data and profiles
├── Events       - Tournaments with nested schedule data
├── News         - Articles with rich text content
├── Sponsors     - Company sponsors with tier relationships
├── EventRegistrations    - Event signup submissions
└── SponsorRegistrations  - Sponsor inquiry submissions
```

**Rationale**:
- Separates content types for clear admin UX
- Registration collections allow form submissions without authentication
- Relationships enable cross-referencing (event sponsors, related articles)

**Alternatives Considered**:
- Single "Content" collection with type field - rejected for admin complexity
- Separate collection per registration type - chosen for data isolation

### 2. Route Structure

**Decision**: Use Next.js App Router with route groups

```
app/(frontend)/
├── page.tsx                    # Homepage
├── players/
│   ├── page.tsx               # Player directory
│   └── [slug]/page.tsx        # Player profile
├── events/
│   ├── page.tsx               # Events listing
│   └── [slug]/page.tsx        # Event details
├── news/
│   ├── page.tsx               # News archive
│   └── [slug]/page.tsx        # Article view
├── sponsors/
│   └── page.tsx               # Sponsorship info
└── register/
    ├── event/[eventSlug]/page.tsx  # Event registration
    └── sponsor/page.tsx            # Sponsor application
```

**Rationale**:
- Clean URL structure matching SPA navigation
- Dynamic routes for content pages
- Grouped registration routes under `/register`

### 3. Component Migration Strategy

**Decision**: Migrate components in layers - primitives first, then composites

```
Layer 1: UI Primitives (already exists in apgc-golf)
├── button, input, select, card, etc.
└── Use existing shadcn/ui components

Layer 2: Custom Primitives (migrate from SPA)
├── GlassCard - glass-morphism effect
├── ImageWithFallback - error handling
└── SectionHeader - consistent section titles

Layer 3: Feature Components (migrate from SPA)
├── PlayerCard, PlayerDetail, PlayerGrid
├── EventCard, EventDetail, EventSchedule
├── NewsCard, ArticleView, NewsGrid
├── SponsorMarquee, SponsorTierCard
└── HeroSection, TournamentCard

Layer 4: Page Compositions
└── Assemble components into full pages
```

**Rationale**:
- Leverages existing shadcn/ui setup in apgc-golf
- Reduces duplication and maintains consistency
- Clear dependency hierarchy

### 4. Data Fetching Pattern

**Decision**: Server Components with Payload local API

```typescript
// Example: Players page
async function PlayersPage() {
  const payload = await getPayload({ config: configPromise })
  const players = await payload.find({
    collection: 'players',
    where: { status: { equals: 'active' } },
    sort: '-rank',
  })
  return <PlayerGrid players={players.docs} />
}
```

**Rationale**:
- Direct database access without HTTP overhead
- Type-safe with generated Payload types
- Server-rendered for SEO

**Alternatives Considered**:
- REST API calls - rejected for unnecessary network hop
- GraphQL - rejected for complexity without benefit

### 5. Styling Approach

**Decision**: Extend existing Tailwind config with APGC theme

```javascript
// tailwind.config.mjs additions
colors: {
  apgc: {
    primary: '#0b3d2e',      // Emerald green
    accent: '#D66232',        // Orange accent
    light: '#f8faf9',         // Light background
  }
}
```

**Rationale**:
- Consistent with existing apgc-golf setup
- Easy to maintain APGC brand colors
- Works with existing dark mode system

### 6. Registration Handling

**Decision**: Use Payload collections for registration storage (not form builder plugin)

**Rationale**:
- More control over form fields and validation
- Custom admin views for managing registrations
- Simpler data model for this use case

**Registration Flow**:
1. User fills form on frontend
2. Form submits to API route
3. API creates Payload document
4. Confirmation displayed to user
5. Admin reviews in Payload admin panel

### 7. Next.js Performance Best Practices

**Decision**: Implement ISR, caching strategies, and optimized image handling

#### 7.1 Incremental Static Regeneration (ISR)

```typescript
// Example: Players listing with ISR
export const revalidate = 3600 // Revalidate every hour

// Example: Individual player page with on-demand revalidation
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const players = await payload.find({ collection: 'players', limit: 100 })
  return players.docs.map((player) => ({ slug: player.slug }))
}
```

**Page Revalidation Strategy**:
| Page | Strategy | Revalidate Time |
|------|----------|-----------------|
| Homepage | ISR | 1 hour (3600s) |
| Players listing | ISR | 1 hour |
| Player profile | ISR + On-demand | 24 hours + webhook |
| Events listing | ISR | 30 minutes (1800s) |
| Event details | ISR + On-demand | 1 hour + webhook |
| News listing | ISR | 30 minutes |
| News article | ISR + On-demand | 24 hours + webhook |
| Sponsors | ISR | 24 hours |

**On-demand Revalidation**:
- Use Payload `afterChange` hooks to trigger `revalidatePath()` or `revalidateTag()`
- Ensures immediate updates when content changes in admin

```typescript
// src/collections/Players/hooks/revalidatePlayer.ts
export const revalidatePlayer: CollectionAfterChangeHook = async ({ doc }) => {
  revalidatePath('/players')
  revalidatePath(`/players/${doc.slug}`)
  revalidateTag('players')
}
```

#### 7.2 Caching Strategy

**Data Cache with Tags**:
```typescript
// Fetch with cache tags for granular invalidation
const players = await payload.find({
  collection: 'players',
  // Use unstable_cache for additional caching layer
})

// Or with fetch cache
const data = await fetch(url, {
  next: { tags: ['players'], revalidate: 3600 }
})
```

**Request Memoization**:
- React automatically memoizes fetch requests in Server Components
- Use `cache()` from React for Payload local API calls

```typescript
import { cache } from 'react'

export const getPlayer = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  return payload.find({
    collection: 'players',
    where: { slug: { equals: slug } },
    limit: 1,
  })
})
```

**Static vs Dynamic**:
- Default to static rendering (`force-static`)
- Use `dynamic = 'force-dynamic'` only for registration forms
- Use `dynamic = 'error'` to catch accidental dynamic usage

#### 7.3 Image Optimization

**Next.js Image Component**:
```typescript
import Image from 'next/image'

// All images use Next.js Image for automatic optimization
<Image
  src={player.image.url}
  alt={player.name}
  width={400}
  height={300}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL={player.image.blurDataURL}
/>
```

**Image Sizes Configuration**:
```typescript
// next.config.js
images: {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 31536000, // 1 year
}
```

**Payload Media Collection with Sizes**:
```typescript
// Generate responsive image sizes at upload
imageSizes: [
  { name: 'thumbnail', width: 150, height: 150 },
  { name: 'card', width: 400, height: 300 },
  { name: 'hero', width: 1920, height: 1080 },
]
```

**Blur Placeholder Generation**:
- Generate blur data URLs during Payload upload
- Store in media document for instant placeholder display

#### 7.4 Loading & Streaming

**Suspense Boundaries**:
```typescript
// Wrap slow components in Suspense
<Suspense fallback={<PlayerGridSkeleton />}>
  <PlayerGrid />
</Suspense>
```

**Loading States**:
- Create `loading.tsx` files for route-level loading UI
- Use skeleton components matching final layout

```
app/(frontend)/
├── players/
│   ├── loading.tsx    # Skeleton for players list
│   └── [slug]/
│       └── loading.tsx # Skeleton for player profile
```

**Parallel Data Fetching**:
```typescript
// Fetch data in parallel, not sequentially
async function HomePage() {
  const [players, events, news, sponsors] = await Promise.all([
    getFeaturedPlayers(),
    getUpcomingEvents(),
    getLatestNews(),
    getActiveSponsors(),
  ])
  return <Home players={players} events={events} ... />
}
```

#### 7.5 Metadata & SEO

**Dynamic Metadata**:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const player = await getPlayer(params.slug)
  return {
    title: `${player.name} | APGC Golf`,
    description: player.bio?.substring(0, 160),
    openGraph: {
      images: [{ url: player.image.url }],
    },
  }
}
```

**Sitemap Generation**:
- Use existing `next-sitemap` setup
- Add dynamic routes for players, events, news

#### 7.6 Bundle Optimization

**Dynamic Imports for Heavy Components**:
```typescript
// Lazy load carousel, charts, or heavy animations
const SponsorMarquee = dynamic(() => import('@/components/SponsorMarquee'), {
  loading: () => <SponsorMarqueeSkeleton />,
  ssr: false, // Client-only for animation-heavy components
})
```

**Package Analysis**:
- Use `@next/bundle-analyzer` to identify large dependencies
- Prefer lightweight alternatives (e.g., `motion` over full `framer-motion`)

## Risks / Trade-offs

### Risk: Large Scope
- **Impact**: High - 50+ files to create/modify
- **Mitigation**: Phased implementation with working state after each phase
- **Acceptance**: Each phase delivers usable functionality

### Risk: Design Fidelity
- **Impact**: Medium - Visual differences from original SPA
- **Mitigation**: Component-by-component visual comparison
- **Acceptance**: Core visual identity preserved, minor differences acceptable

### Risk: Performance Regression
- **Impact**: Low - Server rendering should improve performance
- **Mitigation**: Use Next.js Image optimization, proper caching
- **Acceptance**: Lighthouse score >= 90

### Trade-off: Complexity vs Flexibility
- **Choice**: More collections = more admin flexibility
- **Cost**: Slightly more complex data relationships
- **Benefit**: Clear content organization, easier to extend

## Migration Plan

### Phase 1: Data Foundation (Collections + Seed)
- Create all 6 collections
- Seed with sample data from SPA
- Verify admin panel functionality
- **Rollback**: Delete collection configs

### Phase 2: Component Library
- Migrate UI components
- Create Storybook stories (optional)
- Visual testing
- **Rollback**: Remove new component files

### Phase 3: Layout Blocks
- Create Payload blocks for page building
- Test in admin panel
- **Rollback**: Remove block configs

### Phase 4: Frontend Routes
- Create all public routes
- Integrate with Payload data
- Navigation updates
- **Rollback**: Remove route files, revert navigation

### Phase 5: Forms & Polish
- Registration forms
- Final styling
- Testing
- **Rollback**: Remove form routes

## Open Questions

1. **Email notifications**: Should registrations trigger email notifications? (Requires email service setup)

2. **Image storage**: Use local filesystem or external storage (S3, Cloudinary)?

3. **Search**: Use Payload search plugin or implement custom search?

4. **Analytics**: Add tracking for registration conversions?
