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
