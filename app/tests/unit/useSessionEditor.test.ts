import { act, renderHook } from '@testing-library/react';
import { useSessionEditor } from '../../src/features/session/useSessionEditor';
import type { SessionDraft } from '../../src/features/session/types';

describe('useSessionEditor', () => {
  it('adds, reorders, and removes exercises while keeping order intact', () => {
    const { result } = renderHook(() => useSessionEditor());

    act(() => result.current.addExercise());
    act(() => result.current.addExercise());

    expect(result.current.session.exercises).toHaveLength(2);
    expect(result.current.session.exercises[0].order).toBe(1);
    expect(result.current.session.exercises[1].order).toBe(2);

    const firstId = result.current.session.exercises[0].id;
    act(() => result.current.moveExercise(firstId, 'down'));
    expect(result.current.session.exercises[0].order).toBe(1);
    expect(result.current.session.exercises[1].order).toBe(2);
    expect(result.current.session.exercises[1].id).toBe(firstId);

    act(() => result.current.removeExercise(firstId));
    expect(result.current.session.exercises).toHaveLength(1);
    expect(result.current.session.exercises[0].order).toBe(1);
  });

  it('duplicates exercises with new ids and marks dirty state', () => {
    const { result } = renderHook(() => useSessionEditor());
    act(() => result.current.addExercise());
    const exerciseId = result.current.session.exercises[0].id;

    expect(result.current.isDirty).toBe(true);

    act(() => result.current.duplicateExercise(exerciseId));
    expect(result.current.session.exercises).toHaveLength(2);
    expect(result.current.session.exercises[1].id).not.toBe(exerciseId);
  });

  it('resets and clears dirty flag after saving', () => {
    const initial: SessionDraft = {
      date: '2025-01-01',
      exercises: [{ id: 'temp-1', name: 'Row', sets: 3, reps: 10, order: 1 }],
      notes: 'Initial',
    };
    const { result } = renderHook(() => useSessionEditor(initial));

    expect(result.current.isDirty).toBe(false);
    act(() => result.current.updateField('notes', 'Changed'));
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.markSaved({ ...initial, notes: 'Changed' }));
    expect(result.current.isDirty).toBe(false);
  });
});

