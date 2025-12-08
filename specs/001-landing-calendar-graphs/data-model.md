# Data Model: Client Landing Page with Weekly Calendar and Results

**Date**: 2025-12-08  
**Branch**: 001-landing-calendar-graphs  
**Spec**: specs/001-landing-calendar-graphs/spec.md

## Entities

### Week View
- **Description**: Seven-day window anchored to Monday in the client’s local time.
- **Fields**:
  - `startDate` (date, required): Monday of the shown week in client local time.
  - `endDate` (date, required): Sunday of the shown week in client local time.
  - `timezone` (string, required): IANA identifier for the client.
  - `today` (date, required): Current local date to highlight.
- **Rules**:
  - Must always include exactly 7 contiguous days starting Monday.
  - All session entries must fall within `startDate`–`endDate` when displayed.

### Session Entry
- **Description**: A scheduled workout/session for the client within a week.
- **Fields**:
  - `id` (string, required): Unique session identifier.
  - `date` (date, required): Local calendar date of the session.
  - `startTime` (time with offset, required): Local start time.
  - `title` (string, required): Short label (e.g., “Intervals”, “Recovery”).
  - `status` (enum, required): planned | completed | missed | changed.
  - `durationMinutes` (integer, optional): Planned or actual duration.
  - `modality` (string, optional): e.g., run, bike, strength, mobility.
  - `location` (string, optional): place or virtual link.
  - `coachNotes` (string, optional): Highlights/instructions surfaced on select.
  - `lastUpdated` (datetime, required): For freshness; used to avoid stale display.
- **Rules**:
  - `status` must be one of the enum values; changed implies rescheduled details are reflected.
  - `startTime` and `date` respect `Week View.timezone`.
  - Selecting a session surfaces `coachNotes` and key details.

### Metric Snapshot
- **Description**: Aggregated performance metrics for recent weeks.
- **Fields**:
  - `rangeLabel` (string, required): Human-readable window (e.g., “Last 4 weeks”).
  - `completionRate` (number 0–1, optional): Sessions completed / scheduled in program for the window.
  - `volume` (number, optional): Total training volume for the window with implied unit (e.g., minutes or distance).
  - `unit` (string, optional): Unit for volume (e.g., minutes, km).
  - `samples` (array, required): Per-week data points with fields:
    - `weekStart` (date, required): Monday of that week.
    - `sessionsScheduled` (integer, required): Count in program.
    - `sessionsCompleted` (integer, required): Count completed.
    - `volume` (number, optional): Volume for that week.
    - `unit` (string, optional): Unit for volume.
  - `hasData` (boolean, required): Whether meaningful historical data exists.
- **Rules**:
  - If `hasData` is false or `samples` empty, show empty-state messaging.
  - Completion rate is derived from `sessionsCompleted`/`sessionsScheduled`; avoid implying zero when data missing.

### Navigation Target
- **Description**: Link destinations for core sections.
- **Fields**:
  - `id` (string, required): program | sessions | messages | reports.
  - `label` (string, required): Display text.
  - `url` (string, required): Destination route.
  - `badge` (string, optional): Attention indicator (e.g., missed session, unread).
- **Rules**:
  - One-click access; must not require re-auth.
  - Badges are present only when an attention condition exists.

## Relationships
- Week View has many Session Entries constrained to its date range.
- Metric Snapshot `samples` align to week starts; completion rate derives from aggregated sample counts.
- Navigation Targets are independent of Week View but may reflect week status via badges.

## Validation & Derived Behavior
- Reject or flag sessions outside the current Week View when rendering that view.
- Mark today within the Week View using `today` against `startDate`/`endDate`.
- Empty/missing Metric Snapshots trigger a descriptive empty state rather than zeros.
- Time zone shifts use the client’s `timezone`; all times shown in local time.
