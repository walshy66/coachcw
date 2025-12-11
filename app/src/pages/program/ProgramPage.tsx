import { useEffect, useMemo, useState } from 'react';
import './ProgramPage.css';
import NavLinks from '../../components/navigation/NavLinks';
import { fetchProgramOverview } from '../../services/program';
import type { MicroCycleSummary, ProgramSnapshot } from '../../services/types';
import { formatDisplayDate, formatDisplayTime, formatRangeLabel } from '../../services/date';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type ProgramPageProps = {
  onNavigate?: (page: 'landing' | 'profile' | 'session' | 'program') => void;
};

const CLIENT_ID = 'demo-client';

const statusLabels: Record<MicroCycleSummary['status'], string> = {
  current: 'Current',
  upcoming: 'Upcoming',
  done: 'Completed',
};

const formatPercent = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `${Math.round(value * 100)}%`;
};

const readinessLabel = (score: number) => {
  if (score >= 0.85) return 'Ready to push';
  if (score >= 0.65) return 'Manageable load';
  return 'Focus on recovery';
};

const readinessTone = (score: number) => {
  if (score >= 0.85) return 'high';
  if (score >= 0.65) return 'medium';
  return 'low';
};

function ProgramPage({ onNavigate }: ProgramPageProps) {
  const [program, setProgram] = useState<ProgramSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMicroCycleId, setSelectedMicroCycleId] = useState<string | null>(null);

  const loadProgram = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProgramOverview(CLIENT_ID);
      setProgram(data);
      setSelectedMicroCycleId((prev) => {
        if (prev && data.microCycles.some((cycle) => cycle.id === prev)) {
          return prev;
        }
        return data.currentMicroCycleId ?? data.microCycles[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load program right now.');
      if (!program) {
        setSelectedMicroCycleId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCycle = program?.microCycles.find((cycle) => cycle.id === selectedMicroCycleId) ?? null;

  const cycleIndex = program?.microCycles.findIndex((cycle) => cycle.id === selectedMicroCycleId) ?? -1;
  const previousCycle = cycleIndex > 0 ? program?.microCycles[cycleIndex - 1] : undefined;
  const nextCycle =
    program && cycleIndex >= 0 && cycleIndex < program.microCycles.length - 1
      ? program.microCycles[cycleIndex + 1]
      : undefined;

  const progressData = useMemo(() => {
    if (!program) return [];
    return program.progressSamples.map((sample) => ({
      label: sample.label,
      planned: sample.sessionsPlanned,
      completed: sample.sessionsCompleted,
      adherence:
        sample.sessionsPlanned > 0 ? Number(((sample.sessionsCompleted / sample.sessionsPlanned) * 100).toFixed(1)) : 0,
      volume: sample.volume ?? 0,
      unit: sample.unit ?? 'minutes',
    }));
  }, [program]);

  const averageAdherence = useMemo(() => {
    if (!progressData.length) return null;
    const total = progressData.reduce((acc, entry) => acc + entry.adherence, 0);
    return total / progressData.length / 100;
  }, [progressData]);

  const volumeUnit = progressData.find((entry) => entry.unit)?.unit ?? 'minutes';

  const rangeLabel = program ? formatRangeLabel(program.startDate, program.endDate) : 'Dates not yet available';
  const weeksComplete =
    program && program.totalWeeks > 0
      ? `${program.completedWeeks}/${program.totalWeeks} weeks`
      : 'Weeks not provided';

  const renderPhaseTimeline = () => {
    if (!program?.phases?.length) {
      return <p className="program__muted">No phases have been added yet.</p>;
    }

    return program.phases.map((phase) => {
      const completion =
        phase.totalWeeks > 0 ? Math.min(100, Math.round((phase.completedWeeks / phase.totalWeeks) * 100)) : 0;
      const isCurrent = program.currentPhaseId === phase.id;
      return (
        <div
          key={phase.id}
          className={`program__phase ${isCurrent ? 'program__phase--current' : ''}`}
          aria-current={isCurrent ? 'true' : undefined}
        >
          <div className="program__phase-head">
            <div>
              <p className="program__phase-name">{phase.name}</p>
              <p className="program__muted">{phase.focus || 'Focus not provided'}</p>
            </div>
            <span className="program__pill">{phase.completedWeeks ?? 0}/{phase.totalWeeks ?? 0} wks</span>
          </div>
          <p className="program__muted">{formatRangeLabel(phase.startDate, phase.endDate)}</p>
          <div
            className="program__phase-bar"
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${completion}%` }} />
          </div>
        </div>
      );
    });
  };

  const renderMicroCycleList = () => {
    if (!program?.microCycles?.length) {
      return <p className="program__muted">Micro cycles will appear here when your coach adds them.</p>;
    }

    return program.microCycles.map((cycle) => {
      const isSelected = cycle.id === selectedMicroCycleId;
      return (
        <button
          key={cycle.id}
          type="button"
          className={`program__cycle-button program__cycle-button--${cycle.status} ${
            isSelected ? 'program__cycle-button--active' : ''
          }`}
          onClick={() => setSelectedMicroCycleId(cycle.id)}
          aria-current={isSelected ? 'true' : undefined}
        >
          <div className="program__cycle-row">
            <span className="program__cycle-name">{cycle.name}</span>
            <span className="program__cycle-status">{statusLabels[cycle.status]}</span>
          </div>
          <p className="program__muted">{cycle.focus || 'Focus not set'}</p>
          <p className="program__cycle-summary">
            {cycle.sessionsCompleted}/{cycle.sessionsPlanned} sessions • {formatRangeLabel(cycle.startDate, cycle.endDate)}
          </p>
        </button>
      );
    });
  };

  const renderCycleDetail = () => {
    if (!selectedCycle) {
      return <p className="program__muted">Select a micro cycle to see readiness, dates, and quick actions.</p>;
    }

    const readinessClass = readinessTone(selectedCycle.readinessScore);
    return (
      <div className="program__cycle-card">
        <div className="program__cycle-card-head">
          <div>
            <p className="eyebrow">{statusLabels[selectedCycle.status]}</p>
            <h3>{selectedCycle.name}</h3>
            <p className="program__muted">{selectedCycle.focus || 'Focus not provided'}</p>
            <p className="program__muted">{formatRangeLabel(selectedCycle.startDate, selectedCycle.endDate)}</p>
          </div>
          <div className="program__cycle-nav">
            <button
              type="button"
              className="program__button program__button--ghost"
              onClick={() => previousCycle && setSelectedMicroCycleId(previousCycle.id)}
              disabled={!previousCycle}
            >
              Previous cycle
            </button>
            <button
              type="button"
              className="program__button program__button--ghost"
              onClick={() => nextCycle && setSelectedMicroCycleId(nextCycle.id)}
              disabled={!nextCycle}
            >
              Next cycle
            </button>
          </div>
        </div>
        <div className="program__cycle-stats">
          <div>
            <p className="label">Planned</p>
            <p className="value">{selectedCycle.sessionsPlanned}</p>
          </div>
          <div>
            <p className="label">Completed</p>
            <p className="value">{selectedCycle.sessionsCompleted}</p>
          </div>
          <div>
            <p className="label">Readiness</p>
            <p className="value">{formatPercent(selectedCycle.readinessScore)}</p>
          </div>
        </div>
        <div className="program__cycle-footer">
          <span className={`program__readiness program__readiness--${readinessClass}`}>
            {readinessLabel(selectedCycle.readinessScore)}
          </span>
          <button
            type="button"
            className="program__button program__button--primary"
            onClick={() => onNavigate?.('session')}
          >
            View sessions for this cycle
          </button>
        </div>
      </div>
    );
  };

  const renderNextSession = () => {
    if (!program?.nextSession) return null;
    const session = program.nextSession;
    return (
      <div className="program__next-session" data-testid="next-session-card">
        <div>
          <p className="eyebrow">Next session</p>
          <h3>{session.title}</h3>
          <p className="program__muted">
            {formatDisplayDate(session.date)} · {formatDisplayTime(session.date, session.startTime)}
            {session.modality ? ` • ${session.modality}` : ''}
          </p>
        </div>
        <div className="program__next-session-cta">
          <button
            type="button"
            className="program__button program__button--primary"
            onClick={() => onNavigate?.('session')}
          >
            Open sessions
          </button>
          <p className="program__muted">Jump directly to your session plan.</p>
        </div>
      </div>
    );
  };

  return (
    <main className="program">
      <header className="program__header">
        <div>
          <p className="eyebrow">Program</p>
          <h1>{program?.programName ?? 'Program overview'}</h1>
          <p className="program__subhead">{program?.goal ?? 'Your progress and sessions live here.'}</p>
          <div className="program__meta">
            <span>{rangeLabel}</span>
            <span>{weeksComplete}</span>
            {program?.targetEvent && <span>Target: {program.targetEvent}</span>}
          </div>
          <div className="program__chips">
            <div className="program__chip">
              <span>Overall progress</span>
              <strong>{formatPercent(program?.overallProgress)}</strong>
            </div>
            <div className="program__chip">
              <span>Adherence</span>
              <strong>{formatPercent(program?.adherenceRate)}</strong>
            </div>
          </div>
        </div>
        <NavLinks
          onNavigate={(target) => {
            if (target === 'overview') onNavigate?.('landing');
            if (target === 'profile') onNavigate?.('profile');
            if (target === 'sessions') onNavigate?.('session');
            if (target === 'program') onNavigate?.('program');
          }}
        />
      </header>

      {error && (
        <div className="program__alert" role="alert">
          <span>{error}</span>
          <button type="button" className="program__button program__button--ghost" onClick={loadProgram}>
            Retry
          </button>
        </div>
      )}

      {loading && !program && <div className="program__loading">Loading program details...</div>}

      {!loading && !program && !error && <div className="program__empty">No program assigned yet.</div>}

      {program && (
        <>
          <section className="panel program__panel program__overview">
            <div>
              <div className="panel__title">Program overview</div>
              <p className="program__muted">
                Track your macro phases, weekly focus, and readiness to stay aligned with your coach.
              </p>
            </div>
            {renderNextSession()}
          </section>

          <section className="program__grid">
            <div className="panel program__panel">
              <div className="panel__title">Macro phases</div>
              {renderPhaseTimeline()}
            </div>
            <div className="panel program__panel program__micro">
              <div className="panel__title">Micro cycles</div>
              <div className="program__micro-list" role="tablist" aria-label="Micro cycles">
                {renderMicroCycleList()}
              </div>
              {renderCycleDetail()}
            </div>
          </section>

          <section className="panel program__panel">
            <div className="panel__title">Progress visuals</div>
            <div className="program__graphs">
              <div className="program__graph">
                <div className="program__graph-title">
                  Adherence trend
                  {averageAdherence !== null && (
                    <span className="program__pill">{formatPercent(averageAdherence)}</span>
                  )}
                </div>
                {loading && !progressData.length ? (
                  <div className="program__graph-skeleton" />
                ) : progressData.length === 0 ? (
                  <p className="program__muted">Complete more sessions to unlock adherence trends.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis unit="%" stroke="#94a3b8" />
                      <Tooltip />
                      <Area type="monotone" dataKey="adherence" stroke="#34d399" fill="#065f46" name="Adherence %" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="program__graph">
                <div className="program__graph-title">
                  Volume trend <span className="program__pill">{volumeUnit}</span>
                </div>
                {loading && !progressData.length ? (
                  <div className="program__graph-skeleton" />
                ) : progressData.length === 0 ? (
                  <p className="program__muted">Volume data will appear as you log more sessions.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#38bdf8" name="Volume" />
                      <Bar dataKey="completed" fill="#22c55e" name="Completed sessions" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default ProgramPage;
