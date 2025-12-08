# Feature Specification: Client Landing Page with Weekly Calendar and Results

**Feature Branch**: `001-landing-calendar-graphs`  
**Created**: 2025-12-08  
**Status**: Draft  
**Input**: User description: "I want a clear landing page for a client that has a weekly calendar and some results graphs, and navigation to core sections of the app"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See my week at a glance (Priority: P1)

Clients want to open the app and immediately see their current week's scheduled sessions with status and times.

**Why this priority**: Calendar visibility is the primary reason to visit the landing page and avoids missed or late sessions.

**Independent Test**: Open the landing page as a client with scheduled sessions and verify the week view shows accurate days, times, and statuses without needing other pages.

**Acceptance Scenarios**:

1. **Given** a logged-in client with sessions scheduled in the current week, **When** they open the landing page, **Then** the current week displays with each session labeled by day, time, and status (planned/completed/missed).
2. **Given** a client browsing a prior or upcoming week, **When** they choose "Back to this week," **Then** the view returns to the current week with today highlighted.

---

### User Story 2 - Track my progress from the landing page (Priority: P2)

Clients want quick visual feedback on how their training is trending without digging into reports.

**Why this priority**: Seeing progress (or gaps) drives adherence and confidence in the program.

**Independent Test**: Load the landing page and verify progress graphs render recent performance metrics with clear legends and time windows independent of calendar interactions.

**Acceptance Scenarios**:

1. **Given** at least four weeks of session data, **When** the client views the results area, **Then** they see at least two graphs (e.g., weekly volume and completion rate) with time frames and units labeled.
2. **Given** the client has minimal or missing history, **When** the results area loads, **Then** an empty-state message explains the absence of data and how to generate results (e.g., complete sessions).

---

### User Story 3 - Jump to core sections quickly (Priority: P3)

Clients want one-click access from the landing page to the main areas they use most (plan, log, coach messaging, and results).

**Why this priority**: Reduces friction and keeps the landing page a true hub rather than a dead-end.

**Independent Test**: From the landing page, click each navigation target and confirm it opens the intended section without extra steps.

**Acceptance Scenarios**:

1. **Given** the landing page is loaded, **When** the client selects a navigation link (Program, Sessions, Messages, Reports), **Then** they arrive on that section with state preserved (e.g., no loss of login or filters).
2. **Given** a section that needs attention (e.g., missed session), **When** the client sees the navigation area, **Then** the relevant link shows a badge or note indicating action needed.

---

### Edge Cases

- No scheduled sessions for the week: show an empty state with a prompt to add or request sessions.
- Time zone differences (client vs. coach): calendar and times reflect the client's local time while noting source time where relevant.
- Missed or rescheduled sessions mid-week: updates reflected on refresh without stale events.
- Very narrow screens: calendar and graphs collapse responsively without hiding labels needed to interpret them.
- Sparse or inconsistent historical data: graphs avoid misleading trends and label gaps clearly.
- Restricted or onboarding clients: navigation only shows sections they can access and hides blocked destinations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing page MUST default to the current week and display each session's day, local time, title, and status (planned/completed/missed/changed).
- **FR-002**: Clients MUST be able to move to previous/next weeks and return to "this week" in one action.
- **FR-003**: Selecting a session in the calendar MUST reveal key details (session type, duration, coach notes/highlights, location or modality).
- **FR-004**: When no sessions exist for a shown week, the calendar MUST present an empty-state message with the next best action (e.g., request or add a session).
- **FR-005**: The landing page MUST show at least two results graphs by default that summarize recent performance (including sessions completed vs. scheduled as a completion rate) with units, date ranges, and legends.
- **FR-006**: Results graphs MUST clearly indicate incomplete or missing data (e.g., greyed bars or "no data" labels) rather than implying zero.
- **FR-007**: A navigation area MUST provide one-click access to the core sections: Program, Sessions, Messages/Coach Chat, and Reports.
- **FR-008**: Navigation items MUST surface badges or highlights when a section needs attention (e.g., missed session, unread coach note).
- **FR-009**: The landing page MUST load calendar, navigation, and results areas without requiring additional authentication steps after login.

### Key Entities *(include if feature involves data)*

- **Week View**: The seven-day window shown on load or via week navigation, anchored to the client's local timezone.
- **Session Entry**: A scheduled workout/session with attributes including day/time, status, type, duration, modality/location, and coach notes.
- **Metric Snapshot**: Aggregated performance values for a time range (e.g., weekly volume, completion rate, readiness score) displayed in graphs with units and labels.
- **Navigation Target**: A primary section link (Program, Sessions, Messages/Coach Chat, Reports) optionally annotated with badges for outstanding items.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of clients can identify today's session status from the landing page within 5 seconds of load during usability testing.
- **SC-002**: Calendar and navigation render within 2 seconds on a standard broadband connection for 95% of page loads measured over a week.
- **SC-003**: At least two core performance metrics display for the most recent four-week window with labels and legends visible in 100% of tested accounts.
- **SC-004**: 80% of clients can reach each core section (Program, Sessions, Messages, Reports) in a single click from the landing page without losing authentication or context.

### Assumptions

- Core sections for navigation are Program, Sessions, Messages/Coach Chat, and Reports.
- Default graph metrics prioritize sessions completed versus sessions scheduled (completion rate) and one additional recent performance view (e.g., weekly training volume); additional metrics can be added later if needed.
- "Week" is Monday-Sunday unless localization requirements override it.
