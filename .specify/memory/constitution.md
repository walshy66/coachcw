<!-- Sync Impact Report
- Version change: 1.1.0 -> 1.2.0
- Modified principles: none (principles unchanged)
- Added sections: UI Architecture & Layout Requirements
- Removed sections: none
- Templates requiring updates: none required; this section provides architectural guidance used by plans
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

## UI Architecture & Layout Requirements

### Global Navigation & Layout Shell (NON-NEGOTIABLE)

All pages in the application must render within a shared **AppShell** (or equivalent layout wrapper) that provides:

- The primary navigation menu
- Header and global context elements
- The routed content region for feature-specific views

### Source of Truth  
The navigation menu must have a **single authoritative implementation**.  
Features may **extend** the navigation (e.
