import type { MicroCycleSummary, ProgramPhase, ProgramProgressSample, ProgramSnapshot, SessionEntry } from './types';
import { mockProgram } from './mockData';

const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? '';
const API_BASE = RAW_API_BASE.endsWith('/') ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE;
const API_ROOT = API_BASE ? `${API_BASE}/api/v1` : '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const ACTOR_HEADER = import.meta.env.VITE_ATHLETE_ID ?? 'athlete-001';

function diffInWeeks(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round(diffMs / weekMs));
}

function mapPhases(phases: any[] | undefined, fallbackStart: string, fallbackEnd: string): ProgramPhase[] {
  if (!Array.isArray(phases)) {
    return mockProgram.phases;
  }

  return phases.map((phase: any) => ({
    id: phase.id,
    name: phase.name ?? 'Phase',
    focus: phase.focus ?? '',
    startDate: phase.startDate ?? fallbackStart,
    endDate: phase.endDate ?? fallbackEnd,
    completedWeeks: phase.completedWeeks ?? 0,
    totalWeeks: phase.totalWeeks ?? Math.max(1, phase.microCycles?.length ?? 1)
  }));
}

function mapMicroCycles(phases: any[] | undefined): MicroCycleSummary[] {
  if (!Array.isArray(phases)) {
    return mockProgram.microCycles;
  }

  return phases.flatMap((phase: any, index: number) => {
    return (phase.microCycles ?? []).map((cycle: any, idx: number) => ({
      id: cycle.id,
      name: cycle.name ?? `Week ${cycle.week ?? idx + 1}`,
      startDate: cycle.startDate ?? phase.startDate ?? mockProgram.startDate,
      endDate: cycle.endDate ?? phase.endDate ?? mockProgram.endDate,
      focus: cycle.theme ?? phase.focus ?? '',
      sessionsPlanned: cycle.sessionsPlanned ?? 0,
      sessionsCompleted: cycle.sessionsCompleted ?? 0,
      readinessScore: cycle.readinessScore ?? 0.5,
      status: (cycle.status ?? (index === 0 && idx === 0 ? 'current' : 'upcoming')) as MicroCycleSummary['status']
    }));
  });
}

function normalizeStatus(status: string | undefined) {
  const normalized = (status ?? 'planned').toLowerCase();
  if (normalized === 'complete') return 'completed';
  return normalized as SessionEntry['status'];
}

function mapNextSession(sessions: any[] | undefined): SessionEntry | undefined {
  if (!Array.isArray(sessions)) {
    return undefined;
  }

  const upcoming = sessions
    .map((session) => ({
      ...session,
      scheduledAt: new Date(session.scheduledAt)
    }))
    .filter((session) => !Number.isNaN(session.scheduledAt.getTime()))
    .filter((session) => session.scheduledAt >= new Date())
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];

  if (!upcoming) {
    return undefined;
  }

  return {
    id: upcoming.id,
    date: upcoming.scheduledAt.toISOString(),
    startTime: upcoming.scheduledAt.toISOString(),
    title: upcoming.focus ?? 'Scheduled session',
    status: normalizeStatus(upcoming.status),
    lastUpdated: upcoming.updatedAt ?? upcoming.scheduledAt.toISOString()
  };
}

function mapProgressSamples(phases: ProgramPhase[]): ProgramProgressSample[] {
  if (!phases.length) {
    return mockProgram.progressSamples;
  }

  return phases.map((phase) => ({
    id: phase.id,
    label: phase.name,
    sessionsPlanned: phase.totalWeeks * 2,
    sessionsCompleted: phase.completedWeeks * 2,
    volume: phase.completedWeeks * 100,
    unit: 'pts'
  }));
}

function mapProgram(data: any): ProgramSnapshot {
  const payload = data?.program ?? data ?? {};
  const startDate = payload.startDate ?? mockProgram.startDate;
  const endDate = payload.endDate ?? mockProgram.endDate;

  const phases = mapPhases(payload.phases, startDate, endDate);
  const microCycles = mapMicroCycles(payload.phases);
  const totalWeeks = payload.totalWeeks ?? diffInWeeks(startDate, endDate);
  const completedWeeks = payload.completedWeeks ?? phases.reduce((sum, phase) => sum + phase.completedWeeks, 0);
  const adherenceRate = payload.adherenceRate ?? (totalWeeks ? completedWeeks / totalWeeks : mockProgram.adherenceRate);
  const overallProgress = payload.overallProgress ?? adherenceRate;

  return {
    programName: payload.title ?? mockProgram.programName,
    goal: payload.description ?? mockProgram.goal,
    targetEvent: payload.targetEvent ?? mockProgram.targetEvent,
    startDate,
    endDate,
    totalWeeks,
    completedWeeks: Math.min(totalWeeks, completedWeeks),
    adherenceRate,
    overallProgress,
    phases,
    currentPhaseId: payload.currentPhaseId ?? phases[0]?.id,
    microCycles,
    currentMicroCycleId:
      payload.currentMicroCycleId ??
      microCycles.find((cycle) => cycle.status === 'current')?.id ??
      microCycles[0]?.id,
    nextSession: mapNextSession(payload.sessions),
    progressSamples: mapProgressSamples(phases)
  };
}

export async function fetchProgramOverview(clientId: string): Promise<ProgramSnapshot> {
  if (USE_MOCKS || !API_ROOT) {
    return mockProgram;
  }

  const athletePath = clientId === 'me' ? 'me' : clientId;
  const url = `${API_ROOT}/programs/${athletePath}/current`;
  const actorHeader = clientId === 'me' ? ACTOR_HEADER : clientId;

  try {
    const res = await fetch(url, {
      headers: {
        'x-actor-id': actorHeader
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to load program overview (${res.status})`);
    }
    const data = await res.json();
    return mapProgram(data);
  } catch (err) {
    console.warn('Program fetch failed', err);
    throw err instanceof Error ? err : new Error('Program overview unavailable');
  }
}
