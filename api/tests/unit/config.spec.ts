import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

describe('configuration loader', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('throws when DATABASE_URL is missing', async () => {
    const env = { ...originalEnv };
    delete env.DATABASE_URL;
    process.env = env;

    await expect(import('../../src/config/index')).rejects.toThrow(/Invalid configuration/);
  });

  it('loads when env vars are set', async () => {
    process.env.DATABASE_URL = originalEnv.DATABASE_URL ?? 'postgresql://localhost:5432/coachcw';
    const { loadConfig } = await import('../../src/config/index');
    const cfg = loadConfig();
    expect(cfg.database.url).toContain('postgresql://');
    expect(cfg.database.connectionProfile.environment).toBeDefined();
  });
});
