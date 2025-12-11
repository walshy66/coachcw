# Contracts: Program data (proposed)

## REST endpoints (client-facing)

- `GET /clients/{clientId}/program`
  - Returns program overview with phases, microCycles, progress samples, and nextSession summary.
- `GET /clients/{clientId}/program/micro-cycles`
  - Optional list endpoint when pagination/filtering is needed; otherwise data can be embedded in program overview.
- `GET /clients/{clientId}/program/phases`
  - Optional list endpoint for macro phases if not included in overview.

## Response shape (program overview, draft)

```json
{
  "programName": "Half-marathon block",
  "goal": "Break 1:35 at spring race",
  "startDate": "2025-01-06",
  "endDate": "2025-03-16",
  "totalWeeks": 10,
  "completedWeeks": 5,
  "overallProgress": 0.5,
  "adherenceRate": 0.82,
  "currentPhaseId": "phase-2",
  "phases": [
    { "id": "phase-1", "name": "Foundation", "focus": "Base", "startDate": "2024-12-09", "endDate": "2025-01-05", "totalWeeks": 4, "completedWeeks": 4, "status": "complete" },
    { "id": "phase-2", "name": "Build", "focus": "Threshold", "startDate": "2025-01-06", "endDate": "2025-02-02", "totalWeeks": 4, "completedWeeks": 1, "status": "current" }
  ],
  "microCycles": [
    { "id": "mc-5", "phaseId": "phase-2", "name": "Week 5", "focus": "Tempo ladders", "startDate": "2025-01-06", "endDate": "2025-01-12", "sessionsPlanned": 5, "sessionsCompleted": 2, "readinessScore": 0.86, "status": "current" }
  ],
  "progress": {
    "samples": [
      { "label": "2025-01-06", "sessionsScheduled": 5, "sessionsCompleted": 4, "volume": 420, "unit": "minutes" }
    ]
  },
  "nextSession": { "id": "sess-11", "date": "2025-01-09", "startTime": "07:00:00", "title": "Intervals", "status": "planned", "durationMinutes": 50, "modality": "run" }
}
```

## Notes

- Status enums: phase status = planned/current/complete; micro cycle status = current/upcoming/done; session status = planned/completed/missed/changed.
- Dates are ISO date strings (YYYY-MM-DD) in client timezone context; times are local time strings with offset handled by frontend.
- Error handling: 4xx for missing program; 5xx for backend failures; frontend will fall back to mocks when `VITE_USE_MOCKS=true`.
