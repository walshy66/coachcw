import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionPage from '../../src/pages/session/SessionPage';
import { createSession } from '../../src/services/sessionService';

vi.mock('../../src/services/sessionService', () => ({
  createSession: vi.fn(),
  updateSession: vi.fn(),
  getSession: vi.fn(),
}));

const createSessionMock = vi.mocked(createSession);

describe('SessionPage details flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('saves session details and shows them in summary', async () => {
    const user = userEvent.setup();
    createSessionMock.mockResolvedValue({
      id: 'session-20',
      date: '2025-02-10',
      startTime: '07:00',
      endTime: '08:00',
      durationMinutes: 60,
      location: 'Track',
      intensity: 'hard',
      participants: ['Alex', 'Jordan'],
      exercises: [{ id: 'ex-1', name: 'Intervals', sets: 5, reps: 3, load: null, order: 1 }],
      notes: '',
      createdAt: '2025-02-10T07:00:00Z',
      updatedAt: '2025-02-10T07:00:00Z',
    });

    render(<SessionPage />);

    await user.type(screen.getByLabelText(/^Date$/i), '2025-02-10');
    await user.type(screen.getByLabelText(/Start time/i), '07:00');
    await user.type(screen.getByLabelText(/End time/i), '08:00');
    await user.type(screen.getByLabelText(/Duration \(minutes\)/i), '60');
    await user.type(screen.getByLabelText(/Location/i), 'Track');
    await user.selectOptions(screen.getByLabelText(/Intensity/i), 'hard');
    await user.type(screen.getByLabelText(/Participants/i), 'Alex, Jordan');

    await user.click(screen.getByRole('button', { name: /Add exercise/i }));
    await user.type(screen.getAllByTestId('exercise-name-input')[0], 'Intervals');
    await user.selectOptions(screen.getByLabelText(/Sets/i), '5');
    const repInputs = screen.getAllByLabelText(/Reps \(set/i);
    for (const input of repInputs) {
      await user.type(input, '3');
    }
    await user.click(screen.getByRole('button', { name: /Save exercise/i }));

    await user.click(screen.getByRole('button', { name: /Save session/i }));
    await waitFor(() => expect(createSessionMock).toHaveBeenCalled());

    expect(await screen.findByText(/Session saved/i)).toBeInTheDocument();
    expect(await screen.findByText(/Track/)).toBeInTheDocument();
    expect(await screen.findByText(/Intensity: hard/i)).toBeInTheDocument();
    expect(await screen.findByText(/Participants: Alex, Jordan/i)).toBeInTheDocument();
  });
});
