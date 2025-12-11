# Quickstart: Connect Application APIs to the Database

## Prerequisites

- Node.js 20.x and npm 10.x
- Docker + Docker Compose (for Postgres + pgAdmin locally)
- Access to environment secrets (DATABASE_URL, JWT/Session secrets if already defined)

## Run the API locally

1. `cd api`
2. Copy `.env.example` to `.env` and set at minimum:
   - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coachcw`
   - `PORT=3333`
   - `DEFAULT_ATHLETE_ID=athlete-001` (optional convenience user)
3. Start Postgres locally: `docker compose -f ../docker/compose.db.yml up -d`
4. Install deps: `npm install`
5. Generate Prisma client & run migrations: `npm run migrate:dev`
6. Seed demo data (profiles/programs/sessions): `npm run seed`
7. Start the API with hot reload: `npm run dev`
8. Validate health endpoints:
   - `curl http://localhost:3333/health/db`
   - `curl http://localhost:3333/health/ready`

## Run automated tests

1. Ensure Postgres is running (steps above) if you plan to hit integration specs.
2. From `api/`, execute:
   - `npm run test` (Vitest unit/contract suites with mocked data)
   - `RUN_DB_TESTS=true npm test` (turns on integration + health retry suites)
3. Regenerate Prisma client after schema edits with `npm run prisma:generate`

## Coordinating with the frontend

1. Keep the API running on `http://localhost:3333`.
2. In a separate terminal: `cd app && npm run dev`.
3. Set frontend env (`VITE_API_BASE=http://localhost:3333`, `VITE_USE_MOCKS=false`) to route through live APIs.

## What to verify manually

- GET `/api/v1/programs/:athleteId/current` returns seeded program with last-updated timestamps.
- POST `/api/v1/sessions` creates a session, commits the transaction, and returns the persisted ID.
- When Postgres is stopped, `/health/db` returns `{ status: "fail" }` and the API logs an error before rejecting requests per retry policy.
- Restarting Postgres leads to automatic recovery without redeploying (per FR-006/FR-007).
