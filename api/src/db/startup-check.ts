import { connectionManager } from './connection-manager';
import { logger } from '../telemetry/logger';

export async function validateDatabaseConnection() {
  const start = Date.now();
  try {
    await connectionManager.connect();
    await connectionManager.prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    logger.info({ latency }, 'Database connectivity validated');
    return latency;
  } catch (error) {
    logger.error({ err: error }, 'Database connectivity failed');
    throw new Error('DATABASE_CONNECTION_FAILED');
  }
}
