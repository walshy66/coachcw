import { HealthStatus } from '@prisma/client';
import { connectionManager } from '../../db';
import { withDbRetry } from '../../db/retry-policy';
import { recordHealthEvent } from '../configuration/repository';
import { config } from '../../config';

type HealthState = {
  status: 'pass' | 'fail' | 'degraded';
  latencyMs?: number;
  lastFailureAt?: string;
};

let lastFailureAt: string | undefined;

export async function getDatabaseHealth(): Promise<HealthState> {
  const start = Date.now();
  try {
    await withDbRetry(async () => {
      await connectionManager.connect();
      await connectionManager.prisma.$queryRaw`SELECT 1`;
    });

    const latency = Date.now() - start;
    emitMetric({
      name: 'db.health.latency',
      value: latency,
      unit: 'ms',
      dimensions: { status: 'pass' }
    });
    void recordHealthEvent({
      environment: config.database.connectionProfile.environment,
      status: HealthStatus.PASS,
      latencyMs: latency,
      lastFailureAt: lastFailureAt ? new Date(lastFailureAt) : null
    });
    return {
      status: 'pass',
      latencyMs: latency,
      lastFailureAt
    };
  } catch (error) {
    lastFailureAt = new Date().toISOString();
    emitMetric({
      name: 'db.health.latency',
      value: Date.now() - start,
      unit: 'ms',
      dimensions: { status: 'fail' }
    });
    void recordHealthEvent({
      environment: config.database.connectionProfile.environment,
      status: HealthStatus.FAIL,
      latencyMs: Date.now() - start,
      errorCode: (error as Error).message,
      lastFailureAt: new Date(lastFailureAt)
    });
    return {
      status: 'fail',
      lastFailureAt,
      latencyMs: Date.now() - start
    };
  }
}

export function getReadiness(): HealthState {
  const connected = connectionManager.getState() === 'active';
  return {
    status: connected ? 'pass' : 'degraded',
    lastFailureAt
  };
}
