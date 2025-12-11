import type { ProgramSnapshot } from './types';
import { mockProgram } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export async function fetchProgramOverview(clientId: string): Promise<ProgramSnapshot> {
  const url = `${API_BASE}/clients/${clientId}/program`;

  if (USE_MOCKS || !API_BASE) {
    return mockProgram;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load program overview (${res.status})`);
    }
    const data = await res.json();
    return {
      programName: data.programName ?? 'Program overview',
      goal: data.goal ?? '',
      targetEvent: data.targetEvent ?? undefined,
      startDate: data.startDate ?? mockProgram.startDate,
      endDate: data.endDate ?? mockProgram.endDate,
      totalWeeks: data.totalWeeks ?? mockProgram.totalWeeks,
      completedWeeks: data.completedWeeks ?? mockProgram.completedWeeks,
      adherenceRate: data.adherenceRate ?? 0,
      overallProgress: data.overallProgress ?? 0,
      phases: data.phases ?? [],
      currentPhaseId: data.currentPhaseId ?? undefined,
      microCycles: data.microCycles ?? [],
      currentMicroCycleId: data.currentMicroCycleId ?? data.microCycles?.find?.((mc: { status?: string }) => mc.status === 'current')?.id,
      nextSession: data.nextSession ?? undefined,
      progressSamples: data.progressSamples ?? [],
    };
  } catch (err) {
    console.warn('Program fetch failed', err);
    throw err instanceof Error ? err : new Error('Program overview unavailable');
  }
}
