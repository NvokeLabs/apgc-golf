# News Capability

## ADDED Requirements

### Requirement: News Collection
The system SHALL provide a News collection in Payload CMS for managing articles and news content.

#### Scenario: Create article
- **WHEN** admin creates a new article with title and content
- **THEN** the system creates a news document with auto-generated slug
- **AND** the article appears in the admin panel list

#### Scenario: Article with rich content
- **WHEN** admin writes article with images, headings, and formatted text
- **THEN** rich text content is stored and rendered correctly

### Requirement: News Fields Schema
The News collection SHALL include the following fields:
- `title` (required text) - Article headline
- `slug` (auto-generated) - URL-friendly identifier
- `subtitle` (text) - Article subheading
- `category` (select: Tournament Recap/Course Design/Instruction/Club News/Member Spotlight) - Content category
- `publishedDate` (date) - Publication date
- `readTime` (text) - Estimated read time (e.g., "5 min read")
- `image` (media relationship) - Featured image
- `content` (rich text with Lexical) - Article body
- `relatedArticles` (relationship to News, multiple) - Related content links
- `author` (relationship to Users) - Article author
- `status` (draft/published) - Publication status

#### Scenario: Category selection
- **WHEN** admin selects "Tournament Recap" category
- **THEN** the article is categorized for filtering

#### Scenario: Related articles
- **WHEN** admin links 2 related articles
- **THEN** related articles display on article page

### Requirement: News Archive Page
The system SHALL provide a public `/news` page displaying all published articles.

#### Scenario: View news archive
- **WHEN** visitor navigates to `/news`
- **THEN** the system displays published articles sorted by date descending
- **AND** each article card shows title, subtitle, category, date, and image

#### Scenario: Search articles
- **WHEN** visitor enters search term in news archive
- **THEN** the system filters articles by title and content match

#### Scenario: Filter by category
- **WHEN** visitor filters by "Tournament Recap" category
- **THEN** only articles in that category are displayed

#### Scenario: Pagination
- **WHEN** more than 9 articles exist
- **THEN** the system displays pagination controls
- **AND** shows 9 articles per page

### Requirement: Article Detail Page
The system SHALL provide a public `/news/[slug]` page for individual articles.

#### Scenario: View article
- **WHEN** visitor navigates to `/news/spring-championship-recap`
- **THEN** the system displays full article content
- **AND** shows title, subtitle, author, date, read time, and featured image

#### Scenario: Rich text rendering
- **WHEN** article contains headings, images, and formatted text
- **THEN** all rich text elements render correctly with proper styling

#### Scenario: Related articles section
- **WHEN** article has related articles linked
- **THEN** related articles display at end of article
- **AND** each shows thumbnail, title, and category

#### Scenario: Article not found
- **WHEN** visitor navigates to non-existent article slug
- **THEN** the system displays 404 page

### Requirement: Homepage News Section
The system SHALL display latest news on the homepage.

#### Scenario: Latest news display
- **WHEN** visitor views homepage
- **THEN** the system displays 3 most recent published articles
- **AND** shows featured article prominently with smaller cards for others

#### Scenario: No published articles
- **WHEN** no articles are published
- **THEN** the news section is hidden on homepage

### Requirement: SEO Optimization
The system SHALL generate appropriate meta tags for news articles.

#### Scenario: Article meta tags
- **WHEN** article page is rendered
- **THEN** the system generates title, description, and Open Graph tags
- **AND** uses article title, subtitle, and featured image
