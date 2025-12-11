import { getWeekBounds } from './date';
import type { SessionEntry, WeekView } from './types';
import { mockWeek } from './mockData';

const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? '';
const API_BASE = RAW_API_BASE.endsWith('/') ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE;
const API_ROOT = API_BASE ? `${API_BASE}/api/v1` : '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const ACTOR_ID = import.meta.env.VITE_ATHLETE_ID ?? 'athlete-001';

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

function mapSession(entry: any): SessionEntry {
  const scheduledAt = entry.scheduledAt ?? entry.date ?? new Date().toISOString();
  const normalizedStatus = (entry.status ?? 'planned').toLowerCase();
  return {
    id: entry.id ?? randomId(),
    date: scheduledAt.slice(0, 10),
    startTime: scheduledAt,
    title: entry.focus ?? entry.title ?? 'Training session',
    status: (normalizedStatus === 'complete' ? 'completed' : normalizedStatus) as SessionEntry['status'],
    durationMinutes: entry.durationMin ?? entry.durationMinutes ?? undefined,
    modality: entry.modality ?? undefined,
    location: entry.location ?? undefined,
    coachNotes: entry.notes ?? undefined,
    lastUpdated: entry.updatedAt ?? scheduledAt
  };
}

export async function fetchWeekSchedule(clientId: string, baseDate: Date, timeZone: string): Promise<WeekView> {
  const { startDate, endDate, today, timezone } = getWeekBounds(baseDate, timeZone);

  if (USE_MOCKS || !API_ROOT) {
    return mockWeek;
  }

  const params = new URLSearchParams({
    start: startDate,
    end: endDate,
    limit: '100'
  });

  const actor = clientId === 'me' ? ACTOR_ID : clientId;

  try {
    const res = await fetch(`${API_ROOT}/sessions?${params.toString()}`, {
      headers: { 'x-actor-id': actor }
    });
    if (!res.ok) {
      throw new Error(`Failed to load schedule (${res.status})`);
    }
    const data = await res.json();
    return {
      startDate,
      endDate,
      timezone,
      today,
      sessions: (data.sessions ?? []).map(mapSession)
    };
  } catch (err) {
    console.warn('Schedule fetch failed, falling back to mock data', err);
    return mockWeek;
  }
}
