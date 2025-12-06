<!-- Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles: none (principles unchanged)
- Added sections: Purpose, Users & Scope; Health, Safety & Privacy Guardrails; AI Tooling & Workflow Rules
- Removed sections: none
- Templates requiring updates: none required (principles already aligned with existing templates)
- Follow-up TODOs: none
-->

# CoachCW Constitution

## Purpose, Users & Scope

**Primary users**

CoachCW is designed for:

- New or returning exercisers building base fitness
- Busy professionals trying to train around work and family demands
- Amateur athletes looking to take the next step in their sport

**Scope of this repo**

This repository governs:

- A **web-based application** as the primary interface (initially desktop web, mobile web later)
- Training plans, sessions and progress **logging & tracking**
- Surfacing **simple metrics** (e.g. consistency, load trends, key performance indicators)
- In-app **guidance & education** that explains the “why” behind recommendations
- A **Docker-based local development environment** and related tooling

Future scope (explicitly allowed but not required now):

- **3rd-party integrations** (e.g. watches, bike computers, heart-rate straps) via APIs
- Background jobs or services that process training data for insights

Any major expansion beyond this (e.g. nutrition tracking, e-commerce, or medical tooling) must be explicitly added to this constitution and reviewed.

---

## Core Principles

### I. User Outcomes First (NON-NEGOTIABLE)

Every initiative must anchor to explicit user journeys and measurable success criteria before design or build.  
Prioritize by user value (P1, P2, P3) and keep acceptance criteria **testable and observable** so progress can be demonstrated quickly.

### II. Test-First Reliability

Write failing tests before implementing new behaviors (unit, contract, integration as needed).  
Code may not merge without passing automated tests covering acceptance criteria and critical failure paths.  
Regression tests must be added alongside any bug fix.

### III. Incremental, Releasable Slices

Work is broken into independently valuable slices that can ship on their own.  
Avoid cross-story coupling; favor feature flags or configuration to keep incomplete work disabled while keeping the main branch releasable at all times.

### IV. Text-First Interfaces & Traceability

Automation and tooling favor text I/O (stdin/stdout/stderr) with deterministic, parseable output to enable scripting, debugging, and reproducibility.  
All commands and scripts must emit structured logs for traceability.

### V. Observability & Change Safety

Changes must include meaningful logging, error handling, and (where applicable) metrics that expose health and user impact.  
Dependencies are pinned, secrets are excluded from the repo, and every change includes a rollback or disable strategy.

---

## Quality & Security Standards

- Pin runtime, tooling, and dependency versions in manifests or lockfiles; document any deviations.
- Keep secrets, keys, and sensitive data out of source control; use environment configuration with clear setup instructions.
- Document decisions that affect user value, risk, or maintainability in feature plans/specs.
- Keep architecture as small as possible for the requirement; justify additional components in plans with simpler alternatives considered.
- Data handling must state retention, access, and error-handling expectations in specs when user data is involved.

---

## Health, Safety & Privacy Guardrails

**Training safety**

- The app is **not a medical device** and does not provide medical advice. Where relevant, the UI and content must clearly state this.
- Training recommendations must be:
  - Based on **explicit user inputs** (e.g. training history, goals, injury flags, perceived fitness)
  - Conservative by default for new/returning exercisers, with **progressive loading** and limits on sudden spikes
- Assumptions (e.g. “no known injuries”, “no recent illness”) must be:
  - Clearly stated in specs and, where appropriate, in the UI
  - Easy for the user to override or correct
- Any feature that could meaningfully increase training load or intensity must:
  - Call out risks in the spec
  - Include tests for “unsafe input” scenarios (e.g. user flags injury, burnout, or excessive fatigue)

**Privacy & data use**

- Collect the **minimum data required** to deliver value for the user segment and feature in question.
- Be clear in UI copy (or onboarding) about:
  - What is being stored
  - Why it is stored
  - How it improves the user’s experience
- Non-production environments must use **synthetic or anonymised data**; no real user data in local dev by default.
- 3rd-party trackers/devices:
  - Integrations are **opt-in** and transparently described.
  - The user controls which sources are connected and can disconnect them.
  - Specs for integrations must describe how data is pulled, stored, and surfaced to the user.

---

## Workflow & Delivery Process

- **Constitution Check** happens in every plan: confirm user outcomes, test-first approach, incremental slices, text-first interfaces, and observability commitments before research/implementation.
- **Delivery flow:** `plan -> spec -> tasks -> implementation`.  
  Each stage must carry forward priorities, acceptance criteria, and test strategy; tasks remain grouped by user story to preserve independent delivery.
- Reviews and releases must verify:
  - Tests are present and passing
  - Logs/metrics are covered for new paths (where applicable)
  - Any feature flags or rollback instructions are documented

---

## AI Tooling & Workflow Rules

- **AI is an assistant, not the authority**  
  Codex, ChatGPT, Specify, and other AI tools exist to help with thinking, scaffolding, and implementation, but **humans remain accountable** for design, safety, and correctness of changes.

- **Spec → Plan → Tasks is mandatory for behaviour changes**  
  Any change that affects:
  - User-visible behaviour or flows  
  - Data models or persistence  
  - APIs, contracts, or integration points  
  - Performance characteristics or safety logic  

  **MUST** go through the full Specify workflow:

  - `/speckit.specify` – baseline feature specification  
  - `/speckit.plan` – implementation plan and trade-offs  
  - `/speckit.tasks` – actionable tasks tied to the spec/plan  

  Implementation work only starts once these are in place and linked in the PR.

- **Even “small” refactors and documentation changes are tracked**  
  - Small refactors, internal clean-ups, and documentation-only changes **still go through Specify**.  
  - They may use **very small specs/plans** (e.g. “micro-feature” or “maintenance” entries), but they must still:
    - State the intent (why this refactor or doc update is being done), and  
    - Be represented as tasks before changes are made.  
  - No “stealth” refactors or doc changes directly on `main` without a corresponding spec/plan/tasks record.

- **Human review is mandatory for feature/behaviour changes**  
  - Any PR that changes behaviour, data shape, or user-facing copy **MUST** be reviewed and approved by a human maintainer.  
  - AI-generated diffs are allowed, but:
    - AI **cannot** be the only reviewer.  
    - Reviewers must verify:  
      - The PR links to the relevant spec/plan/tasks  
      - Tests exist and pass  
      - Logging/observability and safety implications are covered (where relevant).  
  - Auto-merge or “blind apply” of AI changes without human inspection is **not allowed**.

---

## Governance

- This constitution supersedes other practice docs; deviations require explicit risk acceptance in the relevant plan/spec and reviewer approval.
- Amendments require a documented change proposal (PR) describing rationale, expected impacts, and any migration steps; approvals must include at least one maintainer.
- Versioning follows semantic rules:
  - **MAJOR** for incompatible governance/principle changes
  - **MINOR** for new principles/sections or materially stronger requirements
  - **PATCH** for clarifications
- Compliance is reviewed at plan creation and before release; any violation must list mitigations and timelines for resolution.

**Version**: 1.1.0 | **Ratified**: 2025-12-06 | **Last Amended**: 2025-12-06
