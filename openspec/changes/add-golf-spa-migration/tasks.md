# Tasks: Golf Site SPA Migration

## Phase 1: Payload Collections & Data Models

### 1.1 Create Collections
- [x] 1.1.1 Create `Players` collection with fields: name, slug, rank, country, image, wins, points, age, turnedPro, bio, recentResults, memberId, gender, handicap, latestGrossScore, email, status, isFeatured
- [x] 1.1.2 Create `Events` collection with fields: title, slug, date, location, image, tier (Major/Championship/Qualifier), prizeFund, status, price, description, schedule (array), sponsors (relationship), pairings (array), gallery
- [x] 1.1.3 Create `News` collection with fields: title, slug, subtitle, category, date, readTime, image, content (rich text), relatedArticles (relationship)
- [x] 1.1.4 Create `Sponsors` collection with fields: name, slug, logo, tier (Gold/Platinum/Title), benefits (array), website, isActive
- [x] 1.1.5 Create `EventRegistrations` collection with fields: event (relationship), player name, email, category, paymentMethod, status, registeredAt
- [x] 1.1.6 Create `SponsorRegistrations` collection with fields: companyName, contactName, email, phone, tier, message, status, submittedAt

### 1.2 Seed Data
- [x] 1.2.1 Create seed script for sample players (4+ featured, 10+ total)
- [x] 1.2.2 Create seed script for sample events (3+ events with schedules)
- [x] 1.2.3 Create seed script for sample news articles (3+ articles)
- [x] 1.2.4 Create seed script for sample sponsors (10+ sponsors)

## Phase 2: UI Components Migration

### 2.1 Core Components
- [x] 2.1.1 Create `GlassCard` component with glass-morphism effect and motion animations
- [x] 2.1.2 Create `ImageWithFallback` component for error handling
- [x] 2.1.3 Update Navbar component with APGC branding and navigation links
- [x] 2.1.4 Update Footer component with APGC branding

### 2.2 Player Components
- [x] 2.2.1 Create `PlayerCard` component (featured player display)
- [x] 2.2.2 Create `PlayerDetail` component (full player profile)
- [x] 2.2.3 Create `PlayerGrid` component (searchable/filterable list)
- [x] 2.2.4 Create `FeaturedPlayers` component (homepage section)

### 2.3 Event Components
- [x] 2.3.1 Create `EventCard` component (event preview)
- [x] 2.3.2 Create `EventDetail` component (full event info with tabs)
- [x] 2.3.3 Create `EventSchedule` component (schedule/pairings display)
- [x] 2.3.4 Create `EventGrid` component (filterable event listing)
- [x] 2.3.5 Create `TournamentCard` component (hero tournament display)

### 2.4 News Components
- [x] 2.4.1 Create `NewsCard` component (article preview)
- [x] 2.4.2 Create `ArticleView` component (full article display)
- [x] 2.4.3 Create `NewsGrid` component (searchable news archive)
- [x] 2.4.4 Create `LatestNews` component (homepage section)
- [x] 2.4.5 Create `RelatedArticles` component

### 2.5 Sponsor Components
- [x] 2.5.1 Create `SponsorMarquee` component (auto-scrolling logos)
- [x] 2.5.2 Create `SponsorTierCard` component (sponsorship package)
- [x] 2.5.3 Create `SponsorGrid` component (all sponsors display)

### 2.6 Hero & Layout Components
- [x] 2.6.1 Create `HeroSection` component (full-width hero with gradient overlay)
- [x] 2.6.2 Create `SectionHeader` component (reusable section titles)

## Phase 3: Payload Blocks

### 3.1 Create Layout Blocks
- [x] 3.1.1 Create `HeroBlock` config and component
- [x] 3.1.2 Create `FeaturedPlayersBlock` config and component
- [x] 3.1.3 Create `EventScheduleBlock` config and component
- [x] 3.1.4 Create `SponsorsMarqueeBlock` config and component
- [x] 3.1.5 Create `LatestNewsBlock` config and component
- [x] 3.1.6 Create `PlayerGridBlock` config and component
- [x] 3.1.7 Create `EventGridBlock` config and component
- [x] 3.1.8 Create `SponsorTiersBlock` config and component

### 3.2 Register Blocks
- [x] 3.2.1 Add new blocks to Payload config
- [x] 3.2.2 Update RenderBlocks component to handle new blocks

## Phase 4: Frontend Routes

### 4.1 Public Pages
- [x] 4.1.1 Update homepage (`/`) with hero, events, players, sponsors, news sections
- [x] 4.1.2 Create `/players` page with player directory
- [x] 4.1.3 Create `/players/[slug]` page with player profile
- [x] 4.1.4 Create `/events` page with event listing
- [x] 4.1.5 Create `/events/[slug]` page with event details
- [x] 4.1.6 Create `/news` page with news archive
- [x] 4.1.7 Create `/news/[slug]` page with article view
- [x] 4.1.8 Create `/sponsors` page with sponsorship info

### 4.2 Registration Pages
- [x] 4.2.1 Create `/register/event/[eventSlug]` page with registration form
- [x] 4.2.2 Create `/register/sponsor` page with sponsor application form
- [x] 4.2.3 Create registration confirmation views

### 4.3 Navigation
- [x] 4.3.1 Update Header global with new navigation structure
- [x] 4.3.2 Update Footer global with APGC links
- [x] 4.3.3 Implement mobile responsive navigation menu

## Phase 5: Performance & Next.js Best Practices

### 5.1 ISR & Caching Setup
- [x] 5.1.1 Configure ISR revalidation times for all pages (homepage: 3600s, listings: 1800s)
- [x] 5.1.2 Add `generateStaticParams` to all dynamic routes for static generation
- [x] 5.1.3 Create revalidation hooks for Players collection (afterChange → revalidatePath)
- [x] 5.1.4 Create revalidation hooks for Events collection
- [x] 5.1.5 Create revalidation hooks for News collection
- [x] 5.1.6 Create revalidation hooks for Sponsors collection
- [ ] 5.1.7 Implement cache tags for granular invalidation

### 5.2 Data Fetching Optimization
- [x] 5.2.1 Create memoized data fetching utilities using React `cache()`
- [x] 5.2.2 Implement parallel data fetching with `Promise.all()` on homepage
- [x] 5.2.3 Add proper error boundaries for data fetching failures
- [x] 5.2.4 Configure request deduplication for Payload queries

### 5.3 Image Optimization
- [x] 5.3.1 Update next.config.js with optimized image settings (AVIF, WebP, cache TTL)
- [x] 5.3.2 Configure Payload Media collection with responsive image sizes (thumbnail, card, hero)
- [x] 5.3.3 Add blur placeholder generation to Media collection upload hook
- [x] 5.3.4 Create optimized Image wrapper component with proper sizes prop
- [x] 5.3.5 Add priority loading for above-the-fold images (hero, first cards)

### 5.4 Loading States & Streaming
- [x] 5.4.1 Create skeleton components for PlayerCard, EventCard, NewsCard
- [x] 5.4.2 Add loading.tsx files for all route segments
- [x] 5.4.3 Implement Suspense boundaries for slow-loading sections
- [x] 5.4.4 Add streaming for homepage sections

### 5.5 Bundle Optimization
- [x] 5.5.1 Implement dynamic imports for SponsorMarquee (client-only, heavy animation)
- [x] 5.5.2 Implement dynamic imports for carousel components
- [x] 5.5.3 Audit and minimize 'use client' directives
- [x] 5.5.4 Configure route prefetching for navigation links

## Phase 6: Styling & Polish

### 6.1 Theme Configuration
- [x] 6.1.1 Add APGC color palette to Tailwind config (#0b3d2e emerald, #D66232 accent)
- [x] 6.1.2 Add glass-morphism CSS utilities
- [x] 6.1.3 Add gradient overlay utilities
- [x] 6.1.4 Add marquee animation CSS

### 6.2 Assets
- [x] 6.2.1 Add APGC logo to public assets
- [x] 6.2.2 Add hero background image
- [x] 6.2.3 Configure image domains in next.config.js

### 6.3 SEO & Meta
- [x] 6.3.1 Create generateMetadata functions for all dynamic pages
- [x] 6.3.2 Add JSON-LD structured data for events (Event schema)
- [x] 6.3.3 Add JSON-LD structured data for organization
- [x] 6.3.4 Update next-sitemap config for new routes
- [x] 6.3.5 Add robots.txt configuration

### 6.4 Final Polish
- [ ] 6.4.1 Test responsive layouts (mobile, tablet, desktop)
- [ ] 6.4.2 Test all navigation flows
- [ ] 6.4.3 Test registration forms submission
- [ ] 6.4.4 Run Lighthouse audit and fix issues (target: 90+ performance)
- [ ] 6.4.5 Test Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)


