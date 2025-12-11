# Feature Specification: Program progress page

**Feature Branch**: 004-program-progress-page  
**Created**: 2025-12-11  
**Status**: Draft  
**Input**: User description: "I need to build a program page that will display macro and micro cycles and graphs on the progress of the program"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See program status at a glance (Priority: P1)

As a client, I want to open the Program page and immediately see where I am in the overall plan (macro phase), my current micro cycle, and high-level progress, so I know if I am on track.

**Why this priority**: This is the core value of the Program page - clarity on progress and where the athlete is right now.

**Independent Test**: Load the Program page with a program assigned; verify it renders macro phase timeline, highlights the current phase/cycle, and shows overall progress without navigating elsewhere.

**Acceptance Scenarios**:

1. **Given** a program with defined macro phases and micro cycles, **When** the user opens the Program page, **Then** the page shows the program name, goal/target, start/end dates, and an overall progress indicator.
2. **Given** a current macro phase and micro cycle, **When** the page loads, **Then** those items are visually highlighted with their date ranges and completion-to-date.

---

### User Story 2 - Inspect current micro cycle details (Priority: P2)

As a client, I want to review the current micro cycle (focus, planned vs completed sessions, readiness/health indicator) so I can adjust effort and plan my week.

**Why this priority**: Enables day-to-day decision making and adherence within the current block.

**Independent Test**: With a current micro cycle present, verify the card/table shows focus, dates, planned vs completed sessions, readiness score, and guidance text.

**Acceptance Scenarios**:

1. **Given** a current micro cycle with session counts, **When** I view its card, **Then** I see planned vs completed counts, focus, and a readiness indicator/label.
2. **Given** micro cycle data loads successfully, **When** I view it, **Then** I also see a CTA to jump to sessions for that cycle.

---

### User Story 3 - Navigate to sessions and other cycles (Priority: P3)

As a client, I want quick links from the Program page to session details and to upcoming/previous micro cycles so I can plan ahead or review what I finished.

**Why this priority**: Keeps navigation tight and reduces friction to act on the plan.

**Independent Test**: From the Program page, verify there are CTA links to the sessions list/next session and controls to move between micro cycles.

**Acceptance Scenarios**:

1. **Given** a current or next session exists, **When** I click the provided CTA, **Then** I am taken to the sessions view pre-filtered or focused on that session.
2. **Given** there are upcoming and previous micro cycles, **When** I select them, **Then** the page updates details and keeps overall progress context visible.

---

### Edge Cases

- No program assigned yet: page shows an empty state explaining that the coach needs to assign a program and hides progress graphs.
- Program exists but phases/cycles incomplete: show the known data, label missing fields as "Not provided", and keep graphs in a graceful empty state.
- Data loading or API failure: show non-blocking inline error banners and allow retry without losing navigation.
- No recent sessions to compute progress: graphs show an empty message; progress chips reflect "0%" rather than blank values.
- Timezone differences between server and client: displayed dates/times use the client timezone consistently on the page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Program page MUST display program name, goal/target event, overall date range, and an overall progress/adherence indicator derived from provided data.
- **FR-002**: Program page MUST show macro (phase) timeline with each phase name, focus, date range, total weeks, completed weeks, and a clear highlight of the current phase when applicable.
- **FR-003**: Program page MUST list micro cycles with name, focus, date range, planned vs completed sessions, and a status (current/upcoming/done) with a readiness or momentum indicator.
- **FR-004**: Program page MUST present progress visuals (e.g., adherence over time and volume/completion trend) with empty states when insufficient data exists.
- **FR-005**: Program page MUST provide navigation CTAs to view the sessions list (and the next session when available) and to switch between micro cycles without leaving the page.
- **FR-006**: Program page MUST handle loading, missing data, and error states gracefully, keeping existing content visible where possible and offering retry.

### Key Entities *(include if feature involves data)*

- **Program**: Name, goal/target, start/end dates, overall progress/adherence metrics.
- **Macro Phase**: Name, focus, start/end dates, total weeks, completed weeks, current flag.
- **Micro Cycle**: Name, focus, start/end dates, planned vs completed sessions, status (current/upcoming/done), readiness indicator.
- **Progress Metric**: Completion/adherence percentages and trend samples used by progress visuals.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users can identify their current macro phase and micro cycle within 5 seconds of landing on the Program page (usability test).
- **SC-002**: Program page renders overall progress and at least one macro/micro cycle in under 2 seconds on a standard broadband connection when data is available (excluding network latency for API calls beyond control).
- **SC-003**: 90% of test users successfully reach the sessions view via the Program page CTAs without assistance during usability testing.
- **SC-004**: In data sets with at least 4 weeks of history, adherence/volume charts show correct values compared to source data with 0 known calculation discrepancies during QA sampling.
