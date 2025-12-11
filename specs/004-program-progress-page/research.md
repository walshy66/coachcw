# Research: Program progress page

## Decisions

- **Program data shape**: Represent program with phases (macro) and micro cycles including name, focus, start/end dates, completed vs total weeks, and session counts; include current/next session pointer to drive CTAs.
  - **Rationale**: Aligns with spec stories (status at a glance, current cycle details) and existing service patterns for week/schedule data.
  - **Alternatives considered**: Minimal single-level list (would not distinguish macro vs micro cycles); backend-driven only (blocked on API availability).

- **Progress visuals**: Use Recharts bar/line components already in the app for adherence and volume trends with empty states when data is insufficient.
  - **Rationale**: Matches existing graph stack, reduces new deps, keeps UI consistent.
  - **Alternatives considered**: Custom SVG or another chart lib; rejected due to added maintenance and inconsistency.

- **Data source strategy**: Start with mock data in services (mirroring schedule/metrics patterns) with fetch wrappers that can call `/clients/{id}/program` when API is ready.
  - **Rationale**: Supports immediate UI/test coverage and future API swap with minimal surface change.
  - **Alternatives considered**: Hard-coded component data (harder to replace later); blocking on backend (slows delivery).

- **Navigation integration**: Reuse `NavLinks` as the single source of nav; expose Program page via existing navigation with optional badges; keep App shell consistent.
  - **Rationale**: Satisfies constitution requirement for single authoritative nav; avoids forked menus.
  - **Alternatives considered**: Page-local nav buttons; rejected to avoid duplicate nav source.

- **Testing approach**: Integration tests via Vitest + RTL for Program page rendering (macro/micro data, graphs, CTAs) and unit tests for any new data mappers.
  - **Rationale**: Aligns with existing testing stack; covers acceptance scenarios.
  - **Alternatives considered**: Snapshot-only tests; rejected as too brittle/uninformative.
