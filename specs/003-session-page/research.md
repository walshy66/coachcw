# Phase 0 Research: Session Page Logging

## Decisions and Rationale

### Decision: Use RESTful session endpoints for persistence
- **Rationale**: Aligns with existing web app patterns; simple CRUD for sessions with exercises and notes matches REST well.
- **Alternatives considered**: GraphQL (adds complexity without clear benefit for this slice); local-only storage (fails persistence requirement).

### Decision: Client-side validation for required fields and exercise completeness
- **Rationale**: Immediate feedback satisfies spec acceptance and SC-003; avoids round-trips for obvious errors.
- **Alternatives considered**: Server-only validation (slower feedback, poorer UX); schema-driven form libs (heavier than needed for one page).

### Decision: Local page state + scoped hooks for session editing
- **Rationale**: Keeps the feature slice isolated and testable; supports unsaved-change prompts and optimistic UI without global state.
- **Alternatives considered**: Global store (overkill for single page; higher coupling); uncontrolled form with DOM reads (harder to validate dynamic rows).

## Open Questions

None. All critical clarifications resolved with the assumptions above.
