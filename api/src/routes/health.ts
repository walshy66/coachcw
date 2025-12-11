import { FastifyInstance } from 'fastify';
import { getDatabaseHealth, getReadiness } from '../modules/health/service';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/db', async () => {
    const state = await getDatabaseHealth();
    return { database: state };
  });

  app.get('/ready', async () => {
    const state = getReadiness();
    return { service: state };
  });
}
