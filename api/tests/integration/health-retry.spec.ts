import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { connectionManager } from '../../src/db';
import { getDatabaseHealth } from '../../src/modules/health/service';

const describeIfDb = process.env.RUN_DB_TESTS === 'true' ? describe : describe.skip;

describeIfDb('Health retry + recovery', () => {
  beforeAll(async () => {
    await connectionManager.connect();
  });

  afterAll(async () => {
    await connectionManager.disconnect('health-retry');
  });

  it('recovers after transient failure', async () => {
    let callCount = 0;
    const spy = vi.spyOn(connectionManager.prisma, '$queryRaw').mockImplementation(async () => {
      callCount += 1;
      if (callCount === 1) {
        throw new Error('transient');
      }
      return [{ ok: 1 }];
    });

    const health = await getDatabaseHealth();
    expect(health.status).toBe('pass');
    expect(callCount).toBeGreaterThan(1);

    spy.mockRestore();
  });
});
