import type { ExerciseEntry, Session, SessionDraft } from '../features/session/types';

const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? '';
const API_BASE = RAW_API_BASE.endsWith('/') ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE;
const API_ROOT = API_BASE ? `${API_BASE}/api/v1` : '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const ACTOR_ID = import.meta.env.VITE_ATHLETE_ID ?? 'athlete-001';
let cachedProgramId: string | null = null;

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

type ApiSession = {
  session: {
    id: string;
    athleteId: string;
    programId: string;
    microCycleId?: string | null;
    scheduledAt: string;
    durationMin: number;
    focus?: string | null;
    status: string;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

function mapApiSession(data: ApiSession['session']): Session {
  return {
    id: data.id,
    date: data.scheduledAt.slice(0, 10),
    startTime: data.scheduledAt,
    endTime: null,
    durationMinutes: data.durationMin,
    location: null,
    intensity: data.focus ?? null,
    trainer: null,
    athlete: data.athleteId,
    participants: [data.athleteId],
    microCycleId: data.microCycleId ?? null,
    notes: data.notes ?? null,
    sections: null,
    exercises: [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    sessionCode: data.programId,
    name: data.focus ?? 'Training session'
  };
}

async function handleResponse(res: Response): Promise<Session> {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Session request failed (${res.status})`);
  }
  const body = (await res.json()) as ApiSession;
  return mapApiSession(body.session ?? body);
}

async function resolveProgramId(): Promise<string> {
  if (cachedProgramId) {
    return cachedProgramId;
  }

  if (!API_ROOT) {
    return 'program-default';
  }

  const response = await fetch(`${API_ROOT}/programs/me/current`, {
    headers: { 'x-actor-id': ACTOR_ID }
  });
  if (!response.ok) {
    throw new Error('Program lookup failed');
  }
  const payload = await response.json();
  cachedProgramId = payload?.program?.id ?? 'program-default';
  return cachedProgramId;
}

function buildScheduledAt(date: string, time?: string | null) {
  if (!time) {
    return new Date(`${date}T08:00:00Z`).toISOString();
  }
  return new Date(time.includes('T') ? time : `${date}T${time}`).toISOString();
}

export async function getSession(id: string): Promise<Session> {
  if (USE_MOCKS || !API_ROOT) {
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
    const res = await fetch(`${API_ROOT}/sessions/${id}`, {
      headers: { 'x-actor-id': ACTOR_ID }
    });
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
  if (USE_MOCKS || !API_ROOT) {
    return withServerIds(session, session.id ?? `session-${Date.now()}`);
  }

  try {
    const url = `${API_ROOT}/sessions`;
    const programId = await resolveProgramId();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': ACTOR_ID
      },
      body: JSON.stringify({
        programId,
        microCycleId: session.microCycleId ?? undefined,
        scheduledAt: buildScheduledAt(session.date, session.startTime),
        durationMin: session.durationMinutes ?? 60,
        focus: session.name ?? session.notes ?? 'Session',
        notes: session.notes ?? undefined
      })
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn('Create session failed; returning fallback with mock ids', err);
    return withServerIds(session, session.id ?? `session-${Date.now()}`);
  }
}

export async function updateSession(sessionId: string, session: SessionDraft): Promise<Session> {
  if (USE_MOCKS || !API_ROOT) {
    return withServerIds({ ...session, id: sessionId }, sessionId);
  }

  try {
    const url = `${API_ROOT}/sessions/${sessionId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': ACTOR_ID
      },
      body: JSON.stringify({
        notes: session.notes ?? undefined,
        durationMin: session.durationMinutes ?? undefined
      })
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn('Update session failed; returning fallback with mock ids', err);
    return withServerIds({ ...session, id: sessionId }, sessionId);
  }
}
