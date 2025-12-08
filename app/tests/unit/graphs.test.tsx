import { render, screen } from '@testing-library/react';
import CompletionChart from '../../src/components/graphs/CompletionChart';
import VolumeChart from '../../src/components/graphs/VolumeChart';
import { mockMetrics } from '../../src/services/mockData';

describe('Graphs', () => {
  it('renders completion chart with metrics', () => {
    render(<CompletionChart metrics={mockMetrics} completionRate={0.82} loading={false} error={null} />);
    expect(screen.getByText(/Completion rate/i)).toBeInTheDocument();
    expect(screen.getByText(/82%/i)).toBeInTheDocument();
  });

  it('renders volume chart with data', () => {
    render(<VolumeChart metrics={mockMetrics} loading={false} error={null} />);
    expect(screen.getByText(/Recent volume/i)).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(
      <CompletionChart
        metrics={{ ...mockMetrics, hasData: false, samples: [] }}
        completionRate={undefined}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByText(/Not enough history/i)).toBeInTheDocument();
  });
});
