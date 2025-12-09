import { useCallback, useMemo, useState } from 'react';
import { duplicateExercise, nextOrder, reorderExercises, createTempId } from './idUtils';
import type { ExerciseEntry, SessionDraft, SessionValidationErrors } from './types';
import { isSessionValid, validateSession } from './validation';

const emptySession: SessionDraft = {
  date: '',
  startTime: null,
  endTime: null,
  durationMinutes: null,
  location: null,
  intensity: null,
  participants: null,
  notes: '',
  exercises: [],
};

function normalizeExercises(exercises: ExerciseEntry[]): ExerciseEntry[] {
  return [...exercises]
    .map((exercise) => ({ ...exercise }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((exercise, index) => ({ ...exercise, order: index + 1 }));
}

function normalizeSession(session?: SessionDraft): SessionDraft {
  if (!session) return { ...emptySession };
  return {
    ...emptySession,
    ...session,
    participants: session.participants ?? null,
    notes: session.notes ?? '',
    exercises: normalizeExercises(session.exercises ?? []),
  };
}

function serializeForDirtyCheck(session: SessionDraft) {
  return JSON.stringify({
    ...session,
    exercises: normalizeExercises(session.exercises ?? []).map((ex) => ({
      ...ex,
      order: ex.order ?? 0,
    })),
  });
}

export type UseSessionEditorResult = {
  session: SessionDraft;
  errors: SessionValidationErrors;
  isValid: boolean;
  isDirty: boolean;
  addExercise: () => void;
  updateExercise: (id: string, changes: Partial<ExerciseEntry>) => void;
  removeExercise: (id: string) => void;
  moveExercise: (id: string, direction: 'up' | 'down') => void;
  duplicateExercise: (id: string) => void;
  updateField: <K extends keyof SessionDraft>(key: K, value: SessionDraft[K]) => void;
  reset: (session?: SessionDraft) => void;
  markSaved: (session: SessionDraft) => void;
};

export function useSessionEditor(initialSession?: SessionDraft): UseSessionEditorResult {
  const initial = useMemo(() => normalizeSession(initialSession), [initialSession]);
  const [session, setSession] = useState<SessionDraft>(initial);
  const [baseline, setBaseline] = useState<SessionDraft>(initial);

  const errors = useMemo(() => validateSession(session), [session]);
  const isValid = useMemo(() => isSessionValid(errors), [errors]);

  const isDirty = useMemo(() => serializeForDirtyCheck(session) !== serializeForDirtyCheck(baseline), [session, baseline]);

  const addExercise = useCallback(() => {
    setSession((prev) => {
      const order = nextOrder(prev.exercises);
      const next: ExerciseEntry = {
        id: createTempId(),
        name: '',
        sets: null,
        reps: null,
        load: null,
        repsPerSet: [],
        loadPerSet: [],
        durationSeconds: null,
        restSeconds: null,
        order,
        notes: null,
      };
      return { ...prev, exercises: [...(prev.exercises ?? []), next] };
    });
  }, []);

  const updateExercise = useCallback((id: string, changes: Partial<ExerciseEntry>) => {
    setSession((prev) => ({
      ...prev,
      exercises: (prev.exercises ?? []).map((exercise) => (exercise.id === id ? { ...exercise, ...changes } : exercise)),
    }));
  }, []);

  const removeExercise = useCallback((id: string) => {
    setSession((prev) => ({
      ...prev,
      exercises: normalizeExercises((prev.exercises ?? []).filter((exercise) => exercise.id !== id)),
    }));
  }, []);

  const moveExercise = useCallback((id: string, direction: 'up' | 'down') => {
    setSession((prev) => {
      const exercises = prev.exercises ?? [];
      const index = exercises.findIndex((exercise) => exercise.id === id);
      if (index < 0) return prev;
      const targetIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(exercises.length - 1, index + 1);
      if (index === targetIndex) return prev;
      return { ...prev, exercises: reorderExercises(exercises, index, targetIndex) };
    });
  }, []);

  const duplicateExerciseEntry = useCallback((id: string) => {
    setSession((prev) => {
      const exercises = prev.exercises ?? [];
      const existing = exercises.find((exercise) => exercise.id === id);
      if (!existing) return prev;
      const newOrder = nextOrder(exercises);
      const copy = duplicateExercise(existing, newOrder);
      return { ...prev, exercises: [...exercises, copy] };
    });
  }, []);

  const updateField = useCallback(<K extends keyof SessionDraft>(key: K, value: SessionDraft[K]) => {
    setSession((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback((newSession?: SessionDraft) => {
    const normalized = normalizeSession(newSession);
    setSession(normalized);
    setBaseline(normalized);
  }, []);

  const markSaved = useCallback((saved: SessionDraft) => {
    const normalized = normalizeSession(saved);
    setBaseline(normalized);
    setSession(normalized);
  }, []);

  return {
    session,
    errors,
    isValid,
    isDirty,
    addExercise,
    updateExercise,
    removeExercise,
    moveExercise,
    duplicateExercise: duplicateExerciseEntry,
    updateField,
    reset,
    markSaved,
  };
}
