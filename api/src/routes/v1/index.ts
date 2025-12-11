import { FastifyInstance } from 'fastify';
import profilesRoutes from './profiles';
import programsRoutes from './programs';
import sessionsRoutes from './sessions';

export default async function v1Routes(app: FastifyInstance) {
  await app.register(profilesRoutes);
  await app.register(programsRoutes);
  await app.register(sessionsRoutes);
}
