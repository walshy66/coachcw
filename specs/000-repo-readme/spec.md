# Feature Specification: Repository README and workflow primer

**Feature Branch**: `work`
**Created**: 2025-12-11
**Status**: Draft
**Input**: User description: "Provide contributors with a clear entry point to the CoachCW constitution and workflow."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand governance (Priority: P1)

A new contributor needs a single place to learn the repository scope and governance expectations before making changes.

**Why this priority**: Ensures compliance with the constitution and reduces onboarding friction.

**Independent Test**: Reviewer can read README.md to find a concise summary of scope and a link to the constitution without needing other files.

**Acceptance Scenarios**:

1. **Given** a new contributor opens README.md, **When** they scan the overview section, **Then** they can identify the purpose and scope of CoachCW.
2. **Given** a contributor wants governance details, **When** they follow the README link, **Then** they reach the constitution document.

---

### User Story 2 - Follow workflow (Priority: P2)

A contributor wants to know how to use the Specify flow (plan → spec → tasks → implementation) before starting work.

**Why this priority**: Reduces risk of process violations and anchors new contributions to required artifacts.

**Independent Test**: README includes a workflow section summarizing steps and relevant directories.

**Acceptance Scenarios**:

1. **Given** a contributor reads README.md, **When** they look for workflow guidance, **Then** they see the required Specify steps and artifacts.
2. **Given** a contributor wants artifact locations, **When** they check README.md, **Then** they find paths for specs and tasks.

---

### User Story 3 - Local orientation (Priority: P3)

A contributor wants to know the current repository layout and where to add future code.

**Why this priority**: Provides clarity even before source directories exist, avoiding ad-hoc structures.

**Independent Test**: README outlines the current minimal structure and the intended future layout described in the plan.

**Acceptance Scenarios**:

1. **Given** a contributor opens README.md, **When** they review the structure section, **Then** they see existing docs and the planned single-project layout.

### Edge Cases

- Contributors who skim quickly should still notice the constitution link.
- Repository currently lacks source code; README should clarify that this is intentional baseline state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: README MUST summarize CoachCW purpose and scope.
- **FR-002**: README MUST link to `.specify/memory/constitution.md` for governance details.
- **FR-003**: README MUST outline the plan → spec → tasks → implementation workflow.
- **FR-004**: README MUST describe current repository layout and intended single-project structure.

### Key Entities *(include if feature involves data)*

- N/A for documentation-only change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can locate constitution and workflow guidance within one minute using README alone.
- **SC-002**: README references active feature documentation at `specs/000-repo-readme/`.
- **SC-003**: README states current repository state and intended structure without contradictions.
