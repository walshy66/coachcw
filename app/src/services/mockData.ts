import type {
  MetricSnapshot,
  MicroCycleSummary,
  ProgramPhase,
  ProgramSnapshot,
  SessionEntry,
  Subscription,
  UserProfile,
  WeekView,
} from './types';
import { getWeekBounds } from './date';

const now = new Date();
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const bounds = getWeekBounds(now, tz);

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

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

export const mockUserProfile: UserProfile = {
  id: 'user-1',
  fullName: 'Jordan Rivers',
  username: 'jrivers',
  email: 'jordan.rivers@example.com',
  dateOfBirth: '1990-04-12',
  role: 'Client',
  location: 'Seattle, WA',
  avatarUrl: '',
  avatarInitials: 'JR',
};

export const mockSubscription: Subscription = {
  id: 'sub-1',
  userId: mockUserProfile.id,
  planName: 'Performance Plus',
  status: 'active',
  memberSince: '2023-01-05',
  renewalDate: '2025-02-15',
  sessionsPerPeriod: 8,
  period: 'month',
  autoRenew: true,
  addOns: ['1:1 Coaching', 'Nutrition check-ins'],
};

export const mockOnHoldSubscription: Subscription = {
  ...mockSubscription,
  id: 'sub-2',
  status: 'on_hold',
  renewalDate: null,
  autoRenew: false,
};

export const mockCanceledSubscription: Subscription = {
  ...mockSubscription,
  id: 'sub-3',
  status: 'canceled',
  renewalDate: null,
  sessionsPerPeriod: 0,
  addOns: [],
};

const phases: ProgramPhase[] = [
  {
    id: 'phase-1',
    name: 'Foundation',
    focus: 'Aerobic base + mobility',
    startDate: addDays(bounds.startDate, -28),
    endDate: addDays(bounds.startDate, -1),
    completedWeeks: 4,
    totalWeeks: 4,
  },
  {
    id: 'phase-2',
    name: 'Build',
    focus: 'Threshold and tempo strength',
    startDate: bounds.startDate,
    endDate: addDays(bounds.startDate, 27),
    completedWeeks: 1,
    totalWeeks: 4,
  },
  {
    id: 'phase-3',
    name: 'Peak',
    focus: 'Sharpen + taper',
    startDate: addDays(bounds.startDate, 28),
    endDate: addDays(bounds.startDate, 42),
    completedWeeks: 0,
    totalWeeks: 2,
  },
];

const microCycles: MicroCycleSummary[] = [
  {
    id: 'mc-4',
    name: 'Week 4 · Aerobic base',
    startDate: addDays(bounds.startDate, -7),
    endDate: addDays(bounds.startDate, -1),
    focus: 'Volume and hill strides',
    sessionsPlanned: 5,
    sessionsCompleted: 4,
    readinessScore: 0.78,
    status: 'done',
  },
  {
    id: 'mc-5',
    name: 'Week 5 · Threshold blend',
    startDate: bounds.startDate,
    endDate: bounds.endDate,
    focus: 'Tempo ladders + long aerobic',
    sessionsPlanned: 5,
    sessionsCompleted: 2,
    readinessScore: 0.86,
    status: 'current',
  },
  {
    id: 'mc-6',
    name: 'Week 6 · Speed changeups',
    startDate: addDays(bounds.startDate, 7),
    endDate: addDays(bounds.startDate, 13),
    focus: 'Fartlek and strides',
    sessionsPlanned: 5,
    sessionsCompleted: 0,
    readinessScore: 0.81,
    status: 'upcoming',
  },
];

export const mockProgram: ProgramSnapshot = {
  programName: 'Half-marathon block',
  goal: 'Break 1:35 at the spring race',
  targetEvent: 'Capital Half',
  startDate: phases[0].startDate,
  endDate: phases[phases.length - 1].endDate,
  totalWeeks: 10,
  completedWeeks: 5,
  adherenceRate: 0.82,
  overallProgress: 0.5,
  phases,
  currentPhaseId: 'phase-2',
  microCycles,
  nextSession: baseSessions.find((s) => s.status !== 'completed') ?? baseSessions[0],
};
