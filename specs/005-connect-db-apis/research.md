# Research: Connect Application APIs to the Database

## Decisions

- **Database technology**: Use PostgreSQL 15 as the single authoritative store managed through Prisma migrations plus seed scripts.
  - **Rationale**: Spec assumptions already mention a primary relational database; PostgreSQL provides strong ACID guarantees, broad tooling support, and easy compatibility with containerized dev setups.
  - **Alternatives considered**: MySQL/MariaDB (would add new dialect quirks and tooling), hosted document stores (conflicts with relational data shape and transactions required for FR-004).

- **API framework**: Build the service on Fastify 5 with TypeScript instead of Express.
  - **Rationale**: Fastify offers better out-of-the-box schema validation, lower overhead, and structured logging hooks that align with the constitution’s text-first/observability rules.
  - **Alternatives considered**: Express 4 (familiar but slower and needs extra middleware for schemas), NestJS (larger abstraction surface that would slow initial delivery).

- **ORM + query layer**: Adopt Prisma ORM + `@prisma/client` on top of the native `pg` driver.
  - **Rationale**: Prisma enforces schema parity, generates TS types for DTOs, and supports safe transactions/connection pooling with little boilerplate, speeding up FR-003/FR-004.
  - **Alternatives considered**: Knex + custom types (more boilerplate and weaker typing), raw SQL (`pg` only; error-prone and harder to keep migrations traceable).

- **Configuration strategy**: Centralize settings in `src/config/` that loads `.env` (for dev) plus injected secrets (for CI/prod), validates through Zod, and exposes an immutable config object.
  - **Rationale**: Provides environment-specific DB hosts/credentials mandated by User Story 2 while guaranteeing startup fails fast if required keys are missing.
  - **Alternatives considered**: Ad-hoc `process.env` access (risk of silent typos) or JSON config committed to git (would violate secrets guidance).

- **Connection management & health**: Use Prisma’s underlying `pg` pool with explicit warm-up tests, surface `/health/db` and `/health/ready` endpoints, and emit metrics via pino + optional Prometheus formatter.
  - **Rationale**: Meets SC-003 (alert within 2 minutes) and FR-005 by giving both HTTP and telemetry-level insight along with retryable connection policies.
  - **Alternatives considered**: Custom pooling logic (reinvents `pg-pool`), relying solely on cloud provider health (insufficient visibility for local/CI scenarios).

- **Testing approach**: Run Vitest for unit/contract checks plus dockerized Postgres for integration specs; seed data using Prisma fixtures per test suite.
  - **Rationale**: Keeps the toolchain consistent with the frontend (Vitest) while ensuring real SQL coverage, satisfying Test-first Reliability and FR-001 – FR-007 acceptance cases.
  - **Alternatives considered**: Jest (another runner to maintain) or mock-only tests (would not validate schema/transaction correctness).

- **Deployment & rotation**: Package the API as a stateless container with graceful shutdown hooks, use rolling deploys (Kubernetes or Docker swarm) so credential rotations and schema changes can be applied without downtime.
  - **Rationale**: Directly aligns with FR-007 (zero-downtime config changes) and gives operations a predictable restart surface.
  - **Alternatives considered**: PM2/forever on a VM (harder to guarantee clean restarts), serverless (cold starts make <1s response guarantee harder without more work).
