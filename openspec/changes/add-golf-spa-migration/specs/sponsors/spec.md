# Sponsors Capability

## ADDED Requirements

### Requirement: Sponsors Collection
The system SHALL provide a Sponsors collection in Payload CMS for managing sponsor companies.

#### Scenario: Create sponsor
- **WHEN** admin creates a new sponsor with name and logo
- **THEN** the system creates a sponsor document
- **AND** the sponsor appears in the admin panel list

#### Scenario: Sponsor with tier
- **WHEN** admin assigns sponsor to "Platinum Partner" tier
- **THEN** the sponsor is categorized at that tier level

### Requirement: Sponsor Fields Schema
The Sponsors collection SHALL include the following fields:
- `name` (required text) - Company name
- `slug` (auto-generated) - URL-friendly identifier
- `logo` (media relationship) - Company logo
- `tier` (select: Gold Partner/Platinum Partner/Title Sponsor) - Sponsorship level
- `website` (URL) - Company website link
- `description` (text) - Brief company description
- `isActive` (checkbox) - Currently active sponsor
- `order` (number) - Display order within tier

#### Scenario: Tier hierarchy
- **WHEN** sponsors are displayed
- **THEN** Title Sponsors appear first, then Platinum, then Gold

#### Scenario: Active filter
- **WHEN** sponsor is marked inactive
- **THEN** sponsor does not appear on public pages

### Requirement: Sponsor Tier Benefits
The system SHALL define benefits for each sponsorship tier.

#### Scenario: Gold Partner benefits
- **WHEN** displaying Gold Partner tier
- **THEN** show benefits: Logo on website, Social media mentions, Event signage

#### Scenario: Platinum Partner benefits
- **WHEN** displaying Platinum Partner tier
- **THEN** show benefits: All Gold benefits plus VIP access, Speaking opportunity, Premium placement

#### Scenario: Title Sponsor benefits
- **WHEN** displaying Title Sponsor tier
- **THEN** show benefits: All Platinum benefits plus Naming rights, Exclusive branding, Custom activations

### Requirement: Sponsors Marquee
The system SHALL display a scrolling marquee of sponsor logos on the homepage.

#### Scenario: Homepage sponsor marquee
- **WHEN** visitor views homepage
- **THEN** the system displays auto-scrolling carousel of active sponsor logos
- **AND** logos link to sponsor websites

#### Scenario: Marquee animation
- **WHEN** marquee is displayed
- **THEN** logos scroll continuously from right to left
- **AND** animation pauses on hover

#### Scenario: Empty marquee
- **WHEN** no active sponsors exist
- **THEN** the marquee section is hidden

### Requirement: Sponsors Page
The system SHALL provide a public `/sponsors` page displaying sponsorship information.

#### Scenario: View sponsors page
- **WHEN** visitor navigates to `/sponsors`
- **THEN** the system displays sponsorship tier packages
- **AND** shows benefits, pricing, and current sponsors per tier

#### Scenario: Tier cards display
- **WHEN** sponsors page loads
- **THEN** each tier displays as a card with name, price, benefits list, and CTA

#### Scenario: Current sponsors per tier
- **WHEN** tier has active sponsors
- **THEN** sponsor logos display under that tier section

### Requirement: Sponsor Registration
The system SHALL provide sponsor registration functionality at `/register/sponsor`.

#### Scenario: Registration form display
- **WHEN** visitor navigates to sponsor registration page
- **THEN** the system displays form with company name, contact name, email, phone, tier selection, and message

#### Scenario: Tier selection
- **WHEN** visitor selects sponsorship tier
- **THEN** the displayed pricing and benefits update accordingly

#### Scenario: Submit registration
- **WHEN** visitor submits valid sponsor registration form
- **THEN** the system creates SponsorRegistration document
- **AND** displays confirmation with next steps information

#### Scenario: Registration validation
- **WHEN** visitor submits form without required fields
- **THEN** the system displays validation errors
- **AND** does not create registration document

### Requirement: Sponsor Registration Collection
The system SHALL provide a SponsorRegistrations collection for storing sponsor inquiries.

#### Scenario: Registration fields
- **WHEN** sponsor registration is submitted
- **THEN** document includes: companyName, contactName, email, phone, selectedTier, message, status, submittedAt

#### Scenario: Admin review
- **WHEN** admin views sponsor registrations in admin panel
- **THEN** admin can see all submissions with status (Pending/Contacted/Approved/Declined)

#### Scenario: Status update
- **WHEN** admin updates registration status to "Contacted"
- **THEN** the status change is saved and visible in admin panel

### Requirement: Event Sponsors Display
The system SHALL display sponsors on event detail pages.

#### Scenario: Event sponsors section
- **WHEN** visitor views event with linked sponsors
- **THEN** sponsor logos display in sponsors tab/section
- **AND** grouped by tier level
