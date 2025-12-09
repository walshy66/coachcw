import { useEffect, useMemo, useState } from 'react';
import type { ExerciseEntry, ExerciseValidationErrors } from './types';

type ExerciseListProps = {
  exercises: ExerciseEntry[];
  errors?: Record<string, ExerciseValidationErrors>;
  onAdd: () => void;
  onChange: (id: string, changes: Partial<ExerciseEntry>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
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

function ExerciseRow({
  exercise,
  isFirst,
  isLast,
  error,
  onChange,
  onRemove,
  onDuplicate,
  onMove,
}: {
  exercise: ExerciseEntry;
  isFirst: boolean;
  isLast: boolean;
  error?: ExerciseValidationErrors;
  onChange: (id: string, changes: Partial<ExerciseEntry>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}) {
  const showMetrics = exercise.sets !== null && exercise.sets !== undefined && exercise.sets > 0;

  const updateSets = (value: string) => {
    const parsed = value === '' ? null : Number(value);
    const sets = Number.isNaN(parsed) ? null : parsed;
    const repsPerSet = sets ? Array.from({ length: sets }).map((_, idx) => exercise.repsPerSet?.[idx] ?? null) : [];
    const loadPerSet = sets ? Array.from({ length: sets }).map((_, idx) => exercise.loadPerSet?.[idx] ?? null) : [];
    onChange(exercise.id, {
      sets,
      repsPerSet,
      loadPerSet,
      durationSeconds: sets ? exercise.durationSeconds : null,
    });
  };

  const updateNumber = (field: keyof ExerciseEntry, value: string) => {
    const parsed = value === '' ? null : Number(value);
    onChange(exercise.id, { [field]: Number.isNaN(parsed) ? null : parsed } as Partial<ExerciseEntry>);
  };

  const updatePerSet = (field: 'repsPerSet' | 'loadPerSet', index: number, value: string) => {
    const parsed = value === '' ? null : Number(value);
    const next = (field === 'repsPerSet' ? [...(exercise.repsPerSet ?? [])] : [...(exercise.loadPerSet ?? [])]) as number[];
    next[index] = Number.isNaN(parsed) ? null : parsed;
    onChange(exercise.id, { [field]: next } as Partial<ExerciseEntry>);
  };

  return (
    <div className="session__exercise-row">
      <div className="session__row-main">
        <div className="session__row-lines">
          <div className="session__row-line session__row-line--top">
            <div className="session__field session__field--compact">
              <label htmlFor={`name-${exercise.id}`}>Exercise</label>
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
            <div className="session__field session__field--compact">
              <label htmlFor={`sets-${exercise.id}`}>Sets</label>
              <select id={`sets-${exercise.id}`} value={exercise.sets ?? ''} onChange={(e) => updateSets(e.target.value)}>
                <option value="">Select</option>
                {Array.from({ length: 11 }).map((_, index) => (
                  <option key={index} value={index}>
                    {index}
                  </option>
                ))}
              </select>
            </div>
            <div className="session__field session__field--compact">
              <label htmlFor={`duration-${exercise.id}`}>Duration (sec)</label>
              <input
                id={`duration-${exercise.id}`}
                type="number"
                min={0}
                value={exercise.durationSeconds ?? ''}
                onChange={(e) => updateNumber('durationSeconds', e.target.value)}
              />
            </div>
          </div>

          {showMetrics && (
            <div className="session__row-line session__row-line--bottom">
              {Array.from({ length: exercise.sets ?? 0 }).map((_, idx) => (
                <div key={`${exercise.id}-pair-${idx}`} className="session__field-pair">
                  <div className="session__field session__field--compact">
                    <label htmlFor={`reps-${exercise.id}-${idx}`}>Reps (set {idx + 1})</label>
                    <input
                      id={`reps-${exercise.id}-${idx}`}
                      type="number"
                      min={0}
                      value={exercise.repsPerSet?.[idx] ?? ''}
                      onChange={(e) => updatePerSet('repsPerSet', idx, e.target.value)}
                    />
                  </div>
                  <div className="session__field session__field--compact">
                    <label htmlFor={`load-${exercise.id}-${idx}`}>Load (kg) set {idx + 1}</label>
                    <input
                      id={`load-${exercise.id}-${idx}`}
                      type="number"
                      min={0}
                      step="0.5"
                      value={exercise.loadPerSet?.[idx] ?? ''}
                      onChange={(e) => updatePerSet('loadPerSet', idx, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {(error?.name || error?.metrics) && (
            <p className="session__field-error session__field-error--inline" role="alert">
              {error?.name || error?.metrics}
            </p>
          )}
        </div>
      </div>
      <div className="session__row-actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={() => onMove(exercise.id, 'up')}
          disabled={isFirst}
          aria-label="Move exercise up"
        >
          ↑
        </button>
        <button
          type="button"
          className="button button--ghost"
          onClick={() => onMove(exercise.id, 'down')}
          disabled={isLast}
          aria-label="Move exercise down"
        >
          ↓
        </button>
        <button type="button" className="button" onClick={() => onDuplicate(exercise.id)}>
          Duplicate
        </button>
        <button type="button" className="button button--ghost" onClick={() => onRemove(exercise.id)}>
          Remove
        </button>
      </div>
    </div>
  );
}

function ExerciseList({ exercises, errors = {}, onAdd, onChange, onRemove, onDuplicate, onMove }: ExerciseListProps) {
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setEditing((prev) => {
      const next = { ...prev };
      exercises.forEach((exercise) => {
        if (next[exercise.id] === undefined) {
          next[exercise.id] = true;
        }
      });
      return next;
    });
  }, [exercises]);

  const sorted = useMemo(() => exercises.slice().sort((a, b) => a.order - b.order), [exercises]);

  const toggleEditing = (id: string, value: boolean) => {
    setEditing((prev) => ({ ...prev, [id]: value }));
  };

  const formatSummary = (exercise: ExerciseEntry) => {
    const sets = exercise.sets ?? 0;
    const reps = exercise.repsPerSet ?? [];
    const loads = exercise.loadPerSet ?? [];
    const pairs =
      sets > 0
        ? Array.from({ length: sets }).map((_, idx) => {
            const rep = reps[idx] ?? '';
            const load = loads[idx] ?? '';
            if (rep === '' && load === '') return '';
            return `${rep}${load !== '' && load !== null && load !== undefined ? ` @ ${load}kg` : ''}`;
          })
        : [];
    const metrics = pairs.filter(Boolean).join(' | ');
    const duration = exercise.durationSeconds ? `${exercise.durationSeconds}s` : '';
    return [metrics, duration].filter(Boolean).join(' • ');
  };

  return (
    <div className="session__exercise-list">
      <div className="session__list-header">
        <div>
          <p className="eyebrow">Exercises</p>
          <h2>Exercises performed</h2>
          <p className="session__muted">Add sets/reps/load or duration for each exercise.</p>
        </div>
        <button type="button" className="button button--primary" onClick={onAdd}>
          Add exercise
        </button>
      </div>
        <datalist id="exercise-options">
          {exerciseOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>

      {exercises.length === 0 && (
        <p className="session__muted" role="status">
          No exercises added yet. Start with the button above.
        </p>
      )}

      {sorted.map((exercise, index) => {
        const isEditing = editing[exercise.id] ?? true;
        if (!isEditing) {
          return (
            <div key={exercise.id} className="session__exercise-row session__exercise-row--collapsed">
              <div className="session__row-collapsed">
                <span className="value">{exercise.name}</span>
                <span className="session__muted">{formatSummary(exercise) || 'No metrics'}</span>
              </div>
              <div className="session__row-actions">
                <button type="button" className="button button--primary" onClick={() => toggleEditing(exercise.id, true)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => onMove(exercise.id, 'up')}
                  disabled={index === 0}
                  aria-label="Move exercise up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => onMove(exercise.id, 'down')}
                  disabled={index === sorted.length - 1}
                  aria-label="Move exercise down"
                >
                  ↓
                </button>
                <button type="button" className="button" onClick={() => onDuplicate(exercise.id)}>
                  Duplicate
                </button>
                <button type="button" className="button button--ghost" onClick={() => onRemove(exercise.id)}>
                  Remove
                </button>
              </div>
            </div>
          );
        }

        return (
          <div key={exercise.id} className="session__exercise-row">
            <ExerciseRow
              exercise={exercise}
              isFirst={index === 0}
              isLast={index === sorted.length - 1}
              error={errors[exercise.id]}
              onChange={onChange}
              onRemove={onRemove}
              onDuplicate={onDuplicate}
              onMove={onMove}
            />
            <div className="session__row-actions session__row-actions--save">
              <button type="button" className="button button--primary" onClick={() => toggleEditing(exercise.id, false)}>
                Save exercise
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ExerciseList;
