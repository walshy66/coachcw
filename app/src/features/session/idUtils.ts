import type { ExerciseEntry } from './types';

let tempIdCounter = 0;

export function createTempId(prefix = 'temp-ex'): string {
  tempIdCounter += 1;
  return `${prefix}-${Date.now()}-${tempIdCounter}`;
}

export function nextOrder(exercises: ExerciseEntry[]) {
  if (!exercises || exercises.length === 0) return 1;
  return Math.max(...exercises.map((e) => e.order ?? 0)) + 1;
}

export function reorderExercises(exercises: ExerciseEntry[], fromIndex: number, toIndex: number) {
  const list = [...exercises];
  const [moved] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, moved);
  return list.map((exercise, index) => ({ ...exercise, order: index + 1 }));
}

export function duplicateExercise(exercise: ExerciseEntry, order: number): ExerciseEntry {
  return {
    ...exercise,
    id: createTempId('dup'),
    order,
    repsPerSet: exercise.repsPerSet ? [...exercise.repsPerSet] : exercise.reps && Array.isArray(exercise.reps) ? [...exercise.reps] : null,
    loadPerSet: exercise.loadPerSet ? [...exercise.loadPerSet] : exercise.load && Array.isArray(exercise.load) ? [...exercise.load] : null,
  };
}
