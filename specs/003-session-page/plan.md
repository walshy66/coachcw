# Implementation Plan: Session Page Logging

**Branch**: `003-session-page` | **Date**: 2025-12-09 | **Spec**: specs/003-session-page/spec.md  
**Input**: Feature specification from `/specs/003-session-page/spec.md`

## Summary

Build a session page that lets authenticated users log training sessions: capture session details (date/time, context), add/edit/remove exercises with metrics, and attach notes. Deliver a React (Vite) page within the existing AppShell, with client-side validation, persistence via session APIs, and a readable summary view backed by clear data models and contracts.

## Technical Context

**Language/Version**: TypeScript, React 19  
**Primary Dependencies**: React, React DOM, Vite, date-fns (formatting), testing-library/Vitest; reuse existing AppShell/layout components  
**Storage**: API-backed session persistence (RESTful contract defined here); no client-side offline store in scope  
**Testing**: Vitest + @testing-library/react for unit/interaction; contract tests can stub API responses  
**Target Platform**: Web (desktop-first, responsive to mobile web)  
**Project Type**: Web frontend (app/), Vite-based SPA  
**Performance Goals**: Form interactions feel instantaneous; save/reload round-trips under ~1s in test env; renders avoid jank with large exercise lists  
**Constraints**: Must render within shared AppShell; single source of truth for navigation; no new global layout variants; follow incremental slices and test-first principles  
**Scale/Scope**: Single new page + supporting components/state; supports sessions with many exercise rows and long notes without truncation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- AppShell & single navigation source honored: page mounts inside existing layout; no duplicate nav. **PASS**
- User outcomes defined via spec P1/P2/P3 with measurable criteria. **PASS**
- Incremental slices: deliver page + validation + persistence in releasable steps. **PASS**
- Test-first reliability: plan includes tests for acceptance paths and validation blockers. **PASS**
- Scope stays within training session logging/tracking per constitution. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/003-session-page/
├─ plan.md              # This file
├─ research.md          # Phase 0 output
├─ data-model.md        # Phase 1 output
├─ quickstart.md        # Phase 1 output
├─ contracts/           # Phase 1 output
└─ tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
app/
├─ src/
│  ├─ components/        # shared UI primitives/layout (reuse AppShell, form controls)
│  ├─ pages/             # routed pages (add SessionPage view)
│  ├─ features/          # feature modules (session logging state/hooks)
│  └─ services/          # API client utilities (session API client)
└─ tests/
   ├─ unit/              # component/unit tests
   └─ integration/       # page-level flows and contract verifications
```

**Structure Decision**: Web frontend under `app/` using existing React/Vite layout; add session page routed view, feature-specific components/state under `app/src/features`, and API client under `app/src/services`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|

## Post-Design Constitution Check

- AppShell + single navigation: unchanged; page will use existing layout. **PASS**
- Incremental slices: UI + validation + persistence planned as separate commits/tests. **PASS**
- Test-first reliability: unit/integration coverage planned for acceptance paths and validation. **PASS**
