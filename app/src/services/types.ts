export type SessionStatus = 'planned' | 'completed' | 'missed' | 'changed';

export interface SessionEntry {
  id: string;
  date: string; // YYYY-MM-DD in client local date
  startTime: string; // time with offset
  title: string;
  status: SessionStatus;
  durationMinutes?: number;
  modality?: string;
  location?: string;
  coachNotes?: string;
  lastUpdated: string;
}

export interface WeekView {
  startDate: string; // Monday
  endDate: string; // Sunday
  timezone: string;
  today: string;
  sessions: SessionEntry[];
}

export interface MetricSample {
  weekStart: string; // Monday date
  sessionsScheduled: number;
  sessionsCompleted: number;
  volume?: number;
  unit?: string;
}

export interface MetricSnapshot {
  rangeLabel: string;
  completionRate?: number;
  volume?: number;
  unit?: string;
  samples: MetricSample[];
  hasData: boolean;
}

export interface NavigationTarget {
  id: 'program' | 'sessions' | 'messages' | 'reports';
  label: string;
  url: string;
  badge?: string;
}

export type SubscriptionStatus = 'active' | 'on_hold' | 'canceled';

export type MicroCycleStatus = 'current' | 'upcoming' | 'done';

export interface ProgramProgressSample {
  id: string;
  label: string;
  sessionsPlanned: number;
  sessionsCompleted: number;
  volume?: number;
  unit?: string;
}

export interface ProgramPhase {
  id: string;
  name: string;
  focus: string;
  startDate: string;
  endDate: string;
  completedWeeks: number;
  totalWeeks: number;
}

export interface MicroCycleSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  focus: string;
  sessionsPlanned: number;
  sessionsCompleted: number;
  readinessScore: number; // 0-1 range
  status: MicroCycleStatus;
}

export interface ProgramSnapshot {
  programName: string;
  goal: string;
  targetEvent?: string;
  startDate: string;
  endDate: string;
  totalWeeks: number;
  completedWeeks: number;
  adherenceRate: number; // 0-1 range
  overallProgress: number; // 0-1 range
  phases: ProgramPhase[];
  currentPhaseId?: string;
  microCycles: MicroCycleSummary[];
  currentMicroCycleId?: string;
  nextSession?: SessionEntry;
  progressSamples: ProgramProgressSample[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  dateOfBirth?: string | null;
  role: string;
  location?: string;
  avatarUrl?: string | null;
  avatarInitials?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planName: string;
  status: SubscriptionStatus;
  memberSince: string;
  renewalDate?: string | null;
  sessionsPerPeriod?: number;
  period?: 'month' | 'year';
  autoRenew: boolean;
  addOns?: string[];
}

export type PageKey = 'landing' | 'profile' | 'program';
