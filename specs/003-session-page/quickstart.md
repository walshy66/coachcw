# Quickstart: Session Page Logging

## Goals
- Add a session page that captures session details, exercises with metrics, and notes.
- Keep UX within the existing AppShell and navigation.
- Provide validation and persistence via the session API contract.

## Steps
1) **Routing & layout**
   - Add a `SessionPage` route under `app/src/pages/`.
   - Render within the shared AppShell/navigation.
2) **State & models**
   - Create a `useSessionEditor` hook under `app/src/features/session/` to manage session state (details, exercise list, notes, dirty flag).
   - Generate temp IDs for exercises; maintain `order`.
3) **Form UI**
   - Session details section: date (required), start/end or duration, location, intensity, participants.
   - Exercises section: name (required), sets/reps/load or duration, rest, notes; support add, edit, remove, duplicate, reorder.
   - Notes textarea (multiline).
4) **Validation**
   - Block save unless date present and at least one exercise with required metrics.
   - Inline errors per field; page-level summary for missing required groups.
   - Warn on navigation with unsaved changes.
5) **API integration**
   - Add `sessionService` in `app/src/services/` implementing POST/PUT/GET per `contracts/session.yaml`.
   - Map client temp IDs to server IDs on save; reconcile returned payload.
6) **Display**
   - After save, show a summary of session details, exercises (with metrics), and notes in the page.
7) **Testing**
   - Unit tests for hooks and validation logic (Vitest + testing-library).
   - Integration test for creating and editing a session with mocked API responses.
   - Contract test stubs aligned to `contracts/session.yaml`.
