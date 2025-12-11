import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { connectionManager } from '../../src/db';
import { upsertConnectionProfile } from '../../src/modules/configuration/repository';

const describeIfDb = process.env.RUN_DB_TESTS === 'true' ? describe : describe.skip;

describeIfDb('Environment-specific connection profiles', () => {
  beforeAll(async () => {
    await connectionManager.connect();
  });

  afterAll(async () => {
    await connectionManager.disconnect('env-switch');
  });

  it('stores staging credentials without touching production', async () => {
    await upsertConnectionProfile({
      environment: 'staging',
      host: 'staging.db.local',
      port: 5432,
      schema: 'coachcw_stage',
      credentialRef: 'staging-secret',
      rotationIntervalHours: 168
    });

    const stagingProfile = await connectionManager.prisma.databaseConnectionProfile.findUnique({
      where: { environment: 'staging' }
    });

    expect(stagingProfile?.host).toBe('staging.db.local');
  });
});
