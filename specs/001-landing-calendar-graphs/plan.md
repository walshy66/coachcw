# Implementation Plan: Client Landing Page with Weekly Calendar and Results

**Branch**: `001-landing-calendar-graphs` | **Date**: 2025-12-08 | **Spec**: specs/001-landing-calendar-graphs/spec.md  
**Input**: Feature specification from `/specs/001-landing-calendar-graphs/spec.md`

## Summary

Build a clear client landing page that defaults to the current (Monday-start) week, shows session cards with statuses, enables quick week navigation, and links to Program, Sessions, Messages, and Reports. Include results visuals emphasizing sessions completed versus sessions scheduled (completion rate) plus a secondary recent performance view. Ensure load within ~2 seconds for calendar/nav and preserve authentication across navigation.

## Technical Context

**Language/Version**: TypeScript with React (Vite tooling)  
**Primary Dependencies**: Recharts (charts), date-fns/dayjs (date handling), fetch/HTTP client as needed  
**Storage**: N/A for new data; reads existing schedule/results sources provided by backend  
**Testing**: Vitest + React Testing Library for unit/component; light integration tests for landing flows  
**Target Platform**: Web (responsive desktop and mobile web)  
**Project Type**: Web application (single frontend)  
**Performance Goals**: Calendar + nav visible within 2s for 95% of loads; graphs render with labeled metrics within a further 1s on standard broadband  
**Constraints**: Responsive layout for narrow screens; surface empty states for missing data; preserve session/navigation state post-login without re-auth  
**Scale/Scope**: Single landing page experience with calendar, two+ graphs, and four nav targets

## Constitution Check

- Current constitution file is placeholder with no concrete principles defined; no explicit gates to evaluate.  
- Assumed gates: prioritize user safety, clarity, and testability. No violations identified given the non-medical, informational nature of this landing page.

## Project Structure

### Documentation (this feature)

```text
specs/001-landing-calendar-graphs/
├─ plan.md              # This file (/speckit.plan output)
├─ research.md          # Phase 0 output
├─ data-model.md        # Phase 1 output
├─ quickstart.md        # Phase 1 output
├─ contracts/           # Phase 1 output
└─ tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├─ pages/
│  └─ landing/
├─ components/
│  ├─ calendar/
│  ├─ graphs/
│  └─ navigation/
└─ services/

tests/
├─ integration/
└─ unit/
```

**Structure Decision**: Single frontend project with feature-focused directories under `src/` for the landing page, calendar view, graphs, and navigation, plus service/data adapters. Tests split into unit (components/services) and integration (page flows). Placeholder directories to be created alongside implementation.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| None | n/a | n/a |
