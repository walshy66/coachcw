import type { ExerciseEntry, Session, SessionDraft } from '../features/session/types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

function mapExercisePayload(exercise: ExerciseEntry, index: number): ExerciseEntry {
  const repsValue = Array.isArray(exercise.repsPerSet)
    ? exercise.repsPerSet[0] ?? null
    : Array.isArray(exercise.reps)
      ? exercise.reps[0] ?? null
      : exercise.reps ?? null;
  const loadValue = Array.isArray(exercise.loadPerSet)
    ? exercise.loadPerSet[0] ?? null
    : Array.isArray(exercise.load)
      ? exercise.load[0] ?? null
      : exercise.load ?? null;

  return {
    ...exercise,
    order: exercise.order ?? index + 1,
    sets: exercise.sets ?? null,
    reps: repsValue,
    load: loadValue,
    durationSeconds: exercise.durationSeconds ?? null,
    restSeconds: exercise.restSeconds ?? null,
    notes: exercise.notes ?? null,
    sessionId: exercise.sessionId ?? null,
    repsPerSet: exercise.repsPerSet ?? (Array.isArray(exercise.reps) ? exercise.reps : null),
    loadPerSet: exercise.loadPerSet ?? (Array.isArray(exercise.load) ? exercise.load : null),
  };
}

function buildPayload(session: SessionDraft) {
  return {
    date: session.date,
    startTime: session.startTime ?? null,
    endTime: session.endTime ?? null,
    durationMinutes: session.durationMinutes ?? null,
    location: session.location ?? null,
    intensity: session.intensity ?? null,
    trainer: session.trainer ?? null,
    athlete: session.athlete ?? null,
    sections: session.sections ?? null,
    microCycleId: session.microCycleId ?? null,
    participants: session.participants ?? (session.athlete ? [session.athlete] : null),
    notes: session.notes ?? null,
    exercises: (session.exercises ?? []).map(mapExercisePayload),
  };
}

function normalizeMetrics(exercise: ExerciseEntry): ExerciseEntry {
  const sets = exercise.sets ?? 0;
  const repsPerSet =
    exercise.repsPerSet ??
    (Array.isArray(exercise.reps)
      ? exercise.reps
      : exercise.reps !== null && exercise.reps !== undefined && sets
        ? Array.from({ length: sets }).map(() => exercise.reps as number)
        : []);
  const loadPerSet =
    exercise.loadPerSet ??
    (Array.isArray(exercise.load)
      ? exercise.load
      : exercise.load !== null && exercise.load !== undefined && sets
        ? Array.from({ length: sets }).map(() => exercise.load as number)
        : []);

  return {
    ...exercise,
    repsPerSet,
    loadPerSet,
  };
}

function withServerIds(session: SessionDraft, id: string): Session {
  const timestamp = new Date().toISOString();
  return {
    ...session,
    id,
    createdAt: timestamp,
    updatedAt: timestamp,
    sections: session.sections ?? null,
    exercises: (session.exercises ?? []).map((exercise, index) => ({
      ...normalizeMetrics(exercise),
      id: exercise.id.startsWith('temp') || exercise.id.startsWith('dup') ? `ex-${Date.now()}-${index + 1}` : exercise.id,
      order: exercise.order ?? index + 1,
      sessionId: id,
    })),
  };
}

async function handleResponse(res: Response): Promise<Session> {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Session request failed (${res.status})`);
  }
  const data = await res.json();
  return {
    id: data.id ?? '',
    date: data.date ?? '',
    startTime: data.startTime ?? null,
    endTime: data.endTime ?? null,
    durationMinutes: data.durationMinutes ?? null,
    location: data.location ?? null,
    intensity: data.intensity ?? null,
    trainer: data.trainer ?? null,
    athlete: data.athlete ?? data.participants?.[0] ?? null,
    sections: data.sections ?? null,
    microCycleId: data.microCycleId ?? null,
    participants: data.participants ?? null,
    notes: data.notes ?? null,
    exercises: (data.exercises ?? []).map((exercise: ExerciseEntry, index: number) => ({
      ...normalizeMetrics(exercise),
      order: exercise.order ?? index + 1,
    })),
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? '',
  };
}

export async function getSession(id: string): Promise<Session> {
  const url = `${API_BASE}/sessions/${id}`;

  if (USE_MOCKS) {
    return withServerIds(
      {
        id,
        date: new Date().toISOString().slice(0, 10),
        location: 'Mock Gym',
        trainer: 'Mock Trainer',
        athlete: 'Mock Athlete',
        participants: ['Mock Athlete'],
        notes: 'Mock session loaded because mocks are enabled.',
        exercises: [
          { id: 'ex-1', name: 'Mock Squat', sets: 3, reps: 8, load: 100, order: 1 },
          { id: 'ex-2', name: 'Mock Row', sets: 3, reps: 10, load: 60, order: 2 },
        ],
      },
      id,
    );
  }

  try {
    const res = await fetch(url);
    return await handleResponse(res);
  } catch (err) {
    console.warn('Falling back to mock session due to error', err);
    return withServerIds(
      {
        id,
        date: new Date().toISOString().slice(0, 10),
        trainer: null,
        athlete: null,
        notes: 'Fallback session (offline)',
        exercises: [{ id: 'ex-fallback', name: 'Placeholder Exercise', sets: 1, reps: 10, order: 1 }],
      },
      id,
    );
  }
}

export async function createSession(session: SessionDraft): Promise<Session> {
  const url = `${API_BASE}/sessions`;

  if (USE_MOCKS) {
    return withServerIds(session, session.id ?? `session-${Date.now()}`);
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(session)),
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn('Create session failed; returning fallback with mock ids', err);
    return withServerIds(session, session.id ?? `session-${Date.now()}`);
  }
}

export async function updateSession(sessionId: string, session: SessionDraft): Promise<Session> {
  const url = `${API_BASE}/sessions/${sessionId}`;

  if (USE_MOCKS) {
    return withServerIds({ ...session, id: sessionId }, sessionId);
  }

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(session)),
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn('Update session failed; returning fallback with mock ids', err);
    return withServerIds({ ...session, id: sessionId }, sessionId);
  }
}
