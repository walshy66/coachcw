import { useEffect, useMemo, useState } from 'react';
import './SessionPage.css';
import NavLinks from '../../components/navigation/NavLinks';
import ExerciseList from '../../features/session/ExerciseList';
import type { Session, SessionDraft } from '../../features/session/types';
import { useSessionEditor } from '../../features/session/useSessionEditor';
import { useUnsavedChangesPrompt } from '../../features/session/useUnsavedChangesPrompt';
import { createSession, getSession, updateSession } from '../../services/sessionService';
import { createTempId } from '../../features/session/idUtils';

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
    addSection,
    updateSection,
    removeSection,
    updateExercise,
    removeExercise,
    moveExercise,
    reorderExercise,
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
  const [showAthletePrompt, setShowAthletePrompt] = useState(false);
  const [showValidationPrompt, setShowValidationPrompt] = useState(false);
  const [localSessionId] = useState(() => createTempId());

  const { confirmNavigation } = useUnsavedChangesPrompt(isDirty);

  const pendingSaveBlocked = useMemo(() => !isValid, [isValid]);

  const sessionToSave: SessionDraft = useMemo(() => ({ ...session }), [session]);

  const setLengthMinutes = useMemo(() => {
    const duration = session.durationMinutes;
    if (!duration || duration <= 0) return '';
    const weightsSectionIds = (session.sections ?? []).filter((s) => s.name === 'weights').map((s) => s.id);
    const totalSets =
      session.exercises?.reduce((acc, ex) => {
        if (ex.sectionId && weightsSectionIds.includes(ex.sectionId)) {
          return acc + (ex.sets ?? 0);
        }
        return acc;
      }, 0) ?? 0;
    if (!totalSets) return '';
    const perSet = duration / totalSets;
    return perSet > 0 ? Number(perSet.toFixed(1)).toString() : '';
  }, [session]);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    setLoadError(null);
    getSession(sessionId)
      .then((loaded) => {
        reset(loaded);
        setSavedSession(loaded);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Could not load session');
      })
      .finally(() => setLoading(false));
  }, [reset, sessionId]);

  const sessionIdentifier = useMemo(
    () => session.sessionCode ?? session.id ?? localSessionId,
    [session.id, session.sessionCode, localSessionId],
  );

  useEffect(() => {
    if (!session.sessionCode) {
      updateField('sessionCode', sessionIdentifier);
    }
  }, [session.sessionCode, sessionIdentifier, updateField]);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(null);

    if (!session.athlete || !session.athlete.trim()) {
      setShowAthletePrompt(true);
      return;
    }

    if (pendingSaveBlocked) {
      setShowValidationPrompt(true);
      return;
    }

    setSaving(true);
    try {
      const result = sessionToSave.id
        ? await updateSession(sessionToSave.id, sessionToSave)
        : await createSession(sessionToSave);
      markSaved(result);
      setSavedSession(result);
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
            <p className="eyebrow">Scheduled</p>
            <p className="value">
              {target.date || 'Not set'} {target.startTime || target.durationMinutes?.toString() || ''}
            </p>
            {target.trainer && <p className="session__muted">Trainer: {target.trainer}</p>}
            {target.athlete && <p className="session__muted">Athlete: {target.athlete}</p>}
            {target.microCycleId && (
              <p className="session__muted">
                Micro-cycle:{' '}
                <a className="session__link" href={`/micro-cycles/${target.microCycleId}`}>
                  {target.microCycleId}
                </a>
              </p>
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
        {showAthletePrompt && (
          <div className="session__modal" role="alertdialog" aria-modal="true">
            <div className="session__modal-content">
              <h3>Athlete required</h3>
              <p>Please add an athlete before saving.</p>
              <div className="session__modal-actions">
                <button type="button" className="button button--primary" onClick={() => setShowAthletePrompt(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
        {showValidationPrompt && (
          <div className="session__modal" role="alertdialog" aria-modal="true">
            <div className="session__modal-content">
              <h3>Check your exercises</h3>
              <p>Please add a name and at least one set with reps/load for each exercise before saving.</p>
              <div className="session__modal-actions">
                <button type="button" className="button button--primary" onClick={() => setShowValidationPrompt(false)}>
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
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
          </div>
          <div className="session__columns">
            <div className="session__column">
              <div className="session__field-row">
                <div className="session__field session__field--half">
                  <label htmlFor="session-code-left">Session</label>
                  <input id="session-code-left" type="text" value={sessionIdentifier} readOnly />
                </div>
                <div className="session__field session__field--half">
                  <label htmlFor="session-name">Session name</label>
                  <input
                    id="session-name"
                    type="text"
                    value={session.name ?? ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="E.g. Lower body strength"
                  />
                </div>
              </div>
              <div className="session__field-row">
                <div className="session__field session__field--half">
                  <label htmlFor="session-athlete">Athlete *</label>
                  <input
                    id="session-athlete"
                    type="search"
                    value={session.athlete ?? ''}
                    onChange={(e) => {
                      updateField('athlete', e.target.value || null);
                      updateField('participants', e.target.value ? [e.target.value] : []);
                    }}
                    placeholder="Search athletes"
                  />
                </div>
                <div className="session__field session__field--half">
                  <label htmlFor="session-trainer">Trainer</label>
                  <input
                    id="session-trainer"
                    type="search"
                    value={session.trainer ?? ''}
                    onChange={(e) => updateField('trainer', e.target.value || null)}
                    placeholder="Search trainers"
                  />
                </div>
              </div>
            </div>
            <div className="session__column session__column--right">
              <div className="session__field-row">
                <div className="session__field session__field--half">
                  <label htmlFor="session-code-right">Session</label>
                  <input id="session-code-right" type="text" value={sessionIdentifier} readOnly />
                </div>
                <div className="session__field session__field--half">
                  <label htmlFor="session-date">Scheduled</label>
                  <input
                    id="session-date"
                    type="datetime-local"
                    value={
                      session.date
                        ? `${session.date}${session.startTime ? `T${session.startTime}` : 'T00:00'}`
                        : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        updateField('date', '');
                        updateField('startTime', null);
                        return;
                      }
                      const [datePart, timePart] = value.split('T');
                      updateField('date', datePart);
                      updateField('startTime', timePart || null);
                    }}
                  />
                </div>
              </div>
              <div className="session__field-row">
                <div className="session__field session__field--half">
                  <label htmlFor="session-duration">Duration (minutes)</label>
                  <input
                    id="session-duration"
                    type="number"
                    min={0}
                    value={session.durationMinutes ?? ''}
                    onChange={(e) => updateField('durationMinutes', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div className="session__field session__field--half">
                  <label htmlFor="session-set-length">Set duration (min)</label>
                  <input id="session-set-length" type="number" value={setLengthMinutes} readOnly placeholder="Auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="session__section">
          <ExerciseList
            exercises={session.exercises}
            sections={session.sections ?? []}
            onChange={updateExercise}
            onRemove={removeExercise}
            onDuplicate={duplicateExercise}
            onMove={moveExercise}
            onReorder={reorderExercise}
            onAddSection={addSection}
            onChangeSection={updateSection}
            onRemoveSection={removeSection}
            onAddExercise={addExercise}
          />
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
