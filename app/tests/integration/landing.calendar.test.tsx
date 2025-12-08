import { render, screen, waitFor } from '@testing-library/react';
import LandingPage from '../../src/pages/landing/LandingPage';
import { mockMetrics, mockWeek } from '../../src/services/mockData';

vi.mock('../../src/services/schedule', () => ({
  fetchWeekSchedule: vi.fn(async () => mockWeek),
}));

vi.mock('../../src/services/metrics', () => ({
  fetchCompletionMetrics: vi.fn(async () => mockMetrics),
}));

describe('LandingPage calendar flow', () => {
  it('renders the weekly calendar with sessions and navigation', async () => {
    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Schedule/i)[0]).toBeInTheDocument();
    });

    expect(screen.getByText(/Week of/i)).toBeInTheDocument();
    expect(screen.getByText(/Intervals/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /This week/i })).toBeInTheDocument();
  });

  it('shows results charts and nav links', async () => {
    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByText(/Completion rate/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Recent volume/i)).toBeInTheDocument();
    expect(screen.getByText(/Exercises/i)).toBeInTheDocument();
    expect(screen.getByText(/Program/i)).toBeInTheDocument();
    expect(screen.getByText(/Reports/i)).toBeInTheDocument();
  });
});
