import type { MetricSnapshot, MetricSample } from './types';
import { mockMetrics } from './mockData';

const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? '';
const API_BASE = RAW_API_BASE.endsWith('/') ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE;
const API_ROOT = API_BASE ? `${API_BASE}/api/v1` : '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const ACTOR_ID = import.meta.env.VITE_ATHLETE_ID ?? 'athlete-001';

function startOfWeek(dateIso: string) {
  const d = new Date(dateIso);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

function computeSamples(sessions: any[], weeks: number): MetricSample[] {
  const grouped = new Map<string, { scheduled: number; completed: number }>();
  sessions.forEach((session) => {
    const key = startOfWeek(session.scheduledAt ?? session.date ?? new Date().toISOString());
    const bucket = grouped.get(key) ?? { scheduled: 0, completed: 0 };
    bucket.scheduled += 1;
    const status = String(session.status ?? '').toUpperCase();
    if (status === 'COMPLETE' || status === 'COMPLETED') {
      bucket.completed += 1;
    }
    grouped.set(key, bucket);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-weeks)
    .map(([weekStart, counts]) => ({
      id: weekStart,
      label: weekStart,
      sessionsPlanned: counts.scheduled,
      sessionsCompleted: counts.completed,
      volume: counts.completed,
      unit: 'sessions'
    }));
}

export async function fetchCompletionMetrics(clientId: string, weeks = 4): Promise<MetricSnapshot> {
  if (USE_MOCKS || !API_ROOT) {
    return mockMetrics;
  }

  const params = new URLSearchParams({
    limit: String(weeks * 7)
  });
  const actor = clientId === 'me' ? ACTOR_ID : clientId;

  try {
    const res = await fetch(`${API_ROOT}/sessions?${params.toString()}`, {
      headers: { 'x-actor-id': actor }
    });
    if (!res.ok) {
      throw new Error(`Failed to load metrics (${res.status})`);
    }
    const data = await res.json();
    const sessions = data.sessions ?? [];
    const completed = sessions.filter((session: any) => {
      const status = String(session.status ?? '').toUpperCase();
      return status === 'COMPLETE' || status === 'COMPLETED';
    });
    const samples = computeSamples(sessions, weeks);

    return {
      rangeLabel: `Last ${weeks} weeks`,
      completionRate: sessions.length ? completed.length / sessions.length : 0,
      volume: completed.length,
      unit: 'sessions',
      samples,
      hasData: Boolean(sessions.length)
    };
  } catch (err) {
    console.warn('Metrics fetch failed, falling back to mock data', err);
    return mockMetrics;
  }
}
