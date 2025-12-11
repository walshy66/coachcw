import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildServer } from '../../src/server';
import * as programService from '../../src/modules/programs/service';
import * as sessionService from '../../src/modules/sessions/service';

describe('Program and session routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  it('returns the current program', async () => {
    vi.spyOn(programService, 'getCurrentProgram').mockResolvedValue({
      id: 'program-001',
      athleteId: 'athlete-001',
      title: 'Base Build',
      status: 'ACTIVE',
      validationFlag: true,
      updatedAt: new Date().toISOString(),
      phases: []
    } as programService.ProgramDto);

    const res = await request(app.server).get('/api/v1/programs/me/current').set('x-actor-id', 'athlete-001');
    expect(res.status).toBe(200);
    expect(res.body.program.id).toBe('program-001');
  });

  it('lists sessions for the active athlete', async () => {
    vi.spyOn(sessionService, 'getSessions').mockResolvedValue([
      {
        id: 'session-001',
        athleteId: 'athlete-001',
        programId: 'program-001',
        scheduledAt: new Date().toISOString(),
        durationMin: 60,
        status: 'PLANNED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ] as sessionService.SessionDto[]);

    const res = await request(app.server).get('/api/v1/sessions').set('x-actor-id', 'athlete-001');
    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(1);
  });

  it('fetches a session by id', async () => {
    vi.spyOn(sessionService, 'getSessionById').mockResolvedValue({
      id: 'session-123',
      athleteId: 'athlete-001',
      programId: 'program-001',
      scheduledAt: new Date().toISOString(),
      durationMin: 45,
      status: 'PLANNED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as sessionService.SessionDto);

    const res = await request(app.server).get('/api/v1/sessions/session-123').set('x-actor-id', 'athlete-001');
    expect(res.status).toBe(200);
    expect(res.body.session.id).toBe('session-123');
  });

  it('creates a new session', async () => {
    vi.spyOn(sessionService, 'scheduleSession').mockResolvedValue({
      id: 'session-002',
      athleteId: 'athlete-001',
      programId: 'program-001',
      scheduledAt: new Date().toISOString(),
      durationMin: 45,
      status: 'PLANNED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as sessionService.SessionDto);

    const res = await request(app.server)
      .post('/api/v1/sessions')
      .set('x-actor-id', 'athlete-001')
      .send({
        programId: 'program-001',
        scheduledAt: new Date().toISOString(),
        durationMin: 45
      });

    expect(res.status).toBe(201);
    expect(res.body.session.id).toBe('session-002');
  });

  it('updates a session', async () => {
    vi.spyOn(sessionService, 'updateSessionForAthlete').mockResolvedValue({
      id: 'session-001',
      athleteId: 'athlete-001',
      programId: 'program-001',
      scheduledAt: new Date().toISOString(),
      durationMin: 45,
      status: 'COMPLETE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as sessionService.SessionDto);

    const res = await request(app.server)
      .patch('/api/v1/sessions/session-001')
      .set('x-actor-id', 'athlete-001')
      .send({ status: 'COMPLETE' });

    expect(res.status).toBe(200);
    expect(res.body.session.status).toBe('COMPLETE');
  });
});
