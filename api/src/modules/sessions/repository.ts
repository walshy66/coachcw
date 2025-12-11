import type { SessionStatus, TrainingSession } from '@prisma/client';
import { connectionManager } from '../../db';

export type SessionFilter = {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
};

export async function listSessions(athleteId: string, filter: SessionFilter = {}) {
  const { startDate, endDate, limit = 50 } = filter;
  return connectionManager.prisma.trainingSession.findMany({
    where: {
      athleteId,
      ...(startDate || endDate
        ? {
            scheduledAt: {
              gte: startDate,
              lte: endDate
            }
          }
        : {})
    },
    orderBy: {
      scheduledAt: 'asc'
    },
    take: limit
  });
}

export async function findSessionById(id: string) {
  return connectionManager.prisma.trainingSession.findUnique({
    where: { id }
  });
}

export type CreateSessionInput = {
  programId: string;
  microCycleId?: string | null;
  athleteId: string;
  scheduledAt: Date;
  durationMin: number;
  focus?: string | null;
  notes?: string | null;
};

export async function createSession(input: CreateSessionInput) {
  return connectionManager.prisma.trainingSession.create({
    data: {
      programId: input.programId,
      microCycleId: input.microCycleId ?? null,
      athleteId: input.athleteId,
      scheduledAt: input.scheduledAt,
      durationMin: input.durationMin,
      focus: input.focus,
      notes: input.notes
    }
  });
}

export type UpdateSessionInput = {
  sessionId: string;
  status?: SessionStatus;
  notes?: string | null;
  durationMin?: number;
};

export async function updateSession(input: UpdateSessionInput) {
  return connectionManager.prisma.trainingSession.update({
    where: { id: input.sessionId },
    data: {
      status: input.status,
      notes: input.notes,
      durationMin: input.durationMin
    }
  });
}
