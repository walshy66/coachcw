import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { logger } from '../telemetry/logger';

type ConnectionState = 'idle' | 'active' | 'draining';

class ConnectionManager {
  private client: PrismaClient;
  private state: ConnectionState = 'idle';

  constructor() {
    this.client = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url
        }
      },
      log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn']
    });
  }

  get prisma(): PrismaClient {
    return this.client;
  }

  async connect() {
    if (this.state === 'active') {
      return;
    }
    logger.info({ profile: config.database.connectionProfile.environment }, 'Connecting to database');
    await this.client.$connect();
    this.state = 'active';
  }

  async disconnect(reason = 'shutdown') {
    if (this.state === 'idle') {
      return;
    }
    this.state = 'draining';
    logger.warn({ reason }, 'Draining database connections');
    await this.client.$disconnect();
    this.state = 'idle';
  }

  async reload() {
    await this.disconnect('reload');
    await this.connect();
  }

  getState(): ConnectionState {
    return this.state;
  }
}

export const connectionManager = new ConnectionManager();
export type DbClient = PrismaClient;
