# Change: Migrate Golf Site SPA to Next.js/Payload CMS

## Why
The existing "Golf Site - Codes" is a React/Vite SPA with hardcoded data and client-side routing. Migrating to Next.js with Payload CMS will provide:
- Content management capabilities for non-technical users
- Server-side rendering for better SEO and performance
- Database-backed content that can be updated without code changes
- Draft/publish workflows for content moderation
- Scalable architecture for future growth

## What Changes

### New Payload Collections
- **Players** - Golf players with stats, bio, handicap, membership info
- **Events** - Tournaments with schedules, pairings, pricing tiers
- **News** - Articles with categories, related content, rich text
- **Sponsors** - Sponsor companies with tier levels and benefits
- **Registrations** - Event and sponsor registration submissions

### New Frontend Routes
- `/` - Homepage with hero, featured events, players, sponsors, news
- `/players` - Players directory with search/filter
- `/players/[slug]` - Individual player profile
- `/events` - Events listing with filters
- `/events/[slug]` - Event details with schedule, pairings, registration
- `/news` - News archive with search
- `/news/[slug]` - Individual article view
- `/sponsors` - Sponsorship tiers and benefits
- `/register/event/[eventSlug]` - Event registration form
- `/register/sponsor` - Sponsor registration form

### New Components (Migrated from SPA)
- Hero section with tournament card
- Player cards and player detail views
- Event cards and event detail views with schedules
- News cards and article views
- Sponsor marquee and tier displays
- Registration forms with confirmation flows
- Glass-morphism card component
- Responsive navigation with mobile menu

### New Payload Blocks
- **HeroBlock** - Full-width hero with background image and CTA
- **FeaturedPlayersBlock** - Player showcase grid
- **EventScheduleBlock** - Upcoming events listing
- **SponsorsMarqueeBlock** - Auto-scrolling sponsor logos
- **LatestNewsBlock** - Recent news articles
- **PlayerGridBlock** - Searchable player directory
- **EventGridBlock** - Filterable event listing
- **SponsorTiersBlock** - Sponsorship package display

### Styling Migration
- Port Tailwind CSS configuration and custom colors (#0b3d2e emerald green theme)
- Migrate glass-morphism effects and gradients
- Port all 51 UI components from shadcn/Radix setup
- Preserve responsive breakpoints and mobile-first design

## Impact

### Affected Specs
- `golf-website` (new) - Core website functionality
- `players` (new) - Player management
- `events` (new) - Event management
- `news` (new) - News/articles management
- `sponsors` (new) - Sponsor management

### Affected Code
- `src/collections/` - New Payload collections
- `src/blocks/` - New layout blocks
- `src/components/` - Migrated React components
- `src/app/(frontend)/` - New Next.js routes
- `tailwind.config.mjs` - Extended color palette
- `src/app/(frontend)/globals.css` - Additional CSS variables

### Migration Strategy
1. **Phase 1**: Create Payload collections and seed with sample data
2. **Phase 2**: Migrate UI components preserving existing design
3. **Phase 3**: Create frontend routes and integrate with Payload
4. **Phase 4**: Add registration forms with Payload form builder
5. **Phase 5**: Testing and polish

### Risk Assessment
- **Medium Risk**: Large scope requires careful phased implementation
- **Low Risk**: Existing component library (shadcn/ui) already in apgc-golf
- **Mitigation**: Incremental delivery with working state after each phase
