import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildServer } from '../../src/server';
import * as profileService from '../../src/modules/profiles/service';

describe('GET /api/v1/profiles/:athleteId', () => {
  const profileMock = {
    athleteId: 'athlete-001',
    fullName: 'Taylor Coach',
    status: 'active',
    updatedAt: new Date().toISOString()
  };

  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  it('returns the profile for the requested athlete', async () => {
    vi.spyOn(profileService, 'getProfile').mockResolvedValue(profileMock as profileService.ProfileDto);
    const response = await request(app.server).get('/api/v1/profiles/me').set('x-actor-id', 'athlete-001');
    expect(response.status).toBe(200);
    expect(response.body.profile).toMatchObject({
      athleteId: 'athlete-001',
      fullName: 'Taylor Coach'
    });
  });

  it('handles missing profile', async () => {
    vi.spyOn(profileService, 'getProfile').mockResolvedValue(null);
    const response = await request(app.server).get('/api/v1/profiles/me').set('x-actor-id', 'athlete-001');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('PROFILE_NOT_FOUND');
  });
});
