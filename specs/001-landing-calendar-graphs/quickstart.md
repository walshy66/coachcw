# Quickstart: Client Landing Page with Weekly Calendar and Results

**Branch**: 001-landing-calendar-graphs  
**Spec**: specs/001-landing-calendar-graphs/spec.md  
**Plan**: specs/001-landing-calendar-graphs/plan.md  
**Research**: specs/001-landing-calendar-graphs/research.md

## Goals
- Render a Monday-start weekly calendar with session status, quick week navigation, and session detail reveal.
- Show completion-rate graph (sessions completed vs. scheduled) plus one additional performance view.
- Provide one-click nav to Program, Sessions, Messages, Reports with badges when attention needed.

## Steps
1) **Install & bootstrap**  
   - Initialize frontend stack (TypeScript + React + Vite) and add dependencies: date-fns/dayjs, Recharts (or chosen chart lib), testing (Vitest + React Testing Library).  
   - Establish base folders: `src/pages/landing`, `src/components/{calendar,graphs,navigation}`, `src/services`.

2) **Data contracts**  
   - Implement read-only fetchers for schedule and metrics using `contracts/schedule.yaml` and `contracts/metrics.yaml`.  
   - Normalize times to client timezone; derive `today`, `weekStart`, `weekEnd` in the client.  
   - Handle error + empty responses with clear copy.

3) **Landing layout**  
   - Compose page with three regions: calendar (default to current week), results area (completion rate + secondary metric), nav links.  
   - Ensure responsive stacking for narrow screens; keep labels/legends visible.  
   - Lazy-load charts after calendar/nav paint to meet 2s target.

4) **Interactions**  
   - Week navigation: previous/next and “Back to this week.”  
   - Session selection: show key details (type, duration, notes, modality/location).  
   - Nav links: Program, Sessions, Messages, Reports; badges for attention states.

5) **States**  
   - Loading: skeletons for calendar and graphs.  
   - Empty: no-week sessions -> prompt to add/request; no metrics -> descriptive empty state.  
   - Error: inline message + retry affordance; do not redirect.

6) **Testing**  
   - Unit/component tests for calendar rendering, week navigation, session detail reveal, empty/error states, and nav link targets.  
   - Integration test for landing page load: calendar + nav visible <2s threshold, charts load with labels, authentication preserved.

7) **Accessibility & localization**  
   - Use semantic `main`/`nav`, focus order on nav links, aria labels for chart summaries, local date/time formatting with Monday start.

## Running locally (current implementation)
- `cp .env.example .env` and leave `VITE_USE_MOCKS=true` to demo without a backend.
- `npm run dev` to view the landing page; mocks drive calendar, graphs, and badges.
- `npm test -- run` to run Vitest suite (unit + integration).
- `npm run build && npm run preview` to check production build locally.
