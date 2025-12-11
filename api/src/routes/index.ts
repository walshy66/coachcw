import { FastifyInstance } from 'fastify';
import authPlugin from './plugins/auth';
import errorPlugin from './plugins/errors';
import healthRoutes from './health';
import v1Routes from './v1';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(errorPlugin);
  await app.register(authPlugin);
  await app.register(v1Routes, { prefix: '/api/v1' });
  await app.register(healthRoutes, { prefix: '/health' });
}
