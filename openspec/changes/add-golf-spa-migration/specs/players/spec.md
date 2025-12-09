# Players Capability

## ADDED Requirements

### Requirement: Players Collection
The system SHALL provide a Players collection in Payload CMS for managing golf player profiles.

#### Scenario: Create player profile
- **WHEN** admin creates a new player with name, country, and member ID
- **THEN** the system creates a player document with auto-generated slug
- **AND** the player appears in the admin panel list

#### Scenario: Player with full profile
- **WHEN** admin provides complete player data including stats, bio, and image
- **THEN** all fields are stored and retrievable via API
- **AND** the player can be marked as "featured"

### Requirement: Player Fields Schema
The Players collection SHALL include the following fields:
- `name` (required text) - Player's full name
- `slug` (auto-generated) - URL-friendly identifier
- `rank` (number) - Current ranking position
- `country` (text) - Player's country
- `image` (media relationship) - Profile photo
- `wins` (number) - Total wins
- `points` (number) - Ranking points
- `age` (number) - Player's age
- `turnedPro` (number) - Year turned professional
- `bio` (rich text) - Player biography
- `recentResults` (array) - Recent tournament results
- `memberId` (text) - Club membership ID
- `gender` (select: Male/Female) - Player gender
- `handicap` (number) - Golf handicap
- `latestGrossScore` (number) - Latest gross score
- `email` (email) - Contact email
- `status` (select: Active/Inactive) - Membership status
- `isFeatured` (checkbox) - Featured on homepage

#### Scenario: Required fields validation
- **WHEN** admin attempts to create player without name
- **THEN** the system rejects the submission with validation error

#### Scenario: Slug auto-generation
- **WHEN** admin creates player named "John Smith"
- **THEN** the system generates slug "john-smith"

### Requirement: Player Directory Page
The system SHALL provide a public `/players` page displaying all active players.

#### Scenario: View player directory
- **WHEN** visitor navigates to `/players`
- **THEN** the system displays a grid of player cards
- **AND** each card shows name, country, rank, and image

#### Scenario: Search players
- **WHEN** visitor enters search term in player directory
- **THEN** the system filters players by name match
- **AND** results update in real-time

#### Scenario: Filter by status
- **WHEN** visitor filters by "Active" status
- **THEN** only active players are displayed

### Requirement: Player Profile Page
The system SHALL provide a public `/players/[slug]` page for individual player profiles.

#### Scenario: View player profile
- **WHEN** visitor navigates to `/players/john-smith`
- **THEN** the system displays full player profile
- **AND** shows bio, stats, recent results, and membership info

#### Scenario: Player not found
- **WHEN** visitor navigates to non-existent player slug
- **THEN** the system displays 404 page

### Requirement: Featured Players Display
The system SHALL display featured players on the homepage.

#### Scenario: Homepage featured players
- **WHEN** visitor views homepage
- **THEN** the system displays players where `isFeatured` is true
- **AND** shows maximum 4 featured players

#### Scenario: No featured players
- **WHEN** no players are marked as featured
- **THEN** the featured players section is hidden
