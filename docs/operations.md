# Operations Guide

## Database Environments

| Environment | Description | Secret Ref |
| --- | --- | --- |
| development | Local developer database (Docker) | `local-dev` |
| staging | Pre-production validation | `staging-secret` |
| production | Primary customer data | `prod-secret` |

The API reads connection metadata from environment variables at startup and writes every applied profile to the `DatabaseConnectionProfile` table. To rotate credentials with zero downtime:

1. Store the new credential in your secret manager.
2. Update the API deployment environment variables (`DATABASE_URL`, `DB_CREDENTIAL_REF`) with the new values.
3. Trigger a rolling restart. Each instance drains, disconnects, reloads the Prisma client, and records the new profile.
4. Verify `/health/db` returns `status=pass` for the new environment.

## Health & Alerting

- `/health/ready`: readiness (Fastify + Prisma connection state)
- `/health/db`: database latency + last failure timestamp

Health probes emit structured logs (`metrics.health`) that feed your alerting pipeline. For outages, the retry policy backs off exponentially while logging the error code. Wire alert hooks (PagerDuty, SNS, etc.) where noted in the telemetry layer once those integrations are available.

## Incident Runbook

1. Check `/health/db` to confirm failing status.
2. Inspect recent `ConnectionHealthEvent` rows for error codes and latency trends.
3. Validate credentials by running `npm run migrate:dev -- --schema prisma/schema.prisma` in a maintenance shell.
4. After DB recovery, confirm `/health/db` transitions to `pass` within 2 minutes and that connection events show the new latency profile.
