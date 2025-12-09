# Tasks: Session Page Logging

**Input**: Design documents from `/specs/003-session-page/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Review scope and acceptance criteria in specs/003-session-page/plan.md and spec.md
- [ ] T002 Ensure app dependencies are installed and toolchain works (`npm ci`, `npm test`) in app/

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 Create session domain types for Session and ExerciseEntry in app/src/features/session/types.ts
- [ ] T004 Implement validation helpers for sessions and exercise rows (date required, exercise metrics rules) in app/src/features/session/validation.ts
- [ ] T005 Scaffold session API client with create/update/get methods aligned to contracts/session.yaml in app/src/services/sessionService.ts
- [ ] T006 [P] Add contract test skeleton for session API responses and required fields in app/tests/contract/session.contract.test.ts
- [ ] T007 [P] Add utility for generating temp IDs and ordering helpers in app/src/features/session/idUtils.ts

---

## Phase 3: User Story 1 - Record session exercises (Priority: P1) — MVP

**Goal**: User can add/edit/remove/reorder exercises with metrics and save them.  
**Independent Test**: Create a session with multiple exercises, save, reload, and verify exercises persist exactly as entered.

### Tests

- [ ] T008 [P] [US1] Add integration test for creating session with multiple exercises and verifying persistence in app/tests/integration/session.exercises.test.ts
- [ ] T009 [P] [US1] Add unit tests for exercise validation and hook behaviors in app/tests/unit/useSessionEditor.test.ts

### Implementation

- [ ] T010 [US1] Implement `useSessionEditor` hook to manage exercise list (add/edit/remove/reorder/duplicate) and dirty state in app/src/features/session/useSessionEditor.ts
- [ ] T011 [P] [US1] Build ExerciseList/ExerciseRow components with inputs for name, sets/reps/load or duration, rest, and row-level validation in app/src/features/session/ExerciseList.tsx
- [ ] T012 [US1] Wire save flow to call sessionService with exercise payload and reconcile returned IDs in app/src/pages/SessionPage.tsx
- [ ] T013 [P] [US1] Render inline validation messages for incomplete exercise entries in app/src/features/session/ExerciseList.tsx

**Checkpoint**: Session creation with exercises works end-to-end and is independently testable.

---

## Phase 4: User Story 2 - Capture session details (Priority: P2)

**Goal**: User can enter and save session-level details (date/time/context).  
**Independent Test**: Save a session with only session details, reload, and verify details display in summary.

### Tests

- [ ] T014 [P] [US2] Add integration test for saving session date/time/context and verifying summary render in app/tests/integration/session.details.test.ts

### Implementation

- [ ] T015 [US2] Add session details form section (date required, start/end or duration, location, intensity, participants) in app/src/pages/SessionPage.tsx
- [ ] T016 [P] [US2] Extend validation to enforce date required and start/end ordering in app/src/features/session/validation.ts
- [ ] T017 [US2] Render session summary section showing saved details in app/src/pages/SessionPage.tsx

**Checkpoint**: Session details save and display independently of exercises.

---

## Phase 5: User Story 3 - Add notes and reflections (Priority: P3)

**Goal**: User can add/edit free-form notes saved with the session.  
**Independent Test**: Add/update notes on an existing session, save, and reload to see unchanged notes.

### Tests

- [ ] T018 [P] [US3] Add integration test for saving and reloading session notes in app/tests/integration/session.notes.test.ts

### Implementation

- [ ] T019 [US3] Add notes textarea bound to session state on SessionPage and include in payloads in app/src/pages/SessionPage.tsx
- [ ] T020 [P] [US3] Ensure sessionService maps notes through create/update/get responses in app/src/services/sessionService.ts

**Checkpoint**: Notes persist with sessions and display correctly.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T021 [P] Implement unsaved-changes prompt hook and integrate with routing/navigation in app/src/features/session/useUnsavedChangesPrompt.ts
- [ ] T022 [P] Polish exercise UX (duplicate button, focus/keyboard handling, reorder controls) in app/src/features/session/ExerciseList.tsx
- [ ] T023 Improve loading/error/empty states for the session page and save actions in app/src/pages/SessionPage.tsx
- [ ] T024 [P] Align API contract and client by adding response/fixture mocks for tests in app/tests/contract/session.contract.test.ts
- [ ] T025 Update quickstart with any deviations and ensure instructions cover new commands in specs/003-session-page/quickstart.md

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → User Stories (3, 4, 5) → Phase 6.
- User story order by priority: US1 (P1) → US2 (P2) → US3 (P3); they can proceed in parallel after foundational work if staffing allows, but US1 forms the MVP.

## Parallel Execution Examples

- After Phase 2: T008, T009, T011, T013 can run in parallel (different files) while T010/T012 proceed sequentially for US1.
- US2 and US3 tests (T014, T018) can run in parallel with their implementation tasks once US1 data structures are stable.
- Polish tasks T021, T022, T024 can run in parallel once core flows are in place.

## Implementation Strategy

- MVP = Complete Phases 1–2 and US1; validate creation/edit/save of exercises with persistence.
- Incrementally layer US2 (session details) and US3 (notes) with independent tests before polish.
