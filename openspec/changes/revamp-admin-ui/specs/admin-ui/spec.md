## ADDED Requirements

### Requirement: Admin Theme and Styling

The admin panel SHALL use a custom theme matching the cms-latest design with:

- Background color: #F6F7FB (light lavender)
- Primary accent: #ed5f24 (orange)
- Sidebar background: #171046 (dark blue)
- Card backgrounds: #ffffff (white)
- Border color: rgba(23, 16, 70, 0.1)
- Muted text: #717182

#### Scenario: Theme applied to admin panel

- **WHEN** a user navigates to /admin
- **THEN** the admin panel displays with the custom theme colors
- **AND** all components use consistent styling

---

### Requirement: Custom Sidebar Navigation

The admin panel SHALL display a custom dark sidebar with:

- APGC CMS logo and environment badge
- Dashboard link (standalone)
- Media link (standalone)
- Collapsible Content section (Pages, News, Events, Players, Sponsors)
- Collapsible Workflow section (Event Registrations, Sponsor Registrations, Form Submissions, Tickets)
- Collapsible Settings section (Forms, Categories, Header, Footer, Redirects, Users)
- Active state indicator (orange left border)
- Hover effects on navigation items

#### Scenario: User navigates using sidebar

- **WHEN** a user clicks on a navigation item in the sidebar
- **THEN** the corresponding page/view loads
- **AND** the clicked item shows active state styling

#### Scenario: Sidebar sections are collapsible

- **WHEN** a user clicks on a section header (Content, Workflow, Settings)
- **THEN** the section expands or collapses
- **AND** the accordion state persists during the session

---

### Requirement: Top Header Bar

The admin panel SHALL display a top header bar containing:

- Breadcrumb navigation showing current location
- Global search input with keyboard shortcut indicator (Cmd+K)
- Notifications bell icon with unread badge
- User profile dropdown with avatar, account, settings, logout options

#### Scenario: Breadcrumbs reflect current page

- **WHEN** a user navigates to /admin/collections/players
- **THEN** the breadcrumb shows "Content > Players"

#### Scenario: User opens notifications

- **WHEN** a user clicks the notifications bell icon
- **THEN** a popover displays showing recent notifications
- **AND** unread notifications are visually distinguished

---

### Requirement: Dashboard with Real-Time Metrics

The admin dashboard SHALL display metrics cards showing:

- Total Players count (from players collection)
- Upcoming Events count (events with future dates)
- Pending Registrations count (event-registrations with pending status)
- Active Sponsors count (from sponsors collection)

Each metric card SHALL show the count and a trend indicator.

#### Scenario: Dashboard displays accurate counts

- **WHEN** a user views the dashboard
- **THEN** the metrics display current counts from the database
- **AND** the data refreshes on page load

#### Scenario: Pending registrations alert

- **WHEN** there are pending registrations
- **THEN** the Pending Registrations card shows an alert indicator (amber color)

---

### Requirement: Dashboard Activity Feed

The dashboard SHALL display a Recent Activity section showing:

- Recent event registrations
- Recent sponsor registrations
- Recent form submissions

Each activity item SHALL show description, timestamp, and link to the item.

#### Scenario: Activity feed shows recent items

- **WHEN** a user views the dashboard
- **THEN** the activity feed displays the 10 most recent activities
- **AND** items are sorted by most recent first

---

### Requirement: Dashboard Quick Actions

The dashboard SHALL display Quick Actions including:

- Create New Event button
- Create New Player button
- View Registrations button
- Open Check-In Scanner button (links to /admin/check-in)

#### Scenario: Quick action navigation

- **WHEN** a user clicks a quick action button
- **THEN** they are navigated to the corresponding page

---

### Requirement: Notifications System

The admin panel SHALL display real notifications from:

- New event registrations (created in last 24 hours)
- New sponsor registrations (created in last 24 hours)
- New form submissions (created in last 24 hours)

#### Scenario: Notification appears for new registration

- **WHEN** a new event registration is created
- **AND** a user views the notifications within 24 hours
- **THEN** the notification appears in the notifications list

#### Scenario: Mark notification as read

- **WHEN** a user clicks "Mark all as read"
- **THEN** all notifications are marked as read
- **AND** the unread badge count resets

---

### Requirement: Custom Collection List Views

Each collection SHALL have a custom list view with:

- Page title and "Create New" button
- Search input for filtering
- Column visibility toggle
- Filter controls
- Sortable column headers
- Checkbox selection for bulk actions
- Pagination controls

#### Scenario: User searches in list view

- **WHEN** a user types in the search input
- **THEN** the list filters to show matching items

#### Scenario: User sorts by column

- **WHEN** a user clicks a column header
- **THEN** the list sorts by that column
- **AND** the sort direction indicator updates

---

### Requirement: Tickets List View

The Tickets collection SHALL have a custom list view displaying:

- Ticket Code column
- Event Name column (from related event)
- Attendee Name column (from related registration)
- Status column (pending, checked_in, cancelled)
- Checked In At column (timestamp)

#### Scenario: Filter tickets by event

- **WHEN** a user filters by a specific event
- **THEN** only tickets for that event are displayed

#### Scenario: Filter tickets by status

- **WHEN** a user filters by status (e.g., "checked_in")
- **THEN** only tickets with that status are displayed

---

### Requirement: Tickets Check-In Integration

The Tickets section SHALL integrate with the check-in functionality:

- Quick action to open check-in scanner
- Manual check-in button on ticket detail
- Status update capability (cancel ticket)

#### Scenario: Manual check-in from ticket detail

- **WHEN** an admin clicks "Mark as Checked In" on a pending ticket
- **THEN** the ticket status updates to "checked_in"
- **AND** the checked_in_at timestamp is recorded

#### Scenario: Access check-in scanner from tickets

- **WHEN** a user clicks "Open Check-In Scanner" from Tickets section
- **THEN** they are navigated to /admin/check-in

---

### Requirement: Custom Create/Edit Forms

Create and edit forms SHALL use custom styling matching cms-latest:

- Form sections with clear labels
- Input fields with consistent styling
- Image upload with preview
- Rich text editor styling
- Save/Cancel action buttons

#### Scenario: User creates a new player

- **WHEN** a user fills out the create player form
- **AND** clicks Save
- **THEN** the player is created in the database
- **AND** the user sees a success message

---

### Requirement: Globals Configuration Views

Header and Footer globals SHALL have custom configuration views matching cms-latest styling.

#### Scenario: User edits header configuration

- **WHEN** a user navigates to Header settings
- **THEN** they see the header configuration form with custom styling

---

### Requirement: Responsive Admin Layout

The admin layout SHALL be responsive:

- Sidebar hidden on mobile devices (< md breakpoint)
- Mobile search trigger button
- Responsive grid for dashboard metrics
- Tables scroll horizontally on small screens

#### Scenario: Mobile sidebar behavior

- **WHEN** a user views admin on a mobile device
- **THEN** the sidebar is hidden by default
- **AND** a menu trigger can show/hide the sidebar
