import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProgramPage from '../../src/pages/program/ProgramPage';
import { mockProgram } from '../../src/services/mockData';
import { fetchProgramOverview } from '../../src/services/program';

vi.mock('../../src/services/program', () => ({
  fetchProgramOverview: vi.fn(),
}));

const mockedFetch = vi.mocked(fetchProgramOverview);

describe('ProgramPage experience', () => {
  beforeEach(() => {
    mockedFetch.mockResolvedValue(mockProgram);
  });

  it('renders macro phases, micro cycles, and progress charts', async () => {
    render(<ProgramPage />);

    await waitFor(() => {
      expect(screen.getByText(/Half-marathon block/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Macro phases/i, { selector: '.panel__title' })).toBeInTheDocument();
    expect(screen.getByText(/Foundation/i)).toBeInTheDocument();
    expect(screen.getByText(/Micro cycles/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Week 5/i })).toBeInTheDocument();
    expect(screen.getByText(/Adherence trend/i)).toBeInTheDocument();
    expect(screen.getByText(/Volume trend/i)).toBeInTheDocument();
  });

  it('switches micro cycle details and exposes session CTA', async () => {
    const handleNavigate = vi.fn();
    render(<ProgramPage onNavigate={handleNavigate} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Week 5/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Week 6/i }));
    expect(screen.getByRole('heading', { name: /Week 6/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /View sessions for this cycle/i }));
    expect(handleNavigate).toHaveBeenCalledWith('session');
  });

  it('supports next session CTA and cycle navigation controls', async () => {
    const handleNavigate = vi.fn();
    render(<ProgramPage onNavigate={handleNavigate} />);

    await waitFor(() => {
      expect(screen.getByTestId('next-session-card')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Open sessions/i }));
    expect(handleNavigate).toHaveBeenCalledWith('session');

    fireEvent.click(screen.getByRole('button', { name: /Next cycle/i }));
    expect(screen.getByRole('heading', { name: /Week 6/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Previous cycle/i }));
    expect(screen.getByRole('heading', { name: /Week 5/i })).toBeInTheDocument();
  });
});
