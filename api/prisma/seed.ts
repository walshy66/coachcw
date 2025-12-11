import { fileURLToPath } from 'node:url';
import { PrismaClient, ProgramStatus, SessionStatus, HealthStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  const athlete = await prisma.athleteProfile.upsert({
    where: { athleteId: 'athlete-001' },
    create: {
      athleteId: 'athlete-001',
      firstName: 'Taylor',
      lastName: 'Coach',
      email: 'taylor@example.com',
      timezone: 'America/Chicago',
      avatarUrl: 'https://example.com/avatar.png'
    },
    update: {
      firstName: 'Taylor',
      lastName: 'Coach',
      timezone: 'America/Chicago'
    }
  });

  const program = await prisma.trainingProgram.upsert({
    where: { id: 'program-001' },
    create: {
      id: 'program-001',
      athleteId: athlete.athleteId,
      title: 'Winter Build',
      status: ProgramStatus.ACTIVE,
      description: 'In-season maintenance with aerobic priority',
      startDate: new Date(),
      validationFlag: true
    },
    update: {
      status: ProgramStatus.ACTIVE,
      updatedAt: new Date()
    }
  });

  const basePhase = await prisma.programPhase.upsert({
    where: { id: 'phase-001' },
    create: {
      id: 'phase-001',
      programId: program.id,
      name: 'Base',
      order: 1,
      focus: 'Aerobic development'
    },
    update: {
      focus: 'Aerobic development'
    }
  });

  const cycle = await prisma.microCycle.upsert({
    where: { id: 'cycle-001' },
    create: {
      id: 'cycle-001',
      phaseId: basePhase.id,
      week: 1,
      theme: 'Volume introduction',
      load: 'Medium'
    },
    update: {
      load: 'Medium'
    }
  });

  const sessionDate = new Date();

  await prisma.trainingSession.upsert({
    where: { id: 'session-001' },
    create: {
      id: 'session-001',
      programId: program.id,
      microCycleId: cycle.id,
      athleteId: athlete.athleteId,
      scheduledAt: sessionDate,
      durationMin: 75,
      focus: 'Endurance ride',
      status: SessionStatus.PLANNED,
      notes: 'Zone 2 focus'
    },
    update: {
      scheduledAt: sessionDate,
      status: SessionStatus.PLANNED
    }
  });

  await prisma.databaseConnectionProfile.upsert({
    where: { environment: 'development' },
    create: {
      environment: 'development',
      host: 'localhost',
      port: 5432,
      schema: 'public',
      credentialRef: 'local-dev',
      rotationIntervalHours: 720
    },
    update: {
      credentialRef: 'local-dev'
    }
  });

  await prisma.connectionHealthEvent.create({
    data: {
      environment: 'development',
      status: HealthStatus.PASS,
      latencyMs: 12,
      connection: {
        connect: { environment: 'development' }
      }
    }
  });

  await prisma.$disconnect();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .catch((error) => {
      console.error('Seed failed', error);
      process.exitCode = 1;
    });
}
