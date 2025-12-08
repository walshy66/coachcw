# Tasks: Client Landing Page with Weekly Calendar and Results

## Dependencies
- Story completion order: US1 (calendar) → US2 (results graphs) → US3 (navigation). US2 and US3 can proceed in parallel once calendar data/loading is in place.

## Phases & Tasks

### Phase 1: Setup
- [ ] T001 Initialize frontend project (TypeScript + React + Vite) and base folders `src/pages/landing`, `src/components/{calendar,graphs,navigation}`, `src/services`, `tests/unit`, `tests/integration`
- [ ] T002 Add dependencies: date-fns/dayjs, Recharts (or chosen chart lib), React Testing Library + Vitest, and fetch polyfill if needed; commit lockfile
- [ ] T003 Configure lint/format/test scripts (package.json) and base tsconfig for path aliases to `src`

### Phase 2: Foundational
- [ ] T004 Create shared types for Week View, Session Entry, Metric Snapshot in `src/services/types.ts`
- [ ] T005 Implement schedule fetcher matching `contracts/schedule.yaml` in `src/services/schedule.ts`
- [ ] T006 Implement metrics fetcher matching `contracts/metrics.yaml` in `src/services/metrics.ts`
- [ ] T007 Add utility for week math (Monday start) and timezone-safe formatting in `src/services/date.ts`
- [ ] T008 [P] Add global layout shell and route for landing page in `src/pages/landing/index.tsx`

### Phase 3: User Story 1 (P1) - See my week at a glance
- [ ] T009 [US1] Build calendar display component with week navigation (prev/next/“back to this week”) in `src/components/calendar/WeekCalendar.tsx`
- [ ] T010 [US1] Render session cards with status, time, title, and “changed/missed/completed/planned” states; highlight today in `WeekCalendar.tsx`
- [ ] T011 [US1] Add session detail reveal (type, duration, notes, modality/location) on select in `WeekCalendar.tsx`
- [ ] T012 [US1] Handle loading, empty week, and error states with clear messaging in `WeekCalendar.tsx`
- [ ] T013 [US1] Integration test: landing page loads calendar, shows current week, supports week navigation and detail reveal in `tests/integration/landing.calendar.test.tsx`

### Phase 4: User Story 2 (P2) - Track my progress from the landing page
- [ ] T014 [US2] Implement completion-rate chart (sessions completed vs. scheduled) with labels/legend in `src/components/graphs/CompletionChart.tsx`
- [ ] T015 [US2] Implement secondary performance graph (e.g., weekly volume) in `src/components/graphs/VolumeChart.tsx`
- [ ] T016 [US2] Add empty-state and missing-data handling (no data vs. zero) for graphs in `src/components/graphs/*`
- [ ] T017 [US2] Lazy-load graphs after calendar/nav render to meet 2s target in `src/pages/landing/index.tsx`
- [ ] T018 [US2] Unit tests for graph rendering, labels, empty states in `tests/unit/graphs.test.tsx`

### Phase 5: User Story 3 (P3) - Jump to core sections quickly
- [ ] T019 [US3] Build navigation area with links to Program, Sessions, Messages, Reports in `src/components/navigation/NavLinks.tsx`
- [ ] T020 [US3] Add badge indicators for attention states (missed session, unread message) in `NavLinks.tsx`
- [ ] T021 [US3] Ensure nav links preserve auth/session and open targets correctly; add tests in `tests/unit/navigation.test.tsx`

### Phase 6: Polish & Cross-Cutting
- [ ] T022 Add responsive layout for narrow screens; ensure labels/legends remain visible in `src/pages/landing/index.tsx` and components
- [ ] T023 Add accessibility pass: semantic landmarks, focus order on nav links, aria labels for chart summaries in components
- [ ] T024 Document quickstart/run instructions and testing commands in `specs/001-landing-calendar-graphs/quickstart.md` (update if needed)
- [ ] T025 Final integration test: landing page end-to-end load with calendar, graphs, nav, and states in `tests/integration/landing.e2e.test.tsx`

## Parallel Execution Examples
- T008 [P] layout shell can proceed while services (T005–T007) are built.
- T014–T016 graphs can start after services (T005–T007), in parallel with navigation (T019–T020) once calendar data flow is stable.

## MVP Scope
- Complete through Phase 3 (US1) to deliver calendar visibility with navigation and session detail, satisfying primary visit intent.

## Validation
- All tasks follow checklist format with IDs; story labels present for story phases; parallelizable tasks marked [P].
