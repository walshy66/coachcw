import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildServer } from '../../src/server';
import * as healthService from '../../src/modules/health/service';

describe('Health routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  it('reports database health', async () => {
    vi.spyOn(healthService, 'getDatabaseHealth').mockResolvedValue({
      status: 'pass',
      latencyMs: 20
    });

    const res = await request(app.server).get('/health/db');
    expect(res.status).toBe(200);
    expect(res.body.database.status).toBe('pass');
  });

  it('reports readiness', async () => {
    vi.spyOn(healthService, 'getReadiness').mockReturnValue({
      status: 'pass'
    });

    const res = await request(app.server).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.service.status).toBe('pass');
  });
});
