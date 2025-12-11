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

describe('SessionPage exercises flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a session with multiple exercises and preserves them on reload', async () => {
    const user = userEvent.setup();

    createSessionMock.mockResolvedValue({
      id: 'session-10',
      date: '2025-01-02',
      exercises: [
        { id: 'ex-1', name: 'Back Squat', sets: 3, reps: 5, load: 100, order: 1 },
        { id: 'ex-2', name: 'Row', sets: 1, reps: 10, load: 0, order: 2 },
      ],
      notes: '',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    });

    getSessionMock.mockResolvedValue({
      id: 'session-10',
      date: '2025-01-02',
      exercises: [
        { id: 'ex-1', name: 'Back Squat', sets: 3, reps: 5, load: 100, order: 1 },
        { id: 'ex-2', name: 'Row', sets: 1, reps: 10, load: 0, order: 2 },
      ],
      notes: '',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    });

    render(<SessionPage />);

    await user.type(screen.getByLabelText(/Scheduled/i), '2025-01-02T00:00');
    await user.type(screen.getByLabelText(/Athlete/i), 'Test Athlete');

    const [name1] = screen.getAllByTestId('exercise-name-input');
    await user.type(name1, 'Back Squat');
    await user.selectOptions(screen.getByLabelText(/Sets/i), '3');
    let repInputs = screen.getAllByLabelText(/^Set /i);
    for (let i = 0; i < repInputs.length; i++) {
      await user.type(repInputs[i], '5');
    }
    let loadInputs = screen.getAllByLabelText(/^Load$/i);
    for (let i = 0; i < loadInputs.length; i++) {
      await user.type(loadInputs[i], '100');
    }
    await user.click(screen.getAllByRole('button', { name: /Save exercise/i })[0]);

    await user.click(screen.getByRole('button', { name: /Duplicate/i }));
    const nameInputs = screen.getAllByTestId('exercise-name-input');
    const setsSelects = screen.getAllByLabelText(/Sets/i);
    await user.clear(nameInputs[nameInputs.length - 1]);
    await user.type(nameInputs[nameInputs.length - 1], 'Row');
    await user.selectOptions(setsSelects[setsSelects.length - 1], '1');
    repInputs = screen.getAllByLabelText(/^Set /i);
    for (let i = 0; i < repInputs.length; i++) {
      await user.type(repInputs[i], i === repInputs.length - 1 ? '10' : '5');
    }
    loadInputs = screen.getAllByLabelText(/^Load$/i);
    for (let i = 0; i < loadInputs.length; i++) {
      await user.type(loadInputs[i], i === loadInputs.length - 1 ? '0' : '100');
    }
    await user.click(screen.getAllByRole('button', { name: /Save exercise/i })[1]);

    await user.click(screen.getByRole('button', { name: /Save session/i }));

    await waitFor(() => expect(createSessionMock).toHaveBeenCalled());
    expect(await screen.findByText(/Session saved/i)).toBeInTheDocument();

    expect(await screen.findByText(/Back Squat/i)).toBeInTheDocument();
    expect(await screen.findByText(/Row/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reload last saved/i }));
    await waitFor(() => expect(getSessionMock).toHaveBeenCalledWith('session-10'));
    expect(await screen.findAllByText(/Row/i)).not.toHaveLength(0);
  }, 15000);

  it('updates an existing session when an id exists', async () => {
    const user = userEvent.setup();
    createSessionMock.mockResolvedValue({
      id: 'session-11',
      date: '2025-01-03',
      athlete: 'Test Athlete',
      participants: ['Test Athlete'],
      exercises: [{ id: 'ex-1', name: 'Press', sets: 3, reps: 8, load: 40, order: 1 }],
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z',
      notes: '',
    });
    updateSessionMock.mockResolvedValue({
      id: 'session-11',
      date: '2025-01-03',
      athlete: 'Test Athlete',
      participants: ['Test Athlete'],
      exercises: [
        { id: 'ex-1', name: 'Press', sets: 4, reps: 8, load: 45, order: 1 },
        { id: 'ex-2', name: 'Plank', sets: 1, reps: 15, load: 0, order: 2 },
      ],
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T01:00:00Z',
      notes: '',
    });

    render(<SessionPage />);
    await user.type(screen.getByLabelText(/Scheduled/i), '2025-01-03T00:00');
    await user.type(screen.getByLabelText(/Athlete/i), 'Test Athlete');
    await user.type(screen.getAllByTestId('exercise-name-input')[0], 'Press');
    await user.selectOptions(screen.getByLabelText(/Sets/i), '3');
    let repInputs = screen.getAllByLabelText(/^Set /i);
    for (let i = 0; i < repInputs.length; i++) {
      await user.type(repInputs[i], '8');
    }
    let loadInputs = screen.getAllByLabelText(/^Load$/i);
    for (let i = 0; i < loadInputs.length; i++) {
      await user.type(loadInputs[i], '40');
    }
    await user.click(screen.getAllByRole('button', { name: /Save exercise/i })[0]);
    await user.click(screen.getByRole('button', { name: /Save session/i }));
    await waitFor(() => expect(createSessionMock).toHaveBeenCalled());

    const nameInputs = screen.getAllByTestId('exercise-name-input');
    await user.clear(nameInputs[0]);
    await user.type(nameInputs[0], 'Press');
    await user.selectOptions(screen.getAllByLabelText(/Sets/i)[0], '4');
    repInputs = screen.getAllByLabelText(/^Set /i);
    for (let i = 0; i < repInputs.length; i++) {
      await user.type(repInputs[i], '8');
    }
    loadInputs = screen.getAllByLabelText(/^Load$/i);
    for (let i = 0; i < loadInputs.length; i++) {
      await user.type(loadInputs[i], '45');
    }
    await user.click(screen.getByRole('button', { name: /Duplicate/i }));
    const nameInputsAfterDup = screen.getAllByTestId('exercise-name-input');
    const setsSelectsAfterDup = screen.getAllByLabelText(/Sets/i);
    await user.clear(nameInputsAfterDup[nameInputsAfterDup.length - 1]);
    await user.type(nameInputsAfterDup[nameInputsAfterDup.length - 1], 'Plank');
    await user.selectOptions(setsSelectsAfterDup[setsSelectsAfterDup.length - 1], '1');
    const repInputsAfterDup = screen.getAllByLabelText(/^Set /i);
    await user.type(repInputsAfterDup[repInputsAfterDup.length - 1], '15');
    const loadInputsAfterDup = screen.getAllByLabelText(/^Load$/i);
    await user.type(loadInputsAfterDup[loadInputsAfterDup.length - 1], '0');
    await user.click(screen.getAllByRole('button', { name: /Save exercise/i })[0]);
    await user.click(screen.getAllByRole('button', { name: /Save exercise/i })[1]);

    await user.click(screen.getByRole('button', { name: /Save session/i }));
    await waitFor(() => expect(updateSessionMock).toHaveBeenCalledWith('session-11', expect.anything()));
    expect(await screen.findByText(/Plank/i)).toBeInTheDocument();
  }, 15000);
});
