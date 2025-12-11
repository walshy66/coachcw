import type { SessionStatus, TrainingSession } from '@prisma/client';
import { connectionManager, withDbRetry } from '../../db';
import { errors } from '../../services/errors';
import { createSession, findSessionById, listSessions, updateSession, type SessionFilter } from './repository';

export type SessionDto = {
  id: string;
  athleteId: string;
  programId: string;
  microCycleId?: string | null;
  scheduledAt: string;
  durationMin: number;
  focus?: string | null;
  status: string;
  notes?: string | null;
  metrics?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

function toSessionDto(session: TrainingSession): SessionDto {
  return {
    id: session.id,
    athleteId: session.athleteId,
    programId: session.programId,
    microCycleId: session.microCycleId,
    scheduledAt: session.scheduledAt.toISOString(),
    durationMin: session.durationMin,
    focus: session.focus ?? null,
    status: session.status,
    notes: session.notes ?? null,
    metrics: (session.metrics as Record<string, unknown>) ?? null,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString()
  };
}

export async function getSessions(athleteId: string, filter: SessionFilter = {}) {
  const sessions = await listSessions(athleteId, filter);
  return sessions.map(toSessionDto);
}

export async function getSessionById(athleteId: string, sessionId: string) {
  const session = await findSessionById(sessionId);
  if (!session || session.athleteId !== athleteId) {
    throw errors.notFound('SESSION_NOT_FOUND', 'Session was not found');
  }
  return toSessionDto(session);
}

export type ScheduleSessionPayload = {
  programId: string;
  microCycleId?: string;
  scheduledAt: string;
  durationMin: number;
  focus?: string;
  notes?: string;
};

export async function scheduleSession(athleteId: string, payload: ScheduleSessionPayload): Promise<SessionDto> {
  const scheduledAt = new Date(payload.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw errors.badRequest('INVALID_DATE', 'scheduledAt must be a valid ISO date');
  }

  const program = await connectionManager.prisma.trainingProgram.findUnique({
    where: { id: payload.programId }
  });

  if (!program || program.athleteId !== athleteId) {
    throw errors.notFound('PROGRAM_NOT_FOUND', 'Program not found for athlete');
  }

  const session = await withDbRetry(() =>
    createSession({
      athleteId,
      programId: payload.programId,
      microCycleId: payload.microCycleId,
      scheduledAt,
      durationMin: payload.durationMin,
      focus: payload.focus,
      notes: payload.notes
    })
  );

  return toSessionDto(session);
}

export type UpdateSessionPayload = {
  status?: SessionStatus;
  notes?: string | null;
  durationMin?: number;
};

export async function updateSessionForAthlete(athleteId: string, sessionId: string, payload: UpdateSessionPayload): Promise<SessionDto> {
  const existing = await findSessionById(sessionId);
  if (!existing || existing.athleteId !== athleteId) {
    throw errors.notFound('SESSION_NOT_FOUND', 'Session was not found');
  }

  const session = await withDbRetry(() =>
    updateSession({
      sessionId,
      status: payload.status,
      notes: payload.notes,
      durationMin: payload.durationMin
    })
  );

  return toSessionDto(session);
}
