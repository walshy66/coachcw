import { ProgramStatus } from '@prisma/client';
import { connectionManager } from '../../db';

export async function findActiveProgram(athleteId: string) {
  return connectionManager.prisma.trainingProgram.findFirst({
    where: {
      athleteId,
      OR: [{ status: ProgramStatus.ACTIVE }, { status: ProgramStatus.PLANNED }]
    },
    include: {
      phases: {
        orderBy: { order: 'asc' },
        include: {
          microCycles: {
            orderBy: { week: 'asc' }
          }
        }
      },
      sessions: {
        orderBy: { scheduledAt: 'asc' },
        take: 50
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
}
