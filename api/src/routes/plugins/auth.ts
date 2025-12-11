import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    actorId: string;
  }
}

const HEADER_KEY = 'x-actor-id';

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('actorId', null);

  fastify.addHook('preHandler', async (request, reply) => {
    const actorHeader = request.headers[HEADER_KEY] as string | undefined;
    const fallback = process.env.DEFAULT_ATHLETE_ID ?? 'athlete-001';
    const actorId = actorHeader ?? fallback;

    if (!actorId) {
      reply.status(401).send({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Actor is required',
          correlationId: request.id
        }
      });
      return;
    }

    request.actorId = actorId;
  });
}

export default fp(authPlugin, {
  name: 'header-auth-plugin'
});
