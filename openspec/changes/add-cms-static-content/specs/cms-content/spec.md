## ADDED Requirements

### Requirement: SiteLabels Global

The system SHALL provide a SiteLabels Global that stores common UI labels, button text, and status indicators used across the site.

#### Scenario: Admin edits status label

- **WHEN** admin updates "registrationOpen" label to "Open for Registration"
- **THEN** all frontend pages displaying registration status show "Open for Registration"

#### Scenario: Labels available in frontend

- **WHEN** frontend page loads
- **THEN** status labels, button labels, field labels, and navigation labels are fetched from CMS

### Requirement: HomePage Global

The system SHALL provide a HomePage Global that stores hero section content, section headings, and broadcast schedule for the home page.

#### Scenario: Admin updates hero content

- **WHEN** admin changes hero tagline from "The 2025 Season Finale" to "The 2026 Championship"
- **THEN** home page displays "The 2026 Championship" in hero section

#### Scenario: Admin manages broadcast schedule

- **WHEN** admin adds a new round to broadcast schedule array
- **THEN** home page broadcast section displays the new round

### Requirement: SponsorsPage Global

The system SHALL provide a SponsorsPage Global that stores marketing content for the sponsors page including header, "Why Partner" section, and CTA content.

#### Scenario: Admin updates partnership benefits

- **WHEN** admin modifies "Why Partner With Us" benefits array
- **THEN** sponsors page displays updated benefits

### Requirement: FormContent Global

The system SHALL provide a FormContent Global that stores form labels, placeholders, success messages, and error messages for registration forms.

#### Scenario: Admin updates form label

- **WHEN** admin changes "Full Name" label to "Your Full Name"
- **THEN** event registration form displays "Your Full Name" as the field label

#### Scenario: Admin updates success message

- **WHEN** admin modifies registration success title
- **THEN** success page displays the new title

### Requirement: SponsorshipTiers Collection

The system SHALL provide a SponsorshipTiers collection that manages sponsorship tier pricing and benefits independently from sponsor records.

#### Scenario: Admin creates sponsorship tier

- **WHEN** admin creates a new tier with name, price, and benefits
- **THEN** tier appears on sponsors page and sponsor registration page

#### Scenario: Admin updates tier pricing

- **WHEN** admin changes Gold Partner price from "Rp 100,000,000" to "Rp 150,000,000"
- **THEN** both sponsors page and registration page show updated price

#### Scenario: Admin deactivates tier

- **WHEN** admin sets tier isActive to false
- **THEN** tier no longer appears on frontend pages

### Requirement: Content Revalidation

The system SHALL revalidate frontend cache when CMS content is updated.

#### Scenario: Global content update triggers revalidation

- **WHEN** admin saves changes to any content global
- **THEN** affected frontend pages are revalidated within the cache TTL

#### Scenario: SponsorshipTiers update triggers revalidation

- **WHEN** admin creates, updates, or deletes a sponsorship tier
- **THEN** sponsors page and registration pages are revalidated
