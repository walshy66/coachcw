# CoachCW API

Fastify 5 + Prisma based API that powers the React clients with live program, session, and profile data.

## Requirements

- Node.js 20+
- npm 10+
- Running PostgreSQL 15 instance (see `../docker/compose.db.yml`) with a database accessible via `DATABASE_URL`

## Environment

Copy `.env.example` into `.env` (or export values via your secret manager) and set the following at minimum:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coachcw
DB_ENVIRONMENT=development
LOG_LEVEL=info
```

Optional: `DEFAULT_ATHLETE_ID` for local auth shortcuts.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Fastify with `tsx watch` for hot reloads |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled server from `dist/` |
| `npm test` | Execute Vitest suites (contract/unit by default) |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Coverage via V8 |
| `npm run migrate:dev` | Run Prisma migrations locally |
| `npm run migrate` | Deploy migrations in CI/prod |
| `npm run seed` | Seed the dev database with representative data |
| `npm run prisma:generate` | Regenerate Prisma client |

## Development Flow

1. `npm install`
2. `npm run migrate:dev`
3. `npm run seed`
4. `npm run dev`
5. Call `http://localhost:3333/api/v1/...` with `x-actor-id` header

Integration tests that require a live database are gated behind `RUN_DB_TESTS=true npm test`.
