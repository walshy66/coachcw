import { FastifyInstance } from 'fastify';
import { SessionStatus } from '@prisma/client';
import { getSessionById, getSessions, scheduleSession, updateSessionForAthlete } from '../../modules/sessions/service';

const statusValues = Object.values(SessionStatus);

export default async function sessionsRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { start?: string; end?: string; limit?: string };
  }>('/sessions', {
    schema: {
      tags: ['sessions']
    }
  }, async (request) => {
    const { start, end, limit } = request.query;
    const filter = {
      startDate: start ? new Date(start) : undefined,
      endDate: end ? new Date(end) : undefined,
      limit: limit ? Number(limit) : undefined
    };

    const sessions = await getSessions(request.actorId, filter);
    return { sessions };
  });

  app.get<{
    Params: { sessionId: string };
  }>('/sessions/:sessionId', {
    schema: {
      tags: ['sessions']
    }
  }, async (request) => {
    const session = await getSessionById(request.actorId, request.params.sessionId);
    return { session };
  });

  app.post<{
    Body: {
      programId: string;
      microCycleId?: string;
      scheduledAt: string;
      durationMin: number;
      focus?: string;
      notes?: string;
    };
  }>('/sessions', {
    schema: {
      tags: ['sessions'],
      body: {
        type: 'object',
        required: ['programId', 'scheduledAt', 'durationMin'],
        properties: {
          programId: { type: 'string' },
          microCycleId: { type: 'string' },
          scheduledAt: { type: 'string', format: 'date-time' },
          durationMin: { type: 'number' },
          focus: { type: 'string' },
          notes: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const session = await scheduleSession(request.actorId, request.body);
    reply.code(201);
    return { session };
  });

  app.patch<{
    Params: { sessionId: string };
    Body: {
      status?: SessionStatus;
      notes?: string;
      durationMin?: number;
    };
  }>('/sessions/:sessionId', {
    schema: {
      tags: ['sessions'],
      params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: statusValues },
          notes: { type: 'string' },
          durationMin: { type: 'number' }
        }
      }
    }
  }, async (request) => {
    const payload = {
      ...request.body,
      status: request.body.status
    };
    const session = await updateSessionForAthlete(request.actorId, request.params.sessionId, payload);
    return { session };
  });
}
