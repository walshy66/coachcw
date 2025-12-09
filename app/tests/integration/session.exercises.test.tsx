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
        { id: 'ex-2', name: 'Row', durationSeconds: 900, order: 2 },
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
        { id: 'ex-2', name: 'Row', durationSeconds: 900, order: 2 },
      ],
      notes: '',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    });

    render(<SessionPage />);

    await user.type(screen.getByLabelText(/Date/i), '2025-01-02');
    await user.click(screen.getByRole('button', { name: /Add exercise/i }));

    const [name1] = screen.getAllByTestId('exercise-name-input');
    await user.type(name1, 'Back Squat');
    await user.selectOptions(screen.getByLabelText(/Sets/i), '3');
    const repInputs = screen.getAllByLabelText(/Reps \(set/i);
    await user.type(repInputs[0], '5');
    await user.type(repInputs[1], '5');
    await user.type(repInputs[2], '5');
    const loadInputs = screen.getAllByLabelText(/Load \(kg\) set/i);
    await user.type(loadInputs[0], '100');
    await user.type(loadInputs[1], '100');
    await user.type(loadInputs[2], '100');
    await user.click(screen.getAllByRole('button', { name: /Save exercise/i })[0]);

    await user.click(screen.getByRole('button', { name: /Add exercise/i }));
    const nameInputs = screen.getAllByTestId('exercise-name-input');
    await user.type(nameInputs[nameInputs.length - 1], 'Row');
    const setsSelects = screen.getAllByLabelText(/Sets/i);
    await user.selectOptions(setsSelects[setsSelects.length - 1], '1');
    const durationInputs = screen.getAllByLabelText(/Duration \(sec\)/i);
    await user.type(durationInputs[durationInputs.length - 1], '900');
    await user.click(screen.getAllByRole('button', { name: /Save exercise/i })[1]);

    await user.click(screen.getByRole('button', { name: /Save session/i }));

    await waitFor(() => expect(createSessionMock).toHaveBeenCalled());
    expect(await screen.findByText(/Session saved/i)).toBeInTheDocument();

    expect(await screen.findByText(/Back Squat/i)).toBeInTheDocument();
    expect(await screen.findByText(/Row/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reload last saved/i }));
    await waitFor(() => expect(getSessionMock).toHaveBeenCalledWith('session-10'));
    expect(await screen.findAllByText(/Row/i)).not.toHaveLength(0);
  });

  it('updates an existing session when an id exists', async () => {
    const user = userEvent.setup();
    createSessionMock.mockResolvedValue({
      id: 'session-11',
      date: '2025-01-03',
      exercises: [{ id: 'ex-1', name: 'Press', sets: 3, reps: 8, load: 40, order: 1 }],
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z',
      notes: '',
    });
    updateSessionMock.mockResolvedValue({
      id: 'session-11',
      date: '2025-01-03',
      exercises: [
        { id: 'ex-1', name: 'Press', sets: 4, reps: 8, load: 45, order: 1 },
        { id: 'ex-2', name: 'Plank', durationSeconds: 120, order: 2 },
      ],
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T01:00:00Z',
      notes: '',
    });

    render(<SessionPage />);
    await user.type(screen.getByLabelText(/Date/i), '2025-01-03');
    await user.click(screen.getByRole('button', { name: /Add exercise/i }));
    await user.type(screen.getAllByTestId('exercise-name-input')[0], 'Press');
    await user.selectOptions(screen.getByLabelText(/Sets/i), '3');
    const repInputs = screen.getAllByLabelText(/Reps \(set/i);
    await user.type(repInputs[0], '8');
    await user.type(repInputs[1], '8');
    await user.type(repInputs[2], '8');
    const loadInputs = screen.getAllByLabelText(/Load \(kg\) set/i);
    await user.type(loadInputs[0], '40');
    await user.type(loadInputs[1], '40');
    await user.type(loadInputs[2], '40');
    await user.click(screen.getByRole('button', { name: /Save session/i }));
    await waitFor(() => expect(createSessionMock).toHaveBeenCalled());

    const nameInputs = screen.getAllByTestId('exercise-name-input');
    await user.clear(nameInputs[0]);
    await user.type(nameInputs[0], 'Press');
    await user.selectOptions(screen.getAllByLabelText(/Sets/i)[0], '4');
    const updatedRepInputs = screen.getAllByLabelText(/Reps \(set/i);
    await user.type(updatedRepInputs[0], '8');
    await user.type(updatedRepInputs[1], '8');
    await user.type(updatedRepInputs[2], '8');
    await user.type(updatedRepInputs[3], '8');
    const updatedLoadInputs = screen.getAllByLabelText(/Load \(kg\) set/i);
    await user.type(updatedLoadInputs[0], '45');
    await user.type(updatedLoadInputs[1], '45');
    await user.type(updatedLoadInputs[2], '45');
    await user.type(updatedLoadInputs[3], '45');
    await user.click(screen.getByRole('button', { name: /Add exercise/i }));
    await user.selectOptions(screen.getAllByLabelText(/Sets/i)[1], '1');
    const durationInputs = screen.getAllByLabelText(/Duration \(sec\)/i);
    await user.type(durationInputs[1], '120');
    const secondName = screen.getAllByTestId('exercise-name-input')[1];
    await user.type(secondName, 'Plank');
    await user.click(screen.getAllByRole('button', { name: /Save exercise/i })[0]);
    await user.click(screen.getAllByRole('button', { name: /Save exercise/i })[1]);

    await user.click(screen.getByRole('button', { name: /Save session/i }));
    await waitFor(() => expect(updateSessionMock).toHaveBeenCalledWith('session-11', expect.anything()));
    expect(await screen.findByText(/Plank/i)).toBeInTheDocument();
  });
});
