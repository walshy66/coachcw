# coachcw Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-09

## Active Technologies
- TypeScript, React 19 + React, React DOM, Vite, date-fns (formatting), testing-library/Vitest; reuse existing AppShell/layout components (003-session-page)
- API-backed session persistence (RESTful contract defined here); no client-side offline store in scope (003-session-page)
- TypeScript, React 19 on Vite 7 + Recharts (graphs), date-fns (date formatting), testing-library + Vitest (004-program-progress-page)
- Client-side mock data for now; fetch wrappers ready for API when available (004-program-progress-page)
- TypeScript (Node.js 20 LTS) + Fastify 5, Prisma ORM + `pg` pool, Zod for config validation, pino for structured logging (005-connect-db-apis)
- PostgreSQL 15 (authoritative relational DB) managed via Prisma migrations + seeds (005-connect-db-apis)

- TypeScript, React 19 on Vite 7 + react, react-dom, date-fns (formatting), recharts (graphs elsewhere), testing-library stack (002-profile-page)

## Project Structure

```text
app/        # React 19 + Vite frontend
api/        # Fastify + Prisma backend service
docker/     # Local Postgres + tooling
docs/       # Operations + troubleshooting guides
specs/      # Plans/specs/tasks per feature
```

## Commands

- **Frontend (`app/`)**: `npm install`, `npm run dev`, `npm run test`, `npm run lint`
- **API (`api/`)**: `npm install`, `npm run dev`, `npm test` (add `RUN_DB_TESTS=true` for integration suites), `npm run migrate:dev`, `npm run seed`
- Root scripts run via each workspace; Dockerized Postgres available with `docker compose -f docker/compose.db.yml up -d`

## Code Style

TypeScript, React 19 on Vite 7: Follow standard conventions

## Recent Changes
- 005-connect-db-apis: Added TypeScript (Node.js 20 LTS) + Fastify 5, Prisma ORM + `pg` pool, Zod for config validation, pino for structured logging
- 004-program-progress-page: Added TypeScript, React 19 on Vite 7 + Recharts (graphs), date-fns (date formatting), testing-library + Vitest
- 003-session-page: Added TypeScript, React 19 + React, React DOM, Vite, date-fns (formatting), testing-library/Vitest; reuse existing AppShell/layout components


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
