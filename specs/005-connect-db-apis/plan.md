# Implementation Plan: Connect Application APIs to the Database

**Branch**: 005-connect-db-apis | **Date**: 2025-12-11 | **Spec**: specs/005-connect-db-apis/spec.md  
**Input**: Feature specification from /specs/005-connect-db-apis/spec.md

## Summary

Stand up a production-ready API tier that reads and writes the authoritative program, session, and profile records from PostgreSQL instead of mocks. The plan introduces a Node 20 + TypeScript Fastify service with Prisma for schema management, environment-scoped configuration (dev/stage/prod), connection pooling/health probes, and standardized REST contracts so the existing React frontend and future clients consume the same endpoints while observability plus zero-downtime deployment safeguards meet the constitution.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS)  
**Primary Dependencies**: Fastify 5, Prisma ORM + `pg` pool, Zod for config validation, pino for structured logging  
**Storage**: PostgreSQL 15 (authoritative relational DB) managed via Prisma migrations + seeds  
**Testing**: Vitest + Supertest for API/contract tests, Prisma test client with dockerized Postgres for integration coverage  
**Target Platform**: Linux containers (Docker Compose locally, containerized deploy target)  
**Project Type**: Web backend service (`api/`) alongside the existing `app/` frontend  
**Performance Goals**: 95% of data endpoints < 1s (SC-001), DB health alerts within 2 minutes (SC-003), deployments blocked on failed DB validation (SC-002)  
**Constraints**: Keep architecture minimal (single API service), secrets must be externalized, logs/errors structured for traceability, configuration changes deploy without downtime, frontend keeps shared AppShell nav when consuming new data  
**Scale/Scope**: One API with three core resource families (profiles, sessions, programs) plus health/config endpoints; sized for <10k concurrent users but horizontally scalable with stateless workers

## Constitution Check

*Pre-Phase-0 gates and status:*

1. **User outcomes first** – Spec enumerates P1–P3 journeys, edge cases, and success metrics; plan traces work items directly to these flows. ✅  
2. **Test-first reliability** – Every endpoint/transaction gains Vitest + Supertest coverage plus Prisma-backed integration tests seeded with fixtures before implementation. ✅  
3. **Incremental, releasable slices** – Delivery split into configuration bootstrap, read endpoints, write endpoints, and observability slices so frontend can adopt data progressively without blocking on later work. ✅  
4. **Text-first interfaces & traceability** – Fastify returns JSON, pino logging stays structured, health + diagnostics endpoints expose machine-readable payloads for CI/CD gates. ✅  
5. **Observability & change safety** – Startup validates DB connectivity, connection metrics feed alerts, and config reload/drain patterns enforce zero-downtime secrets rotation. ✅

Re-check required after Phase 1 to confirm design artifacts still satisfy gates.

## Project Structure

### Documentation (this feature)

```text
specs/005-connect-db-apis/
├─ plan.md         # this file
├─ research.md     # Phase 0 decisions + rationale
├─ data-model.md   # Entity + relationship definitions
├─ quickstart.md   # How to run API/tests locally
└─ contracts/      # REST/OpenAPI contracts per endpoint group
```

### Source Code (repository root)

```text
api/
├─ package.json
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ src/
│  ├─ config/        # env loading, Zod validation, secret providers
│  ├─ db/            # Prisma client, connection pool, transactions
│  ├─ modules/
│  │  ├─ profiles/
│  │  ├─ sessions/
│  │  └─ programs/
│  ├─ routes/        # Fastify route + schema registration
│  ├─ services/      # Use-case orchestration + retry policies
│  └─ telemetry/     # logging, metrics, health reporters
└─ tests/
   ├─ contract/      # schema/unit tests around DTO validation
   └─ integration/   # Fastify + Postgres end-to-end tests

app/
├─ src/              # React frontend already shipping
└─ tests/            # Vitest suites that will call new APIs

docker/
├─ compose.db.yml    # shared Postgres + pgAdmin containers for dev/test
```

**Structure Decision**: Add a dedicated `api/` workspace so backend code can manage secrets, migrations, and observability independently, while the existing `app/` SPA only consumes the resulting endpoints via its service layer. Shared Docker assets keep both projects pointing at the same Postgres instance locally.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Introduce dedicated API project (`api/`) | Database credentials and transaction logic must live server-side with health probes/alerts | Baking DB access into the Vite frontend would expose secrets, break constitution security rules, and make reuse by mobile/3rd-party clients impossible |
| Adopt Prisma ORM | Ensures schema parity, typed models, and migrations with rollback support | Raw SQL via `pg` alone would duplicate schema definitions across layers and make transactional integrity/error handling harder to prove |
