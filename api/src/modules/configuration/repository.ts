import { HealthStatus } from '@prisma/client';
import { connectionManager } from '../../db';

export async function upsertConnectionProfile(input: {
  environment: string;
  host: string;
  port: number;
  schema: string;
  credentialRef: string;
  rotationIntervalHours: number;
}) {
  return connectionManager.prisma.databaseConnectionProfile.upsert({
    where: { environment: input.environment },
    create: input,
    update: input
  });
}

export async function recordHealthEvent(input: {
  environment: string;
  status: HealthStatus;
  latencyMs?: number | null;
  errorCode?: string | null;
  lastFailureAt?: Date | null;
}) {
  const profile = await connectionManager.prisma.databaseConnectionProfile.findUnique({
    where: { environment: input.environment }
  });

  if (!profile) {
    await upsertConnectionProfile({
      environment: input.environment,
      host: 'unknown',
      port: 0,
      schema: 'unknown',
      credentialRef: 'unknown',
      rotationIntervalHours: 0
    });
  }

  return connectionManager.prisma.connectionHealthEvent.create({
    data: {
      environment: input.environment,
      status: input.status,
      latencyMs: input.latencyMs ?? null,
      errorCode: input.errorCode ?? null,
      lastFailureAt: input.lastFailureAt ?? null,
      connection: {
        connect: { environment: input.environment }
      }
    }
  });
}

export async function listHealthEvents(environment: string, limit = 20) {
  return connectionManager.prisma.connectionHealthEvent.findMany({
    where: { environment },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}
