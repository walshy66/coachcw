import type { ProgramPhase, MicroCycle, TrainingProgram, TrainingSession } from '@prisma/client';
import { findActiveProgram } from './repository';

export type MicroCycleDto = Pick<MicroCycle, 'id' | 'week' | 'theme' | 'load'> & {
  updatedAt: string;
};

export type ProgramPhaseDto = {
  id: string;
  name: string;
  order: number;
  focus?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  microCycles: MicroCycleDto[];
};

export type ProgramDto = {
  id: string;
  athleteId: string;
  title: string;
  status: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  validationFlag: boolean;
  updatedAt: string;
  phases: ProgramPhaseDto[];
  sessions: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    durationMin: number;
  }>;
};

function toMicroCycleDto(cycle: MicroCycle): MicroCycleDto {
  return {
    id: cycle.id,
    week: cycle.week,
    theme: cycle.theme ?? null,
    load: cycle.load ?? null,
    updatedAt: cycle.updatedAt.toISOString()
  };
}

function toPhaseDto(phase: ProgramPhase & { microCycles: MicroCycle[] }): ProgramPhaseDto {
  return {
    id: phase.id,
    name: phase.name,
    order: phase.order,
    focus: phase.focus,
    startDate: phase.startDate?.toISOString() ?? null,
    endDate: phase.endDate?.toISOString() ?? null,
    microCycles: phase.microCycles.map(toMicroCycleDto)
  };
}

type ProgramRecord = TrainingProgram & {
  phases: (ProgramPhase & { microCycles: MicroCycle[] })[];
  sessions: TrainingSession[];
};

function toProgramDto(program: ProgramRecord): ProgramDto {
  return {
    id: program.id,
    athleteId: program.athleteId,
    title: program.title,
    status: program.status,
    description: program.description,
    startDate: program.startDate?.toISOString() ?? null,
    endDate: program.endDate?.toISOString() ?? null,
    validationFlag: program.validationFlag,
    updatedAt: program.updatedAt.toISOString(),
    phases: program.phases.map(toPhaseDto),
    sessions: program.sessions.map((session) => ({
      id: session.id,
      scheduledAt: session.scheduledAt.toISOString(),
      status: session.status,
      durationMin: session.durationMin
    }))
  };
}

export async function getCurrentProgram(athleteId: string): Promise<ProgramDto | null> {
  const program = await findActiveProgram(athleteId);
  if (!program) {
    return null;
  }
  return toProgramDto(program);
}
