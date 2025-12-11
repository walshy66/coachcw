import 'dotenv/config';
import { afterAll, beforeAll } from 'vitest';
import { connectionManager } from '../src/db';

process.env.NODE_ENV = 'test';
process.env.DB_ENVIRONMENT = process.env.DB_ENVIRONMENT ?? 'test';

const shouldConnectToDb = process.env.RUN_DB_TESTS === 'true';

if (shouldConnectToDb) {
  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/coachcw';
    }
    await connectionManager.connect();
  });

  afterAll(async () => {
    await connectionManager.disconnect('test');
  });
}
