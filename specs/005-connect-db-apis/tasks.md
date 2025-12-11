# Tasks: Connect Application APIs to the Database

**Input**: Design documents from `/specs/005-connect-db-apis/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Acceptance requires contract + integration tests for the core APIs and health probes.

**Organization**: Tasks are grouped by user story so each slice is independently testable.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap the backend workspace, tooling, and local database runtime.

- [ ] T001 Create `api/` workspace (package.json, tsconfig, lint config) mirroring plan.md structure
- [ ] T002 Install Fastify, Prisma, Zod, pino, Vitest, Supertest, and TS types in `api/package.json`
- [ ] T003 [P] Add/extend `docker/compose.db.yml` to run PostgreSQL 15 + pgAdmin for local dev
- [ ] T004 [P] Document npm scripts (`dev`, `build`, `test`, `migrate`, `seed`) in `api/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before user stories can start.

- [ ] T005 Define Prisma models (AthleteProfile, TrainingProgram, ProgramPhase, MicroCycle, TrainingSession, ConnectionHealthEvent, DatabaseConnectionProfile) in `api/prisma/schema.prisma`
- [ ] T006 Create initial migration + seed script under `api/prisma/migrations/` and `api/prisma/seed.ts`
- [ ] T007 Implement Zod-based configuration loader in `api/src/config/index.ts` (env + secrets support)
- [ ] T008 [P] Add logging/telemetry bootstrap with pino + correlation IDs in `api/src/telemetry/logger.ts`
- [ ] T009 [P] Scaffold Fastify server entry with graceful shutdown in `api/src/server.ts`
- [ ] T010 [P] Add shared error/response helpers in `api/src/routes/plugins/errors.ts`
- [ ] T011 Configure Vitest + Supertest harness in `api/tests/setup.ts` and `vitest.config.ts`

**Checkpoint**: Schema, migrations, config, server skeleton, logging, and test harness ready.

---

## Phase 3: User Story 1 – Persisted coaching data loads through APIs (Priority: P1) ← MVP

**Goal**: Replace mock data with live PostgreSQL-backed profile/program/session APIs.

**Independent Test**: Seed DB with known data, hit GET/POST/PATCH endpoints, verify payloads match DB and responses return within 1 second; simulate DB outage and confirm graceful errors/logs.

### Tests for User Story 1

- [ ] T012 [P] [US1] Author contract tests for `/api/v1/profiles/{athleteId}` in `api/tests/contract/profiles.spec.ts`
- [ ] T013 [P] [US1] Author contract tests for `/api/v1/programs/{athleteId}/current` and `/api/v1/sessions` (GET/POST/PATCH) in `api/tests/contract/programs_sessions.spec.ts`
- [ ] T014 [US1] Create integration test covering seeded data + outage fallback in `api/tests/integration/live-data.spec.ts`

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement Prisma repositories for profiles/programs/sessions in `api/src/modules/*/repository.ts`
- [ ] T016 [P] [US1] Build service layer with DTO mapping + transactional writes in `api/src/modules/*/service.ts`
- [ ] T017 [US1] Wire Fastify routes + schemas from OpenAPI under `api/src/routes/v1/`
- [ ] T018 [US1] Implement standardized DB outage error handling + logging in `api/src/routes/plugins/errors.ts`
- [ ] T019 [US1] Register v1 route plugins inside `api/src/routes/index.ts`
- [ ] T020 [US1] Update frontend service toggles to call live API when `VITE_USE_MOCKS=false` in `app/src/services/*.ts`
- [ ] T021 [US1] Extend `specs/005-connect-db-apis/quickstart.md` with verification steps for new endpoints

**Checkpoint**: Frontend can consume live profile/program/session data via REST; MVP achieved.

---

## Phase 4: User Story 2 – Environment-specific database configuration (Priority: P2)

**Goal**: Manage per-environment DB hosts/credentials with fail-fast validation and zero-downtime rotation.

**Independent Test**: Point API at staging DB without code changes; confirm production remains untouched; missing/expired credentials must block startup with actionable errors.

### Tests for User Story 2

- [ ] T022 [P] [US2] Add config validation unit tests covering required env vars in `api/tests/unit/config.spec.ts`
- [ ] T023 [US2] Add integration test switching DATABASE_URL to alternate schema in `api/tests/integration/env-switch.spec.ts`

### Implementation for User Story 2

- [ ] T024 [P] [US2] Extend config to surface `DatabaseConnectionProfile` metadata in `api/src/config/index.ts`
- [ ] T025 [US2] Add startup DB validation hook (credential + schema check) in `api/src/db/startup-check.ts`
- [ ] T026 [US2] Implement connection-manager with drain/reconnect support for credential rotation in `api/src/db/connection-manager.ts`
- [ ] T027 [US2] Persist configuration audits via Prisma and expose admin query in `api/src/modules/configuration/repository.ts`
- [ ] T028 [US2] Document environment setup + rotation workflow in `specs/005-connect-db-apis/quickstart.md` and `docs/operations.md`

**Checkpoint**: Environment changes deploy safely with fast feedback on misconfigurations.

---

## Phase 5: User Story 3 – Monitor and recover from connectivity issues (Priority: P3)

**Goal**: Deliver health probes, telemetry, and retry policies so outages are detected and recovered automatically.

**Independent Test**: Block DB network access; `/health/db` shows fail and logs/alerts fire within 2 minutes; once DB returns, service recovers without redeploy.

### Tests for User Story 3

- [ ] T029 [P] [US3] Add contract tests for `/health/db` and `/health/ready` in `api/tests/contract/health.spec.ts`
- [ ] T030 [US3] Add integration test simulating DB outage/recovery in `api/tests/integration/health-retry.spec.ts`

### Implementation for User Story 3

- [ ] T031 [P] [US3] Implement health probe services collecting latency + last failure in `api/src/modules/health/service.ts`
- [ ] T032 [P] [US3] Expose `/health/db` and `/health/ready` routes in `api/src/routes/health.ts`
- [ ] T033 [US3] Emit structured metrics/logs for health status in `api/src/telemetry/metrics.ts`
- [ ] T034 [US3] Implement retry/backoff policy for DB operations ensuring idempotent writes in `api/src/db/retry-policy.ts`
- [ ] T035 [US3] Add alert hook (webhook/SNS placeholder) + documentation in `docs/operations.md`

**Checkpoint**: Observability and auto-recovery guardrails satisfied.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T036 [P] Ensure new Fastify routes respect existing auth middleware in `api/src/routes/plugins/auth.ts`
- [ ] T037 [P] Add performance regression tests/benchmarks for key endpoints in `api/tests/perf/programs.bench.ts`
- [ ] T038 Scrub logs for PII and document logging policy in `api/src/telemetry/logger.ts`
- [ ] T039 Update top-level docs (`README.md`, `AGENTS.md`) with API instructions and troubleshooting notes
- [ ] T040 Run end-to-end quickstart verification (DB + API + frontend) and record steps in `specs/005-connect-db-apis/quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2 → User Story phases → Phase 6**. User stories can run in parallel after Phase 2, but delivering in priority order (US1 then US2 then US3) ensures MVP readiness.
- Within each story, contract/integration tests (T012–T014, T022–T023, T029–T030) should be written before implementation tasks.

### User Story Dependencies

- **US1**: Depends solely on foundational work; delivering it unlocks the MVP.
- **US2**: Depends on config modules from Phase 2; independent of US1 behavior but touches shared config files.
- **US3**: Depends on telemetry scaffolding from Phase 2; can run alongside US2 once base infrastructure exists.

### Parallel Opportunities

- Setup tasks T003–T004 can run while T001–T002 finalize dependencies.
- Foundational tasks T008–T011 touch different files and can progress concurrently after schema/migration work stabilizes.
- For US1, repository (T015) and service (T016) work can proceed in parallel once models exist; route wiring (T017) follows services.
- US2 tasks T024–T027 are largely independent and can be split among engineers after tests are drafted.
- US3 health routes (T031–T033) can progress while retry policy (T034) is implemented.

---

## Implementation Strategy

1. **MVP**: Complete Phases 1–3 so the frontend consumes real data.
2. **Environment Hardening**: Deliver Phase 4 to unblock staging/production deployments.
3. **Observability & Recovery**: Deliver Phase 5 to satisfy alerting and resilience requirements.
4. **Polish**: Address Phase 6 items before handoff to `/speckit.implement`.

---

## Summary Metrics

- **Total tasks**: 40  
- **Tasks per story**: US1 = 10, US2 = 7, US3 = 7  
- **Parallel opportunities**: Tasks marked `[P]` can run concurrently (setup, foundational, and per-story tests/implementation).  
- **Independent test criteria**: Each story includes explicit contract/integration tests to validate acceptance scenarios.  
- **Suggested MVP scope**: Phases 1–3 (through US1) deliver live data APIs; later phases harden environment controls and observability.
