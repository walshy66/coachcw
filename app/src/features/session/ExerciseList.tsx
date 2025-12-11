import React, { useMemo, useState, useEffect, type DragEvent } from 'react';
import type { ExerciseEntry, ExerciseSection } from './types';

type ExerciseListProps = {
  exercises: ExerciseEntry[];
  sections: ExerciseSection[];
  onChange: (id: string, changes: Partial<ExerciseEntry>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onReorder?: (id: string, targetIndex: number) => void;
  onAddSection: () => void;
  onChangeSection: (id: string, name: ExerciseSection['name']) => void;
  onRemoveSection: (id: string) => void;
  onAddExercise: (sectionId?: string | null) => void;
};

const exerciseOptions = [
  'Back Squat',
  'Front Squat',
  'Deadlift',
  'Bench Press',
  'Overhead Press',
  'Pull-up',
  'Bent-over Row',
  'Romanian Deadlift',
  'Lunge',
  'Plank',
  'Tempo Run',
  'Bike Intervals',
  'Row Erg',
  'Assault Bike',
  'Sprint Drills',
  'Jump Rope',
  'Mobility Flow',
];

const sectionOptions: ExerciseSection['name'][] = ['warmup', 'cardio', 'weights', 'cooldown', 'other'];

function ExerciseList({
  exercises,
  sections,
  onChange,
  onRemove,
  onDuplicate,
  onMove,
  onReorder,
  onAddSection,
  onChangeSection,
  onRemoveSection,
  onAddExercise,
}: ExerciseListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [confirmSectionId, setConfirmSectionId] = useState<string | null>(null);
  const [editingChip, setEditingChip] = useState<{ exerciseId: string; index: number } | null>(null);
  const [chipDraft, setChipDraft] = useState<{ rep: string; load: string }>({ rep: '', load: '' });
  const [editingPace, setEditingPace] = useState<string | null>(null);
  const [paceDraft, setPaceDraft] = useState<string>('');

  const sorted = useMemo(() => exercises.slice().sort((a, b) => a.order - b.order), [exercises]);
  const sortedSections = useMemo(
    () => (sections ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [sections],
  );

  useEffect(() => {
    if (editingPace) return;
    setPaceDraft('');
  }, [editingPace]);

  const handleDragStart = (id: string) => (event: DragEvent<HTMLDivElement>) => {
    setDraggingId(id);
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetId: string) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    const targetIndex = sorted.findIndex((ex) => ex.id === targetId);
    if (targetIndex >= 0) {
      onReorder?.(draggingId, targetIndex);
    }
    setDraggingId(null);
  };

  const handleDragEnd = () => setDraggingId(null);

  const collapsedPairs = (exercise: ExerciseEntry) => {
    const sets = Math.max(
      exercise.sets ?? 0,
      exercise.repsPerSet?.length ?? 0,
      exercise.loadPerSet?.length ?? 0,
    );
    const repsArray =
      exercise.repsPerSet && exercise.repsPerSet.length
        ? exercise.repsPerSet
        : sets
          ? Array.from({ length: sets }).map((_, idx) => exercise.reps ?? null)
          : [];
    const loadArray =
      exercise.loadPerSet && exercise.loadPerSet.length
        ? exercise.loadPerSet
        : sets
          ? Array.from({ length: sets }).map((_, idx) => exercise.load ?? null)
          : [];
    return Array.from({ length: sets }).map((_, idx) => ({
      rep: repsArray[idx],
      load: loadArray[idx],
      label: `Set ${idx + 1}`,
    }));
  };

  const startChipEdit = (exercise: ExerciseEntry, idx: number) => {
    const pairs = collapsedPairs(exercise);
    const target = pairs[idx] ?? { rep: null, load: null };
    setEditingChip({ exerciseId: exercise.id, index: idx });
    setChipDraft({
      rep: target.rep !== null && target.rep !== undefined ? String(target.rep) : '',
      load: target.load !== null && target.load !== undefined ? String(target.load) : '',
    });
  };

  const commitChipEdit = (exercise: ExerciseEntry, idx: number) => {
    const repValue = chipDraft.rep === '' ? null : Number(chipDraft.rep);
    const loadValue = chipDraft.load === '' ? null : Number(chipDraft.load);
    const nextSets = Math.max(exercise.sets ?? 0, idx + 1);
    const reps = Array.from({ length: nextSets }).map((_, i) => exercise.repsPerSet?.[i] ?? null);
    const loads = Array.from({ length: nextSets }).map((_, i) => exercise.loadPerSet?.[i] ?? null);
    reps[idx] = Number.isNaN(repValue) ? null : repValue;
    loads[idx] = Number.isNaN(loadValue) ? null : loadValue;
    onChange(exercise.id, {
      sets: nextSets,
      repsPerSet: reps,
      loadPerSet: loads,
    });
    setEditingChip(null);
  };

  const handleChipBlur = (exercise: ExerciseEntry, idx: number, event: React.FocusEvent<HTMLSpanElement>) => {
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget as Node)) return;
    commitChipEdit(exercise, idx);
  };

  const handleAddSet = (exercise: ExerciseEntry) => {
    const nextSets =
      Math.max(exercise.sets ?? 0, exercise.repsPerSet?.length ?? 0, exercise.loadPerSet?.length ?? 0) + 1;
    const reps = Array.from({ length: nextSets }).map((_, i) => exercise.repsPerSet?.[i] ?? null);
    const loads = Array.from({ length: nextSets }).map((_, i) => exercise.loadPerSet?.[i] ?? null);
    onChange(exercise.id, { sets: nextSets, repsPerSet: reps, loadPerSet: loads });
    startChipEdit(exercise, nextSets - 1);
  };

  const startPaceEdit = (exercise: ExerciseEntry) => {
    setEditingPace(exercise.id);
    setPaceDraft(exercise.pace ?? '');
  };

  const commitPaceEdit = (exercise: ExerciseEntry) => {
    onChange(exercise.id, { pace: paceDraft || null });
    setEditingPace(null);
  };

  return (
    <div className="session__exercise-list">
      <div className="session__list-header">
        <div>
          <p className="eyebrow">Exercises</p>
        </div>
      </div>
      <datalist id="exercise-options">
        {exerciseOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      {sortedSections.map((section) => {
        const sectionExercises = sorted.filter((ex) => ex.sectionId === section.id);
        return (
          <div key={section.id} className="session__exercise-section">
            <div className="session__section-header">
              <div className="session__section-controls session__section-controls--inline">
                <label className="session__section-label session__section-label--inline" htmlFor={`section-${section.id}`}>
                  Section
                </label>
                <select
                  id={`section-${section.id}`}
                  value={section.name}
                  onChange={(e) => onChangeSection(section.id, e.target.value as ExerciseSection['name'])}
                  className="session__section-select"
                >
                  {sectionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'warmup'
                        ? 'Warm up'
                        : option === 'cooldown'
                          ? 'Cool down'
                          : option === 'weights'
                            ? 'Weights'
                            : option === 'cardio'
                              ? 'Cardio'
                              : 'Other'}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="session__chip session__chip--button session__chip--action"
                  onClick={onAddSection}
                >
                  + Add section
                </button>
                <button
                  type="button"
                  className="session__chip session__chip--button session__chip--action"
                  onClick={() => setConfirmSectionId(section.id)}
                  disabled={sortedSections.length <= 1}
                >
                  Delete section
                </button>
              </div>
            </div>
            {confirmSectionId === section.id && (
              <div className="session__confirm">
                <p>Delete this section and its exercises?</p>
                <div className="session__confirm-actions">
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => {
                      onRemoveSection(section.id);
                      setConfirmSectionId(null);
                    }}
                  >
                    Yes, delete
                  </button>
                  <button type="button" className="button button--ghost" onClick={() => setConfirmSectionId(null)}>
                    No, keep it
                  </button>
                </div>
              </div>
            )}

            {sectionExercises.length === 0 && (
              <p className="session__muted" role="status">
                No exercises in this section.
              </p>
            )}

            {sectionExercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="session__exercise-row session__exercise-row--collapsed"
                draggable
                onDragStart={handleDragStart(exercise.id)}
                onDragOver={handleDragOver}
                onDrop={handleDrop(exercise.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="session__row-collapsed">
                  <div className="session__row-inline session__row-inline--spread">
                    <div className="session__field session__field--compact session__field--medium">
                      <label className="session__chip-label session__chip-label--stack" htmlFor={`name-${exercise.id}`}>
                        Exercise
                      </label>
                      <input
                        id={`name-${exercise.id}`}
                        type="search"
                        list="exercise-options"
                        data-testid="exercise-name-input"
                        value={exercise.name}
                        onChange={(e) => onChange(exercise.id, { name: e.target.value })}
                        placeholder="Search exercises"
                      />
                    </div>
                    <div className="session__metric-chips">
                      <div className="session__chip-group session__chip-group--inline">
                        <span className="session__chip-label session__chip-label--stack">Pace</span>
                        {editingPace === exercise.id ? (
                          <span className="session__chip session__chip--editor">
                            <input
                              id={`pace-${exercise.id}`}
                              className="session__chip-input session__chip-input--pace"
                              value={paceDraft}
                              onChange={(e) => setPaceDraft(e.target.value)}
                              onBlur={() => commitPaceEdit(exercise)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitPaceEdit(exercise);
                                if (e.key === 'Escape') setEditingPace(null);
                              }}
                              placeholder="1-1-1"
                              aria-label="Pace (e.g. 1-1-1)"
                            />
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="session__chip session__chip--button"
                            onDoubleClick={() => startPaceEdit(exercise)}
                            aria-label="Edit pace"
                          >
                            <span className="session__chip-value">{exercise.pace ?? '--'}</span>
                          </button>
                        )}
                      </div>
                      {(collapsedPairs(exercise).length === 0 ? [null] : collapsedPairs(exercise)).map((pair, idx) => {
                        const setIndex = pair === null ? 0 : idx;
                        const isEditingThisChip = editingChip?.exerciseId === exercise.id && editingChip.index === setIndex;
                        if (isEditingThisChip || pair === null) {
                          return (
                            <div
                              key={`${exercise.id}-set-${setIndex}`}
                              className="session__chip-group session__chip-group--inline"
                              onBlur={(e) => handleChipBlur(exercise, setIndex, e as any)}
                            >
                              <span className="session__chip-label session__chip-label--stack">{`Set ${setIndex + 1}`}</span>
                              <span className="session__chip session__chip--editor">
                                <input
                                  className="session__chip-input"
                                  value={chipDraft.rep}
                                  onChange={(e) => setChipDraft((prev) => ({ ...prev, rep: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      commitChipEdit(exercise, setIndex);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingChip(null);
                                    }
                                  }}
                                  placeholder="Reps"
                                  aria-label={`Reps for set ${setIndex + 1}`}
                                />
                                <input
                                  className="session__chip-input"
                                  value={chipDraft.load}
                                  onChange={(e) => setChipDraft((prev) => ({ ...prev, load: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      commitChipEdit(exercise, setIndex);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingChip(null);
                                    }
                                  }}
                                  placeholder="Load"
                                  aria-label={`Load for set ${setIndex + 1}`}
                                />
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div key={`${exercise.id}-set-${idx}`} className="session__chip-group session__chip-group--inline">
                            <span className="session__chip-label session__chip-label--stack">{`Set ${idx + 1}`}</span>
                            <button
                              type="button"
                              className="session__chip session__chip--button"
                              onDoubleClick={() => startChipEdit(exercise, idx)}
                              aria-label={`Edit values for set ${idx + 1}`}
                            >
                              <span className="session__chip-value">
                                {pair.rep !== null && pair.rep !== undefined && pair.rep !== '' ? pair.rep : '--'}
                                {pair.load !== null && pair.load !== undefined && pair.load !== ''
                                  ? ` | ${pair.load}`
                                  : ''}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="session__row-actions session__row-actions--inline">
                    <button type="button" className="button button--ghost" onClick={() => onAddExercise(section.id)}>
                      + Exercise
                    </button>
                    <button type="button" className="button" onClick={() => handleAddSet(exercise)}>
                      Add set
                    </button>
                    <button type="button" className="button" onClick={() => onDuplicate(exercise.id)}>
                      Duplicate
                    </button>
                    <button type="button" className="button button--ghost" onClick={() => onRemove(exercise.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {sectionExercises.length === 0 && (
              <div className="session__exercise-row">
                <div className="session__row-actions session__row-actions--save">
                  <button type="button" className="button button--primary" onClick={() => onAddExercise(section.id)}>
                    Add exercise
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ExerciseList;
