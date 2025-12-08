import type { MetricSnapshot, SessionEntry, WeekView } from './types';
import { getWeekBounds } from './date';

const now = new Date();
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const bounds = getWeekBounds(now, tz);

const baseSessions: SessionEntry[] = [
  {
    id: 'sess-1',
    date: bounds.startDate,
    startTime: '07:30:00',
    title: 'Intervals',
    status: 'planned',
    durationMinutes: 50,
    modality: 'run',
    coachNotes: '3x8min tempo, 2min jog',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sess-2',
    date: bounds.startDate,
    startTime: '17:30:00',
    title: 'Mobility',
    status: 'completed',
    durationMinutes: 20,
    modality: 'mobility',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sess-3',
    date: bounds.today,
    startTime: '06:45:00',
    title: 'Endurance',
    status: 'missed',
    durationMinutes: 60,
    modality: 'bike',
    coachNotes: 'Keep easy. Hydrate.',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sess-4',
    date: bounds.endDate,
    startTime: '09:00:00',
    title: 'Strength',
    status: 'planned',
    durationMinutes: 45,
    modality: 'strength',
    lastUpdated: new Date().toISOString(),
  },
];

export const mockWeek: WeekView = {
  ...bounds,
  sessions: baseSessions,
};

export const mockMetrics: MetricSnapshot = {
  rangeLabel: 'Last 4 weeks',
  completionRate: 0.82,
  volume: 430,
  unit: 'minutes',
  samples: [
    { weekStart: bounds.startDate, sessionsScheduled: 4, sessionsCompleted: 3, volume: 410, unit: 'minutes' },
    { weekStart: bounds.startDate, sessionsScheduled: 5, sessionsCompleted: 4, volume: 460, unit: 'minutes' },
    { weekStart: bounds.startDate, sessionsScheduled: 4, sessionsCompleted: 4, volume: 420, unit: 'minutes' },
    { weekStart: bounds.startDate, sessionsScheduled: 3, sessionsCompleted: 2, volume: 330, unit: 'minutes' },
  ],
  hasData: true,
};
