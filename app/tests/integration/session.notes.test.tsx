import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionPage from '../../src/pages/session/SessionPage';
import { createSession, getSession, updateSession } from '../../src/services/sessionService';

vi.mock('../../src/services/sessionService', () => ({
  createSession: vi.fn(),
  updateSession: vi.fn(),
  getSession: vi.fn(),
}));

const createSessionMock = vi.mocked(createSession);
const updateSessionMock = vi.mocked(updateSession);
const getSessionMock = vi.mocked(getSession);

describe('SessionPage notes flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('saves and reloads session notes', async () => {
    const user = userEvent.setup();
    createSessionMock.mockResolvedValue({
      id: 'session-30',
      date: '2025-03-01',
      athlete: 'Test Athlete',
      participants: ['Test Athlete'],
      exercises: [{ id: 'ex-1', name: 'Tempo', sets: 4, reps: 5, load: null, order: 1 }],
      notes: 'Felt strong.',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    });

    updateSessionMock.mockResolvedValue({
      id: 'session-30',
      date: '2025-03-01',
      athlete: 'Test Athlete',
      participants: ['Test Athlete'],
      exercises: [{ id: 'ex-1', name: 'Tempo', sets: 4, reps: 5, load: null, order: 1 }],
      notes: 'Updated note after review.',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T01:00:00Z',
    });

    getSessionMock.mockResolvedValue({
      id: 'session-30',
      date: '2025-03-01',
      athlete: 'Test Athlete',
      participants: ['Test Athlete'],
      exercises: [{ id: 'ex-1', name: 'Tempo', sets: 4, reps: 5, load: null, order: 1 }],
      notes: 'Updated note after review.',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T01:00:00Z',
    });

    render(<SessionPage />);
    await user.type(screen.getByLabelText(/Scheduled/i), '2025-03-01T00:00');
    await user.type(screen.getByLabelText(/Athlete/i), 'Test Athlete');
    await user.type(screen.getAllByTestId('exercise-name-input')[0], 'Tempo');
    await user.selectOptions(screen.getByLabelText(/Sets/i), '4');
    const repInputs = screen.getAllByLabelText(/^Set /i);
    for (const input of repInputs) {
      await user.type(input, '5');
    }
    await user.click(screen.getByRole('button', { name: /Save exercise/i }));
    await user.type(screen.getByLabelText(/Session notes/i), 'Felt strong.');

    await user.click(screen.getByRole('button', { name: /Save session/i }));
    await waitFor(() => expect(createSessionMock).toHaveBeenCalled());
    const initialNotes = await screen.findAllByText(/Felt strong\./i);
    expect(initialNotes.length).toBeGreaterThan(0);

    const notesInput = screen.getByLabelText(/Session notes/i);
    await user.clear(notesInput);
    await user.type(notesInput, 'Updated note after review.');
    await user.selectOptions(screen.getByLabelText(/Sets/i), '4');
    const repInputsAfter = screen.getAllByLabelText(/^Set /i);
    for (const input of repInputsAfter) {
      await user.type(input, '5');
    }
    await user.click(screen.getByRole('button', { name: /Save exercise/i }));

    await user.click(screen.getByRole('button', { name: /Save session/i }));
    await waitFor(() => expect(updateSessionMock).toHaveBeenCalledWith('session-30', expect.anything()));

    await user.click(screen.getByRole('button', { name: /Reload last saved/i }));
    await waitFor(() => expect(getSessionMock).toHaveBeenCalledWith('session-30'));
    const updatedNotes = await screen.findAllByText(/Updated note after review/i);
    expect(updatedNotes.length).toBeGreaterThan(0);
  }, 15000);
});
