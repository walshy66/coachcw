# CoachCW

CoachCW is a web-focused training companion for new or returning exercisers, busy professionals, and ambitious amateurs. The app emphasizes training plans, logging, simple metrics, and clear guidance on the "why" behind recommendations.

## Governance and safety

- CoachCW follows the constitution at `.specify/memory/constitution.md` (version 1.1.0). It outlines scope, training safety guardrails, privacy expectations, and workflow rules.
- The app is **not a medical device** and does not provide medical advice; recommendations must respect the conservative, progressive-loading defaults described in the constitution.

## Delivery workflow

All behavioral or documentation changes use the Specify flow and should remain linked in PRs:

1. **Plan**: capture context and Constitution Check (`specs/<feature>/plan.md`).
2. **Spec**: prioritize user stories and acceptance scenarios (`specs/<feature>/spec.md`).
3. **Tasks**: list independently testable tasks per story (`specs/<feature>/tasks.md`).
4. **Implementation**: code or docs changes with tests.

Current artifacts for this repo orientation live in `specs/000-repo-readme/`.

## Repository layout

```text
app/        # React 19 + Vite frontend
api/        # Fastify 5 + Prisma API (Node 20)
docker/     # Local infra (Postgres, pgAdmin)
docs/       # Ops + troubleshooting references
specs/      # Plans/specs/tasks per feature
```

- **Frontend (`app/`)**: Uses Vite + Vitest. Configure `.env` with `VITE_API_BASE` and `VITE_USE_MOCKS` to toggle between API and mock data.
- **API (`api/`)**: Node 20 Fastify service with Prisma migrations + seeds. See `api/README.md` for scripts, env vars, and health endpoints.
- **Specs**: Keep plan/spec/tasks synchronized (see `specs/005-connect-db-apis/` for the current backend feature).

Use synthetic or anonymized data in non-production environments and keep dependencies pinned once added.
