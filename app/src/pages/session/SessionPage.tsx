import { useEffect, useMemo, useState } from 'react';
import './SessionPage.css';
import NavLinks from '../../components/navigation/NavLinks';
import ExerciseList from '../../features/session/ExerciseList';
import type { Session, SessionDraft } from '../../features/session/types';
import { useSessionEditor } from '../../features/session/useSessionEditor';
import { useUnsavedChangesPrompt } from '../../features/session/useUnsavedChangesPrompt';
import { createSession, getSession, updateSession } from '../../services/sessionService';

type SessionPageProps = {
  onNavigate?: (page: 'landing' | 'profile' | 'session') => void;
  sessionId?: string;
};

function SessionPage({ onNavigate, sessionId }: SessionPageProps) {
  const {
    session,
    errors,
    isValid,
    isDirty,
    addExercise,
    updateExercise,
    removeExercise,
    moveExercise,
    duplicateExercise,
    updateField,
    markSaved,
    reset,
  } = useSessionEditor();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [savedSession, setSavedSession] = useState<Session | null>(null);
  const [participantsInput, setParticipantsInput] = useState('');

  const { confirmNavigation } = useUnsavedChangesPrompt(isDirty);

  const pendingSaveBlocked = useMemo(() => !isValid, [isValid]);

  const sessionToSave: SessionDraft = useMemo(
    () => ({
      ...session,
      participants: participantsInput
        ? participantsInput
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
        : [],
    }),
    [session, participantsInput],
  );

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    setLoadError(null);
    getSession(sessionId)
      .then((loaded) => {
        reset(loaded);
        setSavedSession(loaded);
        setParticipantsInput(loaded.participants?.join(', ') ?? '');
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Could not load session');
      })
      .finally(() => setLoading(false));
  }, [reset, sessionId]);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(null);

    if (pendingSaveBlocked) {
      setSaveError('Fix validation issues before saving.');
      return;
    }

    setSaving(true);
    try {
      const result = sessionToSave.id
        ? await updateSession(sessionToSave.id, sessionToSave)
        : await createSession(sessionToSave);
      markSaved(result);
      setSavedSession(result);
      setParticipantsInput(result.participants?.join(', ') ?? '');
      setSaveSuccess('Session saved');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save session');
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async () => {
    const id = savedSession?.id ?? session.id;
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getSession(id);
      reset(result);
      setSavedSession(result);
      setParticipantsInput(result.participants?.join(', ') ?? '');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not reload session');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (target: 'landing' | 'profile' | 'session') => {
    if (!confirmNavigation()) return;
    onNavigate?.(target);
  };

  const renderSummary = () => {
    const target = savedSession;
    if (!target) return null;

    return (
      <section className="panel session__panel">
        <div className="panel__title">Saved session summary</div>
        <div className="session__summary-grid">
          <div>
            <p className="eyebrow">Date & time</p>
            <p className="value">
              {target.date || 'Not set'}{' '}
              {(target.startTime && target.endTime && `${target.startTime} - ${target.endTime}`) ||
                target.startTime ||
                target.durationMinutes?.toString() ||
                ''}
            </p>
            <p className="session__muted">
              {target.location ? `Location: ${target.location}` : 'Location not provided'}
            </p>
            <p className="session__muted">
              {target.intensity ? `Intensity: ${target.intensity}` : 'Intensity not provided'}
            </p>
            {target.participants && target.participants.length > 0 && (
              <p className="session__muted">Participants: {target.participants.join(', ')}</p>
            )}
          </div>
          <div>
            <p className="eyebrow">Notes</p>
            <p className="session__muted">{target.notes || 'No notes added'}</p>
          </div>
        </div>

        <div className="session__summary-exercises">
          <p className="eyebrow">Exercises</p>
          {target.exercises.length === 0 ? (
            <p className="session__muted">No exercises saved.</p>
          ) : (
            <ul>
              {target.exercises
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((exercise) => (
                  <li key={exercise.id}>
                    <span className="value">{exercise.name}</span>
                    <span className="session__muted">
                      {exercise.durationSeconds ? `${exercise.durationSeconds}s` : ''}
                      {exercise.sets
                        ? ` • ${exercise.sets} sets: ${
                            exercise.repsPerSet && exercise.repsPerSet.length > 0
                              ? exercise.repsPerSet.join('/')
                              : exercise.reps ?? ''
                          } reps${
                            exercise.loadPerSet && exercise.loadPerSet.length > 0
                              ? ` @ ${exercise.loadPerSet.join('/') }kg`
                              : exercise.load
                                ? ` @ ${exercise.load}kg`
                                : ''
                          }`
                        : ''}
                    </span>
                    {exercise.notes && <span className="session__muted"> • {exercise.notes}</span>}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>
    );
  };

  return (
    <main className="session">
      <header className="session__header">
        <div>
          <p className="eyebrow">Training log</p>
          <h1>Session</h1>
          <p className="subhead">Capture session details, exercises, and notes.</p>
        </div>
        <NavLinks
          onNavigate={(target) => {
            if (target === 'overview') handleNavigate('landing');
            if (target === 'profile') handleNavigate('profile');
            if (target === 'sessions') handleNavigate('session');
          }}
        />
      </header>

      {(saveError || loadError) && (
        <div className="session__alert" role="alert">
          {saveError || loadError}
        </div>
      )}

      {saveSuccess && (
        <div className="session__alert session__alert--success" role="status">
          {saveSuccess}
        </div>
      )}

      <section className="panel session__panel">
        <div className="session__section">
          <div>
            <p className="eyebrow">Session details</p>
            <h2>When and where</h2>
            <p className="session__muted">Date is required. Provide time or duration for more context.</p>
          </div>
          <div className="session__fields-grid">
            <div className="session__field">
              <label htmlFor="session-date">Date</label>
              <input
                id="session-date"
                type="date"
                value={session.date}
                onChange={(e) => updateField('date', e.target.value)}
                required
              />
              {errors.date && (
                <p className="session__field-error" role="alert">
                  {errors.date}
                </p>
              )}
            </div>
            <div className="session__field">
              <label htmlFor="session-start">Start time</label>
              <input
                id="session-start"
                type="time"
                value={session.startTime ?? ''}
                onChange={(e) => updateField('startTime', e.target.value || null)}
              />
            </div>
            <div className="session__field">
              <label htmlFor="session-end">End time</label>
              <input
                id="session-end"
                type="time"
                value={session.endTime ?? ''}
                onChange={(e) => updateField('endTime', e.target.value || null)}
              />
              {errors.time && (
                <p className="session__field-error" role="alert">
                  {errors.time}
                </p>
              )}
            </div>
            <div className="session__field">
              <label htmlFor="session-duration">Duration (minutes)</label>
              <input
                id="session-duration"
                type="number"
                min={0}
                value={session.durationMinutes ?? ''}
                onChange={(e) => updateField('durationMinutes', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="session__field">
              <label htmlFor="session-location">Location</label>
              <input
                id="session-location"
                type="text"
                value={session.location ?? ''}
                onChange={(e) => updateField('location', e.target.value || null)}
                placeholder="Gym, track, outdoors"
              />
            </div>
            <div className="session__field">
              <label htmlFor="session-intensity">Intensity</label>
              <select
                id="session-intensity"
                value={session.intensity ?? ''}
                onChange={(e) => updateField('intensity', e.target.value || null)}
              >
                <option value="">Select...</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="session__field session__field--full">
              <label htmlFor="session-participants">Participants</label>
              <input
                id="session-participants"
                type="text"
                value={participantsInput}
                onChange={(e) => {
                  setParticipantsInput(e.target.value);
                  updateField(
                    'participants',
                    e.target.value
                      .split(',')
                      .map((p) => p.trim())
                      .filter(Boolean),
                  );
                }}
                placeholder="Comma separated names"
              />
            </div>
          </div>
        </div>

        <div className="session__section">
          <ExerciseList
            exercises={session.exercises}
            errors={errors.exerciseErrors}
            onAdd={addExercise}
            onChange={updateExercise}
            onRemove={removeExercise}
            onDuplicate={duplicateExercise}
            onMove={moveExercise}
          />
          {errors.exercises && (
            <p className="session__field-error" role="alert">
              {errors.exercises}
            </p>
          )}
        </div>

        <div className="session__section">
          <div className="session__field session__field--full">
            <label htmlFor="session-notes">Session notes</label>
            <textarea
              id="session-notes"
              value={session.notes ?? ''}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
              placeholder="Observations, modifications, follow-ups"
            />
          </div>
        </div>

        <div className="session__actions">
          <button type="button" className="button button--primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save session'}
          </button>
          <button type="button" className="button" onClick={handleReload} disabled={loading || (!savedSession && !session.id)}>
            {loading ? 'Loading…' : 'Reload last saved'}
          </button>
          <button type="button" className="button button--ghost" onClick={() => reset(savedSession ?? undefined)}>
            Reset changes
          </button>
        </div>
      </section>

      {renderSummary()}
    </main>
  );
}

export default SessionPage;
