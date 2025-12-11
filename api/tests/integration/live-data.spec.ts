import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { seedDatabase } from '../../prisma/seed';
import { buildServer } from '../../src/server';
import { connectionManager } from '../../src/db';

const describeIfDb = process.env.RUN_DB_TESTS === 'true' ? describe : describe.skip;

describeIfDb('Live data integration', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    await seedDatabase();
    await connectionManager.connect();
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
    await connectionManager.disconnect('integration-test');
  });

  it('serves the seeded athlete profile', async () => {
    const res = await request(app.server).get('/api/v1/profiles/me').set('x-actor-id', 'athlete-001');
    expect(res.status).toBe(200);
    expect(res.body.profile.athleteId).toBe('athlete-001');
  });

  it('returns graceful error when DB fails', async () => {
    const spy = vi.spyOn(connectionManager.prisma.athleteProfile, 'findUnique').mockRejectedValueOnce(new Error('db down'));
    const res = await request(app.server).get('/api/v1/profiles/me').set('x-actor-id', 'athlete-001');
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(res.body.error.code).toBe('SERVICE_UNAVAILABLE');
    spy.mockRestore();
  });
});
