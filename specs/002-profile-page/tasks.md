# Tasks: Profile Page

## Phase 1: Setup
- [ ] T001 Install dependencies in app (app/package.json)
- [ ] T002 Verify dev server runs for profile work (app)

## Phase 2: Foundational
- [ ] T003 Add profile data types for profile/subscription (app/src/services/types.ts)
- [ ] T004 Add profile data fetchers (mock or wire) (app/src/services)
- [ ] T005 Add utility for DOB→age formatting and safe fallback (app/src/services/date.ts)

## Phase 3: User Story 1 (View profile summary)
- [ ] T006 [US1] Create ProfilePage layout and styling (app/src/pages/profile/ProfilePage.tsx, ProfilePage.css)
- [ ] T007 [US1] Render header with avatar/initials and core identity fields (app/src/pages/profile/ProfilePage.tsx)
- [ ] T008 [US1] Display age only; hide full DOB; handle missing DOB gracefully (app/src/pages/profile/ProfilePage.tsx)
- [ ] T009 [US1] Implement DOB edit flow with labeled date picker and age recompute (app/src/pages/profile/ProfilePage.tsx)
- [ ] T010 [US1] Add loading/error states for profile fetch with friendly copy (app/src/pages/profile/ProfilePage.tsx)
- [ ] T011 [US1] Add tests for profile rendering, initials fallback, DOB edit age recompute (app/tests/profile.test.tsx)

## Phase 4: User Story 2 (Review subscription details)
- [ ] T012 [US2] Render subscription card with plan/status/member-since/renewal/sessions/add-ons/auto-renew (app/src/pages/profile/ProfilePage.tsx)
- [ ] T013 [US2] Handle missing subscription data with clear “subscription info unavailable” copy (app/src/pages/profile/ProfilePage.tsx)
- [ ] T014 [US2] Add tests for subscription display across statuses (active/on hold/canceled/missing) (app/tests/profile.test.tsx)

## Phase 5: User Story 3 (Payment placeholder)
- [ ] T015 [US3] Add non-interactive payment placeholder note in subscription area (app/src/pages/profile/ProfilePage.tsx)
- [ ] T016 [US3] Ensure placeholder is announced for screen readers (aria-live/label) (app/src/pages/profile/ProfilePage.tsx)
- [ ] T017 [US3] Add tests for placeholder visibility/accessibility (app/tests/profile.test.tsx)

## Phase 6: Polish & Cross-Cutting
- [ ] T018 Wire ProfilePage into App routing/entry (app/src/App.tsx or router)
- [ ] T019 Responsive adjustments and contrast checks (app/src/pages/profile/ProfilePage.css)
- [ ] T020 Lint and format profile additions (app)
- [ ] T021 Verify performance target (~2s load with mocked data) and fix regressions (app)

## Dependencies (story order)
- US1 → US2 (subscription section depends on shared layout/styles)
- US1 → US3 (placeholder sits in subscription/payment area)

## Parallel Execution Examples
- While T003–T005 run, start T006 layout scaffold.
- After T006, run T007–T010 in parallel with T011 tests.
- After US1 code lands, run T012–T014; in parallel add T015–T017 placeholder tests.

## Implementation Strategy
- Deliver MVP with US1 (identity + age-only + DOB edit). Then add US2 subscription details, then US3 placeholder. Finish with polish and perf check.
