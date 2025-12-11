import { fileURLToPath } from 'node:url';
import Fastify, { FastifyInstance } from 'fastify';
import { config } from './config';
import { registerRoutes } from './routes';
import { logger } from './telemetry/logger';
import { connectionManager, validateDatabaseConnection } from './db';

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger
  });

  await registerRoutes(app);
  return app;
}

async function start() {
  const app = await buildServer();
  await validateDatabaseConnection();

  const address = await app.listen({
    host: config.server.host,
    port: config.server.port
  });

  logger.info({ address }, 'API server is running');

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.warn({ signal }, 'Graceful shutdown requested');
    try {
      await app.close();
      await connectionManager.disconnect(signal);
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, 'Graceful shutdown failed');
      process.exit(1);
    }
  };

  ['SIGTERM', 'SIGINT'].forEach((sig) => {
    process.on(sig, () => void shutdown(sig as NodeJS.Signals));
  });
}

const isCLIRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isCLIRun) {
  start().catch((error) => {
    logger.error({ err: error }, 'Server failed to start');
    process.exit(1);
  });
}
