import './WeekCalendar.css';
import { formatDisplayDate, formatDisplayTime, getDatesForView, type CalendarView } from '../../services/date';
import type { SessionEntry, WeekView } from '../../services/types';

interface Props {
  week: WeekView;
  loading: boolean;
  error: string | null;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  onSelectSession: (session: SessionEntry | null) => void;
  selectedSessionId: string | null;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

function emptyState(message: string) {
  return <div className="wc__empty">{message}</div>;
}

function WeekCalendar({
  week,
  loading,
  error,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  onSelectSession,
  selectedSessionId,
  view,
  onViewChange,
}: Props) {
  const days = getDatesForView(view, week);
  const gridClass = `wc__grid wc__grid--${view}`;
  const compact = view === 'month';

  if (loading) {
    return (
      <div className="wc">
        <div className="wc__header">
          <div className="wc__controls skeleton" />
        </div>
        <div className="wc__grid skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="wc">
        <div className="wc__header">
          <div>
            <div className="wc__title">Week of {week.startDate}</div>
            <div className="wc__subtitle">Timezone: {week.timezone}</div>
          </div>
        </div>
        <div className="wc__error">
          <p>{error}</p>
          <button onClick={onThisWeek}>Retry</button>
        </div>
      </div>
    );
  }

  const sessionsByDay = days.reduce<Record<string, SessionEntry[]>>((acc, day) => {
    acc[day] = week.sessions.filter((s) => s.date === day);
    return acc;
  }, {});

  return (
    <div className="wc">
      <div className="wc__header">
        <div>
          <div className="wc__title">Week of {week.startDate}</div>
          <div className="wc__subtitle">Timezone: {week.timezone}</div>
        </div>
        <div className="wc__controls">
          <button onClick={onPrevWeek}>Previous</button>
          <button onClick={onThisWeek}>This week</button>
          <button onClick={onNextWeek}>Next</button>
        </div>
      </div>

      <div className="wc__views">
        <button className={view === 'day' ? 'active' : ''} onClick={() => onViewChange('day')}>
          Day
        </button>
        <button className={view === '3day' ? 'active' : ''} onClick={() => onViewChange('3day')}>
          3 Day
        </button>
        <button className={view === 'week' ? 'active' : ''} onClick={() => onViewChange('week')}>
          Week
        </button>
        <button className={view === 'month' ? 'active' : ''} onClick={() => onViewChange('month')}>
          Month
        </button>
      </div>

      <div className={gridClass}>
        {days.map((day) => {
          const sessions = sessionsByDay[day] || [];
          const isToday = day === week.today;
          return (
            <div key={day} className={`wc__day ${isToday ? 'wc__day--today' : ''}`}>
              <div className="wc__day-label">{formatDisplayDate(day)}</div>
              {sessions.length === 0
                ? emptyState('No sessions')
                : sessions.map((session) => {
                    const selected = session.id === selectedSessionId;
                    const showDetail = selected && !compact;
                    return (
                      <div
                        key={session.id}
                        className={`wc__session wc__session--${session.status} ${
                          selected ? 'wc__session--selected' : ''
                        }`}
                        onClick={() => onSelectSession(selected ? null : session)}
                        data-view={view}
                      >
                        <div className={`wc__session-time ${compact ? 'wc__session-time--compact' : ''}`}>
                          {formatDisplayTime(session.date, session.startTime)}
                        </div>
                        <div className={`wc__session-title ${compact ? 'wc__session-title--compact' : ''}`}>
                          {session.title}
                        </div>
                        {!compact && <div className="wc__session-status">{session.status}</div>}
                        {showDetail && (
                          <div className="wc__session-detail">
                            {session.modality && <div>Modality: {session.modality}</div>}
                            {session.durationMinutes !== undefined && <div>Duration: {session.durationMinutes} min</div>}
                            {session.location && <div>Location: {session.location}</div>}
                            {session.coachNotes && <div className="wc__notes">Notes: {session.coachNotes}</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
            </div>
          );
        })}
      </div>

      {week.sessions.length === 0 && emptyState('No sessions scheduled this week. Ask your coach or add sessions.')}
    </div>
  );
}

export default WeekCalendar;
