import { isAfter } from 'date-fns';
import type { ExerciseEntry, ExerciseValidationErrors, SessionDraft, SessionValidationErrors } from './types';

const METRIC_ERROR = 'Add per-set reps/load or duration to save this exercise';

function hasLoadBasedMetrics(exercise: ExerciseEntry) {
  const sets = exercise.sets ?? 0;
  if (!sets) return false;
  const reps = exercise.repsPerSet ?? (Array.isArray(exercise.reps) ? exercise.reps : exercise.reps ? [exercise.reps] : []);
  const load = exercise.loadPerSet ?? (Array.isArray(exercise.load) ? exercise.load : exercise.load ? [exercise.load] : []);
  if (!reps || reps.length !== sets) return false;
  const repsValid = reps.every((value) => value !== null && value !== undefined);
  const loadValid = load.length === 0 || load.length === sets;
  return repsValid && loadValid;
}

function hasDurationMetric(exercise: ExerciseEntry) {
  return exercise.durationSeconds !== undefined && exercise.durationSeconds !== null;
}

export function isExerciseComplete(exercise: ExerciseEntry) {
  if (!exercise.name || !exercise.name.trim()) return false;
  return hasLoadBasedMetrics(exercise) || hasDurationMetric(exercise);
}

export function validateExercise(exercise: ExerciseEntry): ExerciseValidationErrors {
  const errors: ExerciseValidationErrors = {};
  if (!exercise.name || !exercise.name.trim()) {
    errors.name = 'Exercise name is required';
  }

  const hasMetrics = hasLoadBasedMetrics(exercise) || hasDurationMetric(exercise);
  if (!hasMetrics) {
    errors.metrics = METRIC_ERROR;
  } else {
    if (hasLoadBasedMetrics(exercise)) {
      if (exercise.sets !== undefined && exercise.sets !== null && exercise.sets <= 0) {
        errors.metrics = 'Sets must be greater than 0';
      }
      const reps = exercise.repsPerSet ?? (Array.isArray(exercise.reps) ? exercise.reps : exercise.reps ? [exercise.reps] : []);
      const load = exercise.loadPerSet ?? (Array.isArray(exercise.load) ? exercise.load : exercise.load ? [exercise.load] : []);
      reps?.forEach((value) => {
        if (value === null || value === undefined || value <= 0) {
          errors.metrics = 'Reps must be greater than 0';
        }
      });
      load?.forEach((value) => {
        if (value !== null && value !== undefined && value < 0) {
          errors.metrics = 'Load cannot be negative';
        }
      });
    }
    if (hasDurationMetric(exercise) && exercise.durationSeconds !== null && exercise.durationSeconds !== undefined) {
      if (exercise.durationSeconds <= 0) {
        errors.metrics = 'Duration must be greater than 0 seconds';
      }
    }
  }

  if (exercise.order === undefined || exercise.order === null) {
    errors.order = 'Order required';
  }

  return errors;
}

export function validateSession(session: SessionDraft): SessionValidationErrors {
  const errors: SessionValidationErrors = {};

  const exerciseErrors: Record<string, ExerciseValidationErrors> = {};
  const exercises = session.exercises ?? [];

  exercises.forEach((exercise) => {
    const result = validateExercise(exercise);
    if (result.name || result.metrics || result.order) {
      exerciseErrors[exercise.id] = result;
    }
  });

  if (Object.keys(exerciseErrors).length > 0) {
    errors.exerciseErrors = exerciseErrors;
  }

  if (exercises.length === 0) {
    errors.exercises = 'Add at least one exercise';
  } else {
    const hasComplete = exercises.some((exercise) => isExerciseComplete(exercise));
    if (!hasComplete) {
      errors.exercises = 'Add sets/reps or duration to at least one exercise';
    }
  }

  return errors;
}

export function isSessionValid(errors: SessionValidationErrors) {
  return !errors.exercises && !errors.exerciseErrors;
}
