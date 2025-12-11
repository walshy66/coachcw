import { useCallback, useMemo, useState } from 'react';
import { duplicateExercise, nextOrder, reorderExercises, createTempId } from './idUtils';
import type { ExerciseEntry, ExerciseSection, SessionDraft, SessionValidationErrors } from './types';
import { isSessionValid, validateSession } from './validation';

function createSection(order: number, name: ExerciseSection['name'] = 'weights'): ExerciseSection {
  return {
    id: createTempId(),
    name,
    order,
  };
}

function createBlankExercise(order: number, sectionId?: string | null): ExerciseEntry {
  return {
    id: createTempId(),
    sectionId: sectionId ?? null,
    name: '',
    pace: null,
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
}

const emptySession: SessionDraft = {
  name: '',
  sessionCode: null,
  date: '',
  startTime: null,
  endTime: null,
  durationMinutes: null,
  location: null,
  intensity: null,
  trainer: null,
  athlete: null,
  participants: null,
  microCycleId: null,
  notes: '',
  sections: [createSection(1, 'weights')],
  exercises: [],
};

function normalizeExercises(exercises: ExerciseEntry[]): ExerciseEntry[] {
  return [...exercises]
    .map((exercise) => ({ ...exercise }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((exercise, index) => ({ ...exercise, order: index + 1 }));
}

function normalizeSession(session?: SessionDraft): SessionDraft {
  const base = session ?? emptySession;
  const sections = base.sections && base.sections.length > 0 ? base.sections : emptySession.sections!;
  const primarySectionId = sections[0]?.id ?? createSection(1, 'weights').id;
  return {
    ...emptySession,
    ...base,
    trainer: base.trainer ?? null,
    athlete: base.athlete ?? base.participants?.[0] ?? null,
    name: base.name ?? '',
    sessionCode: base.sessionCode ?? base.id ?? null,
    microCycleId: base.microCycleId ?? null,
    participants: base.participants ?? null,
    notes: base.notes ?? '',
    sections: sections.map((section, idx) => ({ ...section, order: section.order ?? idx + 1 })),
    exercises: normalizeExercises(
      (base.exercises && base.exercises.length > 0
        ? base.exercises
        : [{ ...createBlankExercise(1, primarySectionId) }]) ?? [],
    ).map((exercise) => ({
      ...exercise,
      sectionId: exercise.sectionId ?? primarySectionId,
    })),
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
  addExercise: (sectionId?: string | null) => void;
  addSection: () => void;
  updateSection: (id: string, name: ExerciseSection['name']) => void;
  removeSection: (id: string) => void;
  updateExercise: (id: string, changes: Partial<ExerciseEntry>) => void;
  removeExercise: (id: string) => void;
  moveExercise: (id: string, direction: 'up' | 'down') => void;
  reorderExercise: (id: string, targetIndex: number) => void;
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

  const addExercise = useCallback((sectionId?: string | null) => {
    setSession((prev) => {
      const order = nextOrder(prev.exercises);
      const targetSectionId = sectionId ?? prev.sections?.[0]?.id ?? null;
      const next: ExerciseEntry = { ...createBlankExercise(order), sectionId: targetSectionId };
      return { ...prev, exercises: [...(prev.exercises ?? []), next] };
    });
  }, []);

  const addSection = useCallback(() => {
    setSession((prev) => {
      const order = nextOrder(prev.sections ?? []);
      const newSection = createSection(order, 'other');
      const nextExercises = [
        ...(prev.exercises ?? []),
        { ...createBlankExercise(nextOrder(prev.exercises), newSection.id) },
      ];
      return { ...prev, sections: [...(prev.sections ?? []), newSection], exercises: nextExercises };
    });
  }, []);

  const updateSection = useCallback((id: string, name: ExerciseSection['name']) => {
    setSession((prev) => ({
      ...prev,
      sections: (prev.sections ?? []).map((section) => (section.id === id ? { ...section, name } : section)),
    }));
  }, []);

  const removeSection = useCallback((id: string) => {
    setSession((prev) => {
      const sections = prev.sections ?? [];
      if (sections.length <= 1) return prev; // keep at least one section
      const remainingSections = sections.filter((section) => section.id !== id).map((section, idx) => ({
        ...section,
        order: idx + 1,
      }));
      const fallbackSectionId = remainingSections[0]?.id ?? createSection(1, 'weights').id;
      const remainingExercises = (prev.exercises ?? [])
        .filter((exercise) => exercise.sectionId !== id)
        .map((exercise) => ({ ...exercise, sectionId: exercise.sectionId ?? fallbackSectionId }));
      const normalizedExercises = normalizeExercises(
        remainingExercises.length > 0 ? remainingExercises : [{ ...createBlankExercise(1, fallbackSectionId) }],
      );
      return { ...prev, sections: remainingSections, exercises: normalizedExercises };
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

  const reorderExercise = useCallback((id: string, targetIndex: number) => {
    setSession((prev) => {
      const exercises = prev.exercises ?? [];
      const index = exercises.findIndex((exercise) => exercise.id === id);
      if (index < 0 || targetIndex < 0 || targetIndex >= exercises.length) return prev;
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
    addSection,
    updateSection,
    removeSection,
    updateExercise,
    removeExercise,
    moveExercise,
    reorderExercise,
    duplicateExercise: duplicateExerciseEntry,
    updateField,
    reset,
    markSaved,
  };
}
