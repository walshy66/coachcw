import { FastifyInstance } from 'fastify';
import { errors } from '../../services/errors';
import { getCurrentProgram } from '../../modules/programs/service';

export default async function programsRoutes(app: FastifyInstance) {
  app.get<{ Params: { athleteId: string } }>('/programs/:athleteId/current', {
    schema: {
      tags: ['programs'],
      response: {
        200: {
          type: 'object',
          properties: {
            program: { type: 'object' }
          }
        }
      }
    }
  }, async (request) => {
    const athleteId = request.params.athleteId === 'me' ? request.actorId : request.params.athleteId;
    const program = await getCurrentProgram(athleteId);
    if (!program) {
      throw errors.notFound('PROGRAM_NOT_FOUND', 'Active program not found');
    }
    return { program };
  });
}
