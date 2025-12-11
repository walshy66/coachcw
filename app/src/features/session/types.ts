export type ExerciseEntry = {
  id: string;
  sectionId?: string | null;
  sessionId?: string | null;
  name: string;
  pace?: string | null;
  sets?: number | null;
  reps?: number | number[] | null;
  load?: number | number[] | null;
  durationSeconds?: number | null;
  restSeconds?: number | null;
  repsPerSet?: number[] | null;
  loadPerSet?: number[] | null;
  order: number;
  notes?: string | null;
};

export type ExerciseSection = {
  id: string;
  name: 'warmup' | 'cardio' | 'weights' | 'cooldown' | 'other';
  order: number;
};

export type SessionDraft = {
  id?: string;
  name?: string | null;
  sessionCode?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  location?: string | null;
  intensity?: string | null;
  trainer?: string | null;
  athlete?: string | null;
  participants?: string[] | null;
  microCycleId?: string | null;
  notes?: string | null;
  sections?: ExerciseSection[] | null;
  exercises: ExerciseEntry[];
};

export type Session = SessionDraft & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type ExerciseValidationErrors = {
  name?: string;
  metrics?: string;
  order?: string;
};

export type SessionValidationErrors = {
  date?: string;
  time?: string;
  exercises?: string;
  exerciseErrors?: Record<string, ExerciseValidationErrors>;
};
