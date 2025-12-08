import './Graphs.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MetricSnapshot } from '../../services/types';

interface Props {
  metrics: MetricSnapshot;
  loading: boolean;
  error: string | null;
}

const Empty = ({ message }: { message: string }) => <div className="graph__empty">{message}</div>;

function VolumeChart({ metrics, loading, error }: Props) {
  if (loading) return <div className="graph__skeleton" />;
  if (error) return <Empty message={error} />;

  if (!metrics.hasData || metrics.samples.length === 0) {
    return <Empty message="No volume yet. Once sessions are logged, volume trends appear here." />;
  }

  const data = metrics.samples.map((s) => ({
    name: s.weekStart,
    volume: s.volume ?? 0,
  }));

  return (
    <div className="graph">
      <div className="graph__title">Recent volume</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Area type="monotone" dataKey="volume" stroke="#60a5fa" fill="#1d4ed8" name={metrics.unit ?? 'Volume'} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default VolumeChart;
