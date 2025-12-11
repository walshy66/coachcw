# Implementation Plan: Program progress page

**Branch**: 004-program-progress-page | **Date**: 2025-12-11 | **Spec**: specs/004-program-progress-page/spec.md
**Input**: Feature specification from /specs/004-program-progress-page/spec.md

## Summary

Build a Program page that shows macro phases and micro cycles with progress visualizations, highlights the current phase/cycle, and provides fast navigation to sessions. The plan uses the existing TypeScript + React 19 + Vite 7 frontend with mock-friendly services and Recharts for graphs, adding program-specific data models, UI, and tests while keeping navigation consistent with the shared NavLinks/App shell patterns.

## Technical Context

**Language/Version**: TypeScript, React 19 on Vite 7
**Primary Dependencies**: Recharts (graphs), date-fns (date formatting), testing-library + Vitest
**Storage**: Client-side mock data for now; fetch wrappers ready for API when available
**Testing**: Vitest + @testing-library/react
**Target Platform**: Web (desktop-first, responsive to mobile)
**Project Type**: Single-page web frontend (app/)
**Performance Goals**: Page content visible within 2s when data available (per spec SC-002)
**Constraints**: Use shared navigation/App shell; avoid duplicate nav sources; keep architecture minimal (no new backends)
**Scale/Scope**: Single page plus supporting components/services within existing frontend

## Constitution Check

Gates before Phase 0:
- User outcomes first: Spec includes P1/P2/P3 stories and measurable success criteria (pass)
- Test-first reliability: Plan will add Vitest + RTL coverage for Program page flows (pass)
- Incremental slices: Page can ship with mock data and evolve to API (pass)
- Text-first/traceability: Use existing fetch wrappers and structured mocks; no new opaque tooling (pass)
- UI shell/nav source of truth: Must reuse shared NavLinks/App shell; no custom nav forks (pass)

## Project Structure

### Documentation (this feature)

- specs/004-program-progress-page/plan.md (this file)
- specs/004-program-progress-page/research.md
- specs/004-program-progress-page/data-model.md
- specs/004-program-progress-page/quickstart.md
- specs/004-program-progress-page/contracts/

### Source Code (repository root)

- app/src/components/ (shared components: calendar, graphs, navigation, etc.)
- app/src/pages/ (page views; add program page here)
- app/src/services/ (data fetchers/mocks/types)
- app/src/App.tsx (entry; currently toggles landing/profile)
- app/tests/integration/ (page-level tests)
- app/tests/unit/ (component tests)

**Structure Decision**: Extend existing single frontend app by adding a Program page under `app/src/pages/program`, reusing shared navigation (`components/navigation/NavLinks`) and service patterns in `app/src/services`. No backend changes planned.

## Complexity Tracking

No constitution violations anticipated; keep navigation in shared source and reuse existing libraries.
