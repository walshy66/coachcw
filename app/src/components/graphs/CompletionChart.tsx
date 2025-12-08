import './Graphs.css';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from 'recharts';
import type { MetricSnapshot } from '../../services/types';

interface Props {
  metrics: MetricSnapshot;
  completionRate?: number;
  loading: boolean;
  error: string | null;
}

const Empty = ({ message }: { message: string }) => <div className="graph__empty">{message}</div>;

function CompletionChart({ metrics, completionRate, loading, error }: Props) {
  if (loading) return <div className="graph__skeleton" />;
  if (error) return <Empty message={error} />;
  if (!metrics.hasData || metrics.samples.length === 0) {
    return <Empty message="Not enough history yet. Complete sessions to see trends." />;
  }

  const data = metrics.samples.map((s) => ({
    name: s.weekStart,
    completed: s.sessionsCompleted,
    scheduled: s.sessionsScheduled,
  }));

  return (
    <div className="graph">
      <div className="graph__title">
        Completion rate
        {completionRate !== undefined && (
          <span className="graph__pill">{Math.round(completionRate * 100)}% last period</span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Legend />
          <Bar dataKey="scheduled" fill="#475569" name="Scheduled" />
          <Bar dataKey="completed" fill="#22c55e" name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CompletionChart;
