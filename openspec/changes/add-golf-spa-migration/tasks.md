# Tasks: Golf Site SPA Migration

## Phase 1: Payload Collections & Data Models

### 1.1 Create Collections
- [ ] 1.1.1 Create `Players` collection with fields: name, slug, rank, country, image, wins, points, age, turnedPro, bio, recentResults, memberId, gender, handicap, latestGrossScore, email, status, isFeatured
- [ ] 1.1.2 Create `Events` collection with fields: title, slug, date, location, image, tier (Major/Championship/Qualifier), prizeFund, status, price, description, schedule (array), sponsors (relationship), pairings (array), gallery
- [ ] 1.1.3 Create `News` collection with fields: title, slug, subtitle, category, date, readTime, image, content (rich text), relatedArticles (relationship)
- [ ] 1.1.4 Create `Sponsors` collection with fields: name, slug, logo, tier (Gold/Platinum/Title), benefits (array), website, isActive
- [ ] 1.1.5 Create `EventRegistrations` collection with fields: event (relationship), player name, email, category, paymentMethod, status, registeredAt
- [ ] 1.1.6 Create `SponsorRegistrations` collection with fields: companyName, contactName, email, phone, tier, message, status, submittedAt

### 1.2 Seed Data
- [ ] 1.2.1 Create seed script for sample players (4+ featured, 10+ total)
- [ ] 1.2.2 Create seed script for sample events (3+ events with schedules)
- [ ] 1.2.3 Create seed script for sample news articles (3+ articles)
- [ ] 1.2.4 Create seed script for sample sponsors (10+ sponsors)

## Phase 2: UI Components Migration

### 2.1 Core Components
- [ ] 2.1.1 Create `GlassCard` component with glass-morphism effect and motion animations
- [ ] 2.1.2 Create `ImageWithFallback` component for error handling
- [ ] 2.1.3 Update Navbar component with APGC branding and navigation links
- [ ] 2.1.4 Update Footer component with APGC branding

### 2.2 Player Components
- [ ] 2.2.1 Create `PlayerCard` component (featured player display)
- [ ] 2.2.2 Create `PlayerDetail` component (full player profile)
- [ ] 2.2.3 Create `PlayerGrid` component (searchable/filterable list)
- [ ] 2.2.4 Create `FeaturedPlayers` component (homepage section)

### 2.3 Event Components
- [ ] 2.3.1 Create `EventCard` component (event preview)
- [ ] 2.3.2 Create `EventDetail` component (full event info with tabs)
- [ ] 2.3.3 Create `EventSchedule` component (schedule/pairings display)
- [ ] 2.3.4 Create `EventGrid` component (filterable event listing)
- [ ] 2.3.5 Create `TournamentCard` component (hero tournament display)

### 2.4 News Components
- [ ] 2.4.1 Create `NewsCard` component (article preview)
- [ ] 2.4.2 Create `ArticleView` component (full article display)
- [ ] 2.4.3 Create `NewsGrid` component (searchable news archive)
- [ ] 2.4.4 Create `LatestNews` component (homepage section)
- [ ] 2.4.5 Create `RelatedArticles` component

### 2.5 Sponsor Components
- [ ] 2.5.1 Create `SponsorMarquee` component (auto-scrolling logos)
- [ ] 2.5.2 Create `SponsorTierCard` component (sponsorship package)
- [ ] 2.5.3 Create `SponsorGrid` component (all sponsors display)

### 2.6 Hero & Layout Components
- [ ] 2.6.1 Create `HeroSection` component (full-width hero with gradient overlay)
- [ ] 2.6.2 Create `SectionHeader` component (reusable section titles)

## Phase 3: Payload Blocks

### 3.1 Create Layout Blocks
- [ ] 3.1.1 Create `HeroBlock` config and component
- [ ] 3.1.2 Create `FeaturedPlayersBlock` config and component
- [ ] 3.1.3 Create `EventScheduleBlock` config and component
- [ ] 3.1.4 Create `SponsorsMarqueeBlock` config and component
- [ ] 3.1.5 Create `LatestNewsBlock` config and component
- [ ] 3.1.6 Create `PlayerGridBlock` config and component
- [ ] 3.1.7 Create `EventGridBlock` config and component
- [ ] 3.1.8 Create `SponsorTiersBlock` config and component

### 3.2 Register Blocks
- [ ] 3.2.1 Add new blocks to Payload config
- [ ] 3.2.2 Update RenderBlocks component to handle new blocks

## Phase 4: Frontend Routes

### 4.1 Public Pages
- [ ] 4.1.1 Update homepage (`/`) with hero, events, players, sponsors, news sections
- [ ] 4.1.2 Create `/players` page with player directory
- [ ] 4.1.3 Create `/players/[slug]` page with player profile
- [ ] 4.1.4 Create `/events` page with event listing
- [ ] 4.1.5 Create `/events/[slug]` page with event details
- [ ] 4.1.6 Create `/news` page with news archive
- [ ] 4.1.7 Create `/news/[slug]` page with article view
- [ ] 4.1.8 Create `/sponsors` page with sponsorship info

### 4.2 Registration Pages
- [ ] 4.2.1 Create `/register/event/[eventSlug]` page with registration form
- [ ] 4.2.2 Create `/register/sponsor` page with sponsor application form
- [ ] 4.2.3 Create registration confirmation views

### 4.3 Navigation
- [ ] 4.3.1 Update Header global with new navigation structure
- [ ] 4.3.2 Update Footer global with APGC links
- [ ] 4.3.3 Implement mobile responsive navigation menu

## Phase 5: Performance & Next.js Best Practices

### 5.1 ISR & Caching Setup
- [ ] 5.1.1 Configure ISR revalidation times for all pages (homepage: 3600s, listings: 1800s)
- [ ] 5.1.2 Add `generateStaticParams` to all dynamic routes for static generation
- [ ] 5.1.3 Create revalidation hooks for Players collection (afterChange → revalidatePath)
- [ ] 5.1.4 Create revalidation hooks for Events collection
- [ ] 5.1.5 Create revalidation hooks for News collection
- [ ] 5.1.6 Create revalidation hooks for Sponsors collection
- [ ] 5.1.7 Implement cache tags for granular invalidation

### 5.2 Data Fetching Optimization
- [ ] 5.2.1 Create memoized data fetching utilities using React `cache()`
- [ ] 5.2.2 Implement parallel data fetching with `Promise.all()` on homepage
- [ ] 5.2.3 Add proper error boundaries for data fetching failures
- [ ] 5.2.4 Configure request deduplication for Payload queries

### 5.3 Image Optimization
- [ ] 5.3.1 Update next.config.js with optimized image settings (AVIF, WebP, cache TTL)
- [ ] 5.3.2 Configure Payload Media collection with responsive image sizes (thumbnail, card, hero)
- [ ] 5.3.3 Add blur placeholder generation to Media collection upload hook
- [ ] 5.3.4 Create optimized Image wrapper component with proper sizes prop
- [ ] 5.3.5 Add priority loading for above-the-fold images (hero, first cards)

### 5.4 Loading States & Streaming
- [ ] 5.4.1 Create skeleton components for PlayerCard, EventCard, NewsCard
- [ ] 5.4.2 Add loading.tsx files for all route segments
- [ ] 5.4.3 Implement Suspense boundaries for slow-loading sections
- [ ] 5.4.4 Add streaming for homepage sections

### 5.5 Bundle Optimization
- [ ] 5.5.1 Implement dynamic imports for SponsorMarquee (client-only, heavy animation)
- [ ] 5.5.2 Implement dynamic imports for carousel components
- [ ] 5.5.3 Audit and minimize 'use client' directives
- [ ] 5.5.4 Configure route prefetching for navigation links

## Phase 6: Styling & Polish

### 6.1 Theme Configuration
- [ ] 6.1.1 Add APGC color palette to Tailwind config (#0b3d2e emerald, #D66232 accent)
- [ ] 6.1.2 Add glass-morphism CSS utilities
- [ ] 6.1.3 Add gradient overlay utilities
- [ ] 6.1.4 Add marquee animation CSS

### 6.2 Assets
- [ ] 6.2.1 Add APGC logo to public assets
- [ ] 6.2.2 Add hero background image
- [ ] 6.2.3 Configure image domains in next.config.js

### 6.3 SEO & Meta
- [ ] 6.3.1 Create generateMetadata functions for all dynamic pages
- [ ] 6.3.2 Add JSON-LD structured data for events (Event schema)
- [ ] 6.3.3 Add JSON-LD structured data for organization
- [ ] 6.3.4 Update next-sitemap config for new routes
- [ ] 6.3.5 Add robots.txt configuration

### 6.4 Final Polish
- [ ] 6.4.1 Test responsive layouts (mobile, tablet, desktop)
- [ ] 6.4.2 Test all navigation flows
- [ ] 6.4.3 Test registration forms submission
- [ ] 6.4.4 Run Lighthouse audit and fix issues (target: 90+ performance)
- [ ] 6.4.5 Test Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

## Phase 7: Testing

### 7.1 Integration Tests
- [ ] 7.1.1 Add tests for Players collection API
- [ ] 7.1.2 Add tests for Events collection API
- [ ] 7.1.3 Add tests for News collection API
- [ ] 7.1.4 Add tests for Sponsors collection API
- [ ] 7.1.5 Add tests for registration submissions

### 7.2 E2E Tests
- [ ] 7.2.1 Add E2E tests for homepage navigation
- [ ] 7.2.2 Add E2E tests for player directory and profiles
- [ ] 7.2.3 Add E2E tests for event listing and details
- [ ] 7.2.4 Add E2E tests for news archive and articles
- [ ] 7.2.5 Add E2E tests for registration flows

### 7.3 Performance Tests
- [ ] 7.3.1 Add Lighthouse CI to test pipeline
- [ ] 7.3.2 Test ISR revalidation works correctly
- [ ] 7.3.3 Verify on-demand revalidation triggers properly
- [ ] 7.3.4 Test image optimization is working (check network for WebP/AVIF)
