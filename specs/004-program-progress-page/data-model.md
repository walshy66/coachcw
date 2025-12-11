# Data Model: Program progress page

## Entities

- **Program**: id, name, goal/target, startDate, endDate, totalWeeks, completedWeeks, overallProgress (0-1), adherenceRate (0-1), currentPhaseId, nextSessionId.
- **Phase (Macro cycle)**: id, programId, name, focus, startDate, endDate, totalWeeks, completedWeeks, status (planned/current/complete).
- **MicroCycle**: id, programId, phaseId, name, focus, startDate, endDate, sessionsPlanned, sessionsCompleted, readinessScore (0-1), status (current/upcoming/done).
- **SessionSummary**: id, date, startTime, title, status, durationMinutes, modality, phaseId, microCycleId.
- **ProgressSample**: id, label (week start), sessionsScheduled, sessionsCompleted, volume, unit.

## Relationships

- Program has many Phases; exactly one current Phase may be flagged.
- Program has many MicroCycles; each MicroCycle belongs to a Phase and is mutually exclusive in time.
- Program optionally references next SessionSummary to drive CTA; SessionSummary belongs to a MicroCycle/Phase when provided.
- ProgressSample set belongs to a Program (used for adherence/volume charts).

## Notes

- Dates are YYYY-MM-DD client-local for display consistency with existing schedule services.
- ReadinessScore is a display-only heuristic (0-1) to surface current load/momentum; no write flows planned.
