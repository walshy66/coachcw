---
description: "Tasks to deliver repository README and workflow primer"
---

# Tasks: Repository README and workflow primer

**Input**: Design documents from `/specs/000-repo-readme/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Manual content verification; ensure README covers acceptance scenarios.

**Organization**: Tasks grouped by user story.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create `specs/000-repo-readme/` directory and seed plan/spec/tasks documents.

---

## Phase 3: User Story 1 - Understand governance (Priority: P1) MVP

**Goal**: Provide governance summary and constitution link.

### Tests for User Story 1 (mandatory)

- [ ] T010 [P] Manual review: README contains scope overview and constitution link.

### Implementation for User Story 1

- [x] T012 [US1] Draft README overview and governance section at `README.md` referencing `.specify/memory/constitution.md`.

---

## Phase 4: User Story 2 - Follow workflow (Priority: P2)

**Goal**: Explain Specify workflow and artifact locations.

### Tests for User Story 2 (mandatory)

- [ ] T018 [P] Manual review: README lists plan → spec → tasks → implementation steps and directories.

### Implementation for User Story 2

- [x] T020 [US2] Add workflow section to `README.md` with paths to current spec and tasks files.

---

## Phase 5: User Story 3 - Local orientation (Priority: P3)

**Goal**: Show repository layout and intended single-project structure.

### Tests for User Story 3 (mandatory)

- [ ] T024 [P] Manual review: README lists existing files and intended structure.

### Implementation for User Story 3

- [x] T026 [US3] Add repository layout and planned structure summary to `README.md`.

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] TXXX Proofread README for clarity and consistency.

## Dependencies & Execution Order

- Governance overview precedes workflow and structure text to anchor context.
- Workflow guidance should reference spec/tasks paths once they exist.
- Structure summary can be maintained independently after core content is present.
