export type ExerciseEntry = {
  id: string;
  sessionId?: string | null;
  name: string;
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

export type SessionDraft = {
  id?: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  location?: string | null;
  intensity?: string | null;
  participants?: string[] | null;
  notes?: string | null;
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
