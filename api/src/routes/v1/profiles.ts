import { FastifyInstance } from 'fastify';
import { errors } from '../../services/errors';
import { getProfile } from '../../modules/profiles/service';

export default async function profilesRoutes(app: FastifyInstance) {
  app.get<{ Params: { athleteId: string } }>('/profiles/:athleteId', {
    schema: {
      tags: ['profiles'],
      response: {
        200: {
          type: 'object',
          properties: {
            profile: { type: 'object' }
          }
        }
      }
    }
  }, async (request) => {
    const athleteId = request.params.athleteId === 'me' ? request.actorId : request.params.athleteId;
    const profile = await getProfile(athleteId);
    if (!profile) {
      throw errors.notFound('PROFILE_NOT_FOUND', 'Profile not found');
    }
    return { profile };
  });
}
