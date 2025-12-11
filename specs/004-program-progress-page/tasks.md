# Tasks: Program progress page

## Dependencies between user stories
- US1 -> US2 (current cycle details rely on program/phase context)
- US1 -> US3 (navigation CTAs depend on surfaced program/cycle data)

## MVP scope
- Deliver US1 (status at a glance with program/phases/micro cycle highlight and progress graphs) with mocks.

## Phase 1: Setup
- [ ] T001 Confirm repo setup and install deps in app/ (`npm install`) ensuring VITE_USE_MOCKS is enabled for local program data.

## Phase 2: Foundational
- [ ] T002 Add program data types and mock data in app/src/services (program.ts, mockData additions) to represent program, phases, micro cycles, progress samples, next session.
- [ ] T003 Add program fetcher with mock fallback in app/src/services/program.ts and export fetchProgramOverview from app/src/services/index.ts.
- [ ] T004 Wire navigation to include Program target (reuse NavLinks) and extend App.tsx to route/render Program page.

## Phase 3: User Story 1 - See program status at a glance (P1)
- [ ] T005 [US1] Create ProgramPage component skeleton under app/src/pages/program with header showing program name, goal, dates, overall progress/adherence chips.
- [ ] T006 [US1] Render macro phase timeline/highlight current phase using mock data in ProgramPage (including date ranges and completed vs total weeks).
- [ ] T007 [US1] Render micro cycle strip/list with current cycle highlighted and summary counts for planned vs completed.
- [ ] T008 [US1] Show progress visuals (adherence and volume/completion trend) using Recharts with empty/loading/error states.
- [ ] T009 [US1] Add loading and error handling states in ProgramPage for program fetch (skeletons, inline errors, retry).
- [ ] T010 [US1] Add integration test for ProgramPage rendering macro/micro and graphs with mock data in app/tests/integration.

## Phase 4: User Story 2 - Inspect current micro cycle details (P2)
- [ ] T011 [US2] Add current micro cycle detail card with focus, dates, planned vs completed, readiness indicator in ProgramPage.
- [ ] T012 [US2] Support selecting different micro cycles (tabs/list) updating detail view without losing overall context.
- [ ] T013 [US2] Add CTA/link from micro cycle detail to sessions view (placeholder URL consistent with NavLinks).
- [ ] T014 [US2] Add integration test for micro cycle detail interactions and CTA presence in app/tests/integration.

## Phase 5: User Story 3 - Navigate to sessions and other cycles (P3)
- [ ] T015 [US3] Add next-session CTA on ProgramPage pointing to sessions page/anchor using program.nextSession when available.
- [ ] T016 [US3] Provide navigation controls to move to previous/next micro cycles (or toggle list) and keep progress context visible.
- [ ] T017 [US3] Add integration test for navigation CTAs (next session and micro cycle switching) in app/tests/integration.

## Final Phase: Polish & Cross-Cutting
- [ ] T018 Review accessibility (aria labels for CTAs, charts empty states) on ProgramPage.
- [ ] T019 Validate responsiveness for ProgramPage layout (desktop/mobile) and adjust CSS if needed.
- [ ] T020 Update README/quickstart in specs/004-program-progress-page/quickstart.md if implementation details shift.
- [ ] T021 Add render-time check for ProgramPage with mocks and document results in specs/004-program-progress-page/quickstart.md.
