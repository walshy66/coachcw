import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSession, getSession, updateSession } from '../../src/services/sessionService';
import type { SessionDraft } from '../../src/features/session/types';

const baseSession: SessionDraft = {
  date: '2025-01-15',
  location: 'Contract Gym',
  trainer: 'Coach Carter',
  athlete: 'Jordan',
  participants: ['Jordan'],
  microCycleId: 'mc-1',
  exercises: [
    { id: 'temp-1', name: 'Bench Press', sets: 3, reps: 8, load: 60, order: 1 },
    { id: 'temp-2', name: 'Run', durationSeconds: 900, order: 2 },
  ],
};

describe('Session API contract', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('aligns create response with required fields', async () => {
    const mockResponse = {
      id: 'session-123',
      date: baseSession.date,
      startTime: null,
      endTime: null,
      durationMinutes: null,
      location: baseSession.location,
      trainer: baseSession.trainer,
      athlete: baseSession.athlete,
      participants: baseSession.participants,
      microCycleId: baseSession.microCycleId,
      notes: '',
      exercises: [
        { ...baseSession.exercises[0], id: 'ex-10' },
        { ...baseSession.exercises[1], id: 'ex-11' },
      ],
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await createSession(baseSession);
    expect(result.id).toBe(mockResponse.id);
    expect(result.date).toBe(baseSession.date);
    expect(result.exercises[0].id).toBe('ex-10');
    expect(result.createdAt).toBeTruthy();
    expect(result.updatedAt).toBeTruthy();
  });

  it('preserves exercise ordering on update', async () => {
    const mockResponse = {
      ...baseSession,
      id: 'session-200',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T11:00:00Z',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await updateSession('session-200', baseSession);
    expect(result.exercises[0].order).toBe(1);
    expect(result.exercises[1].order).toBe(2);
  });

  it('returns fallback data when GET fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    const result = await getSession('missing-session');
    expect(result.id).toBeTruthy();
    expect(result.exercises.length).toBeGreaterThan(0);
    expect(result.date).toBeTruthy();
  });
});
