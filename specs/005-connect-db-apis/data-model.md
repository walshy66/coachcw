# Data Model: Connect Application APIs to the Database

## Entities

- **AthleteProfile**
  - Fields: `id (uuid)`, `userId`, `displayName`, `timezone`, `primaryGoal`, `coachNotes`, `updatedAt`.
  - Validation: `displayName` 1-80 chars, timezone must match IANA string, `primaryGoal` limited to enumerated focus areas.

- **TrainingProgram**
  - Fields: `id (uuid)`, `athleteId`, `title`, `startDate`, `endDate`, `macroCycle`, `status (planned/current/completed)`, `updatedAt`.
  - Derived metrics: `totalWeeks`, `completedWeeks`, `adherenceRate`.
  - References: `currentPhaseId`, `nextSessionId`.

- **ProgramPhase**
  - Fields: `id`, `programId`, `name`, `focus`, `phaseOrder`, `startDate`, `endDate`, `status`.
  - Relationship: belongs to a `TrainingProgram`; optional `microCycles[]`.

- **MicroCycle**
  - Fields: `id`, `programId`, `phaseId`, `weekIndex`, `sessionsPlanned`, `sessionsCompleted`, `readinessScore`, `status`.

- **TrainingSession**
  - Fields: `id`, `programId`, `phaseId`, `microCycleId`, `athleteId`, `title`, `scheduledAt`, `durationMinutes`, `modality`, `status (planned/completed/skipped)`, `load`.
  - Timestamps: `scheduledAt`, `completedAt`, `updatedAt`.

- **ConnectionHealthEvent**
  - Fields: `id`, `checkedAt`, `environment`, `status (pass/fail)`, `latencyMs`, `errorCode`, `message`.
  - Stored for observability/alert backfill; newest entry drives `/health/db`.

- **DatabaseConnectionProfile**
  - Fields: `id`, `environment`, `host`, `port`, `database`, `schema`, `credentialRef`, `rotationIntervalDays`, `lastValidatedAt`.
  - Used for configuration audit logs; actual secrets stay external, but metadata is tracked for compliance.

## Relationships

- An `AthleteProfile` has many `TrainingProgram` records; only one can be `status=current` per athlete at a time.
- `TrainingProgram` has many `ProgramPhase` entries; each phase can contain many `MicroCycle` entries, which in turn group `TrainingSession` records.
- `TrainingSession` references both the owning `AthleteProfile` and its parent program/phase/cycle for consistent filtering.
- `ConnectionHealthEvent` does not link to athlete data but is keyed by `environment` for dashboards.
- `DatabaseConnectionProfile` is standalone metadata but is linked via `environment` to runtime configuration to confirm correct host/schema usage.

## Notes

- UUID primary keys are used across entities to simplify future synchronization across services.
- All date/timestamps stored in UTC ISO8601; presentation/localization handled by the frontend.
- Soft deletes are not required for this iteration; failed writes roll back entirely due to transactional scope.
- Prisma models will enforce referential integrity (e.g., cascade delete sessions when a program is archived) but delete endpoints are out of scope for this feature.
