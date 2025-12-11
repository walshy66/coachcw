# Feature Specification: Session Page Logging

**Feature Branch**: `003-session-page`  
**Created**: 2025-12-09  
**Status**: Draft  
**Input**: User description: "build a session page, to record exercises completed in the session and session details with a notes section"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Record session exercises (Priority: P1)

As a signed-in athlete or coach, I can log a training session and add each exercise performed with sets, reps, load, or duration so the session is captured accurately.

**Why this priority**: Capturing exercises is the core value of the session page and enables progress tracking.

**Independent Test**: Start a new session, add multiple exercises with details, save, and reopen to verify all entries persist exactly as entered.

**Acceptance Scenarios**:

1. **Given** I am on the session page, **When** I create a new session and add one or more exercises with required details, **Then** the session saves with every exercise entry retained.
2. **Given** I edit or remove an exercise entry before saving, **When** I save the session, **Then** only the updated set of exercises appears in the saved record.

---

### User Story 2 - Capture session details (Priority: P2)

As a signed-in user, I can enter session-level information (date, start/end or duration, location, intensity, participants) to contextualize the exercises.

**Why this priority**: Session context is needed for meaningful tracking and reporting.

**Independent Test**: Create a session with session-level details only, save, and confirm the summary displays those details without requiring exercises to be re-entered.

**Acceptance Scenarios**:

1. **Given** the session page is open, **When** I enter session date/time and contextual fields and save, **Then** the saved session shows those details in the summary.

---

### User Story 3 - Add notes and reflections (Priority: P3)

As a signed-in user, I can add free-form notes (observations, modifications, follow-ups) to a session so future reviews include qualitative context.

**Why this priority**: Notes capture context that metrics cannot, improving coaching feedback and self-review.

**Independent Test**: Add or edit a note on an existing session and confirm it saves and reopens exactly as entered.

**Acceptance Scenarios**:

1. **Given** an existing session record, **When** I add or update notes and save, **Then** the notes appear unchanged when I return to the session page.

---

### Edge Cases

- User tries to save a session without a required field (e.g., date) or without at least one exercise; inline validation blocks save and explains what to fix.
- An exercise entry is incomplete (missing reps/load/duration for the chosen type); user is prompted to fill required metrics before save.
- User navigates away with unsaved changes; a confirmation prompt prevents accidental loss.
- Very long notes or many exercise entries; page still saves and displays all content without truncation.
- Duplicate exercise names within a session; entries remain distinct and editable individually.
- Validation for exercises is surfaced via a save-time modal (not inline per-row), to keep rows clean while still blocking incomplete saves.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a signed-in user to start a new session record with date and time context.
- **FR-002**: System MUST allow adding, editing, reordering, and removing multiple exercise entries within a session, including exercise name, pace, and applicable metrics (sets/reps/load and/or duration).
- **FR-003**: System MUST enforce required fields (athlete and at least one complete exercise) before final save, using a save-time modal prompt instead of inline exercise error banners.
- **FR-004**: System MUST persist session details, all exercise entries, and notes together so they can be reopened for review or editing.
- **FR-005**: System MUST provide a notes field supporting multi-line text saved with the session.
- **FR-006**: System MUST display a saved session summary showing session details, exercise list with metrics, and notes in a readable layout.
- **FR-007**: System SHOULD warn users before discarding unsaved changes when navigating away or closing the session page.
- **FR-008**: System SHOULD support quick duplication of an exercise entry within the session to reduce repeated typing for similar sets.

### Key Entities *(include if feature involves data)*

- **Session**: Represents a single training instance with attributes such as date, start/end or duration, location/venue, intensity rating, participant/coach identifiers, notes, and the collection of exercises.
- **Exercise Entry**: Represents an exercise performed in a session with attributes including exercise name, pace, metrics (sets/reps/load and/or duration), optional rest intervals, ordering within the session, and link to its parent Session.

### Assumptions & Dependencies

- Users are already authenticated and have permission to create and edit their own sessions.
- Exercises can be logged with either load-based metrics (sets/reps/load) or time-based metrics (duration); at least one metric set must be complete per exercise.
- Notes are stored as plain text without formatting or media attachments.
- Validation and persistence behavior match existing app patterns for error display and saving.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 90% of users can create and save a session with at least three exercises in under 3 minutes on first attempt.
- **SC-002**: 95% of saved sessions reopen with all exercises, details, and notes matching the last saved state with zero data loss in testing.
- **SC-003**: Inline validation prevents incomplete saves, with error resolution achieved within one additional attempt for 90% of users.
- **SC-004**: At least 80% of users who log sessions add notes or context when prompted, indicating the notes experience is discoverable and usable.

## UI / Interaction Decisions

- Exercise rows are single-line: exercise name, pace chip, inline set chips (Set N above rep/load), with actions (+ Exercise, Add set, Duplicate, Remove) aligned on the right. Chips wrap naturally and do not scroll horizontally.
- Pace is captured per exercise beside the name; double-click to edit in place with a chip-style input.
- Add-set control lives with the row actions and increments labels automatically (Set 1, Set 2, ...).
- Validation messaging for exercises is deferred to a save-time modal; inline exercise error banners are hidden for a cleaner row layout.
