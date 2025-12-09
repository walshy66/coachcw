# Data Model: Session Page Logging

## Entities

### Session
- `id`: string (server-generated)
- `date`: ISO date (required)
- `startTime`: ISO time (optional)
- `endTime`: ISO time (optional; must be after startTime if both provided)
- `durationMinutes`: number (optional; alternative to start/end)
- `location`: string (optional)
- `intensity`: string/enum (optional; e.g., easy/moderate/hard)
- `participants`: string[] (optional; names or IDs of athletes/coaches)
- `notes`: string (optional, multiline allowed)
- `exercises`: ExerciseEntry[] (required; at least one)
- `createdAt`: ISO timestamp (server-generated)
- `updatedAt`: ISO timestamp (server-generated)

### ExerciseEntry
- `id`: string (client temp ID; server may replace)
- `sessionId`: string (server links to parent Session)
- `name`: string (required)
- `sets`: number (optional; required if using reps/load pattern)
- `reps`: number (optional; required if using reps/load pattern)
- `load`: number (optional; weight/resistance; paired with sets/reps when applicable)
- `durationSeconds`: number (optional; alternative metric)
- `restSeconds`: number (optional)
- `order`: number (required; used for display ordering)
- `notes`: string (optional; brief per-exercise note)

## Relationships

- Session **has many** ExerciseEntry items, ordered by `order`.
- ExerciseEntry **belongs to** Session via `sessionId`.

## Validation Rules

- Session `date` required.
- Session must contain **at least one** `ExerciseEntry`.
- Each `ExerciseEntry` requires `name` and `order`.
- Each `ExerciseEntry` must include **either**:
  - load-based metrics: `sets` AND `reps` (with optional `load`), **or**
  - time-based metrics: `durationSeconds`.
- If both `startTime` and `endTime` provided, `endTime > startTime`.
- Notes accept long text; do not truncate.
- Duplicate exercise names allowed; uniqueness enforced by `id` + `order`.

## State & Transitions

- `editing` (unsaved changes in client state) → `saved` (after successful POST/PUT).
- Discard navigation shows confirmation when leaving `editing` with unsaved changes.
- Server responses update `id` fields and timestamps, transitioning to `saved`.
