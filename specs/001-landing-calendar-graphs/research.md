# Research: Client Landing Page with Weekly Calendar and Results

**Date**: 2025-12-08  
**Branch**: 001-landing-calendar-graphs  
**Spec**: specs/001-landing-calendar-graphs/spec.md

## Decisions

### Frontend stack baseline
- **Decision**: Use TypeScript with React and a lightweight build tool (e.g., Vite) for the landing page.
- **Rationale**: Fast iteration for a single-page experience, strong type safety, and common ecosystem support for charts and date handling.
- **Alternatives considered**: Keep stack unspecified (adds risk of rework); Next.js (heavier than needed for a single landing view); plain JS (reduces safety and maintainability).

### Charting library
- **Decision**: Use Recharts (or similar declarative React charting lib) for the results graphs.
- **Rationale**: Declarative API, good defaults for legends/labels, easy handling of empty-state data without custom canvas work.
- **Alternatives considered**: Chart.js (imperative; more setup for responsive/reactive usage); d3 (powerful but slower to implement for simple bar/line displays).

### Date/time handling
- **Decision**: Use a small date utility (e.g., date-fns or dayjs) to anchor weeks to Monday, handle time zones, and format labels.
- **Rationale**: Minimizes manual date math errors and keeps bundle small while enforcing Monday-start and local-time display.
- **Alternatives considered**: Native Date only (more error-prone for week boundaries/time zones); Luxon (heavier but could be reconsidered if we need robust timezone conversions).

### Data access and contracts
- **Decision**: Assume existing backend endpoints provide (a) session schedule with status, and (b) session completion stats; fetch read-only for this feature.
- **Rationale**: Landing page is read-focused; avoids adding write flows; aligns with spec that it should load current plan data and results.
- **Alternatives considered**: Mock data only (insufficient for acceptance); adding new write endpoints (out of scope for this landing view).

### Loading, empty, and error states
- **Decision**: Show skeleton/loading for calendar and graphs; empty-state messaging when no sessions in week or insufficient history; concise inline error message on fetch failure with a retry affordance.
- **Rationale**: Matches spec requirements for empty/missing data and keeps user oriented without redirecting.
- **Alternatives considered**: Blocking spinner (hurts perceived performance); silent failures (violates clarity and testability).

### Testing approach
- **Decision**: Use component/unit tests (e.g., Vitest + React Testing Library) plus a minimal integration flow test for landing page load states and nav links.
- **Rationale**: Covers rendering logic and interactions (week navigation, link targets, empty/missing data) without heavy E2E overhead.
- **Alternatives considered**: Full E2E only (slower feedback, less granularity); unit-only (misses page-level wiring).

### Performance and responsiveness
- **Decision**: Lazy-load charts after calendar/nav render; ensure responsive layouts for narrow screens with stacked blocks and preserved labels.
- **Rationale**: Meets 2s render target for calendar/nav and keeps graphs readable on small viewports.
- **Alternatives considered**: Render everything immediately (risk slower first paint); defer graphs to separate page (conflicts with spec desire for at-a-glance results).

### Accessibility and localization
- **Decision**: Provide semantic landmarks (main/nav), keyboard focus order for nav links, aria labels on chart summaries, and local date/time formatting with Monday-start weeks.
- **Rationale**: Ensures the landing page is usable and interpretable; aligns with clarity goals in spec.
- **Alternatives considered**: Rely on defaults (risks inaccessible nav and charts; unclear date formats).
