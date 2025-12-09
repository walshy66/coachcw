import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import './LandingPage.css';
import { fetchWeekSchedule } from '../../services/schedule';
import { fetchCompletionMetrics } from '../../services/metrics';
import { getWeekBounds } from '../../services/date';
import type { MetricSnapshot, SessionEntry, WeekView } from '../../services/types';
import type { CalendarView } from '../../services/date';
import WeekCalendar from '../../components/calendar/WeekCalendar';
import NavLinks from '../../components/navigation/NavLinks';

const CompletionChart = lazy(() => import('../../components/graphs/CompletionChart'));
const VolumeChart = lazy(() => import('../../components/graphs/VolumeChart'));

const CLIENT_ID = 'demo-client'; // replace with real user context
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const today = new Date();

const emptyWeek: WeekView = {
  ...getWeekBounds(today, TIMEZONE),
  sessions: [],
};

const emptyMetrics: MetricSnapshot = {
  rangeLabel: 'Last 4 weeks',
  completionRate: undefined,
  volume: undefined,
  unit: undefined,
  samples: [],
  hasData: false,
};

type LandingPageProps = {
  onNavigate?: (page: 'landing' | 'profile') => void;
};

function LandingPage({ onNavigate }: LandingPageProps) {
  const [weekView, setWeekView] = useState<WeekView>(emptyWeek);
  const [metrics, setMetrics] = useState<MetricSnapshot>(emptyMetrics);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [weekError, setWeekError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionEntry | null>(null);
  const [view, setView] = useState<CalendarView>('week');

  const loadWeek = async (baseDate: Date) => {
    setLoadingWeek(true);
    setWeekError(null);
    try {
      const data = await fetchWeekSchedule(CLIENT_ID, baseDate, TIMEZONE);
      setWeekView(data);
    } catch (err) {
      setWeekError(err instanceof Error ? err.message : 'Failed to load schedule');
      setWeekView(emptyWeek);
    } finally {
      setLoadingWeek(false);
    }
  };

  const loadMetrics = async () => {
    setLoadingMetrics(true);
    setMetricsError(null);
    try {
      const data = await fetchCompletionMetrics(CLIENT_ID, 4);
      setMetrics(data);
    } catch (err) {
      setMetricsError(err instanceof Error ? err.message : 'Failed to load metrics');
      setMetrics(emptyMetrics);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadWeek(today);
    loadMetrics();
  }, []);

  const goToPrevWeek = () => {
    const start = new Date(weekView.startDate + 'T00:00:00');
    start.setDate(start.getDate() - 7);
    loadWeek(start);
  };

  const goToNextWeek = () => {
    const start = new Date(weekView.startDate + 'T00:00:00');
    start.setDate(start.getDate() + 7);
    loadWeek(start);
  };

  const goToThisWeek = () => {
    loadWeek(today);
  };

  const completionRate = useMemo(() => {
    if (!metrics.samples || metrics.samples.length === 0) return undefined;
    const totalScheduled = metrics.samples.reduce((acc, s) => acc + s.sessionsScheduled, 0);
    const totalCompleted = metrics.samples.reduce((acc, s) => acc + s.sessionsCompleted, 0);
    return totalScheduled === 0 ? undefined : totalCompleted / totalScheduled;
  }, [metrics.samples]);

  const badges = useMemo(() => {
    const missed = weekView.sessions.filter((s) => s.status === 'missed').length;
    return {
      sessions: missed > 0 ? missed : undefined,
      messages: 2, // placeholder until real messages endpoint is wired
    };
  }, [weekView.sessions]);

  return (
    <main className="landing">
      <header className="landing__header">
        <div>
          <p className="eyebrow">Client landing</p>
          <h1>Overview</h1>
          <p className="subhead">See your schedule, trends, and jump to what matters.</p>
        </div>
        <NavLinks
          badges={badges}
          onNavigate={(target) => {
            if (target === 'profile') onNavigate?.('profile');
            if (target === 'overview') onNavigate?.('landing');
          }}
        />
      </header>

      <section className="landing__grid">
        <div className="panel panel--calendar">
          <div className="panel__title">Schedule</div>
          <WeekCalendar
            week={weekView}
            loading={loadingWeek}
            error={weekError}
            onPrevWeek={goToPrevWeek}
            onNextWeek={goToNextWeek}
            onThisWeek={goToThisWeek}
            onSelectSession={setSelectedSession}
            selectedSessionId={selectedSession?.id ?? null}
            view={view}
            onViewChange={setView}
          />
        </div>

        <div className="panel panel--results">
          <div className="panel__title">Results</div>
          <Suspense fallback={<div className="graph__skeleton" />}>
            <CompletionChart
              metrics={metrics}
              completionRate={completionRate}
              loading={loadingMetrics}
              error={metricsError}
            />
          </Suspense>
          <Suspense fallback={<div className="graph__skeleton" />}>
            <VolumeChart metrics={metrics} loading={loadingMetrics} error={metricsError} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
