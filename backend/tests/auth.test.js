import { describe, test, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../db.js', () => ({
  dbConfig: {},
  db: { query: vi.fn() },
  dbNew: { query: vi.fn(), execute: vi.fn() },
}));

import { db } from '../db.js';
import authRoutes from '../routes/auth.js';
import { makeApp, stubQuery } from './helpers.js';

const app = makeApp(authRoutes);

describe('POST /login', () => {
  beforeEach(() => vi.clearAllMocks());

  test('returns role and emp_id when credentials match', async () => {
    stubQuery(db.query, ({ params, cb }) => {
      expect(params).toEqual(['admin', 'secret']);
      cb(null, [{ emp_id: 'EMP-001', role: 'Admin' }]);
    });

    const res = await request(app)
      .post('/login')
      .send({ user: 'admin', password: 'secret' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Log in Successfully',
      role: 'Admin',
      emp_id: 'EMP-001',
    });
  });

  test('accepts `username` as an alias for `user`', async () => {
    stubQuery(db.query, ({ params, cb }) => {
      expect(params).toEqual(['hr_user', 'pw']);
      cb(null, [{ emp_id: 'EMP-002', role: 'HR' }]);
    });

    const res = await request(app)
      .post('/login')
      .send({ username: 'hr_user', password: 'pw' });

    expect(res.body.role).toBe('HR');
  });

  test('returns "No Record Found" for wrong credentials', async () => {
    stubQuery(db.query, ({ cb }) => cb(null, []));

    const res = await request(app)
      .post('/login')
      .send({ user: 'ghost', password: 'nope' });

    expect(res.status).toBe(200);
    expect(res.body).toBe('No Record Found');
  });

  test('returns "Error" when the database query fails', async () => {
    stubQuery(db.query, ({ cb }) => cb(new Error('connection lost')));

    const res = await request(app)
      .post('/login')
      .send({ user: 'admin', password: 'secret' });

    expect(res.body).toBe('Error');
  });
});

describe('GET /username', () => {
  beforeEach(() => vi.clearAllMocks());

  test('400s when no username is provided', async () => {
    const res = await request(app).get('/username');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Username is required' });
    expect(db.query).not.toHaveBeenCalled();
  });

  test('reports whether the username exists', async () => {
    stubQuery(db.query, ({ cb }) => cb(null, [{ username: 'admin' }]));
    const taken = await request(app).get('/username').query({ username: 'admin' });
    expect(taken.body).toEqual({ usernameExists: true });

    stubQuery(db.query, ({ cb }) => cb(null, []));
    const free = await request(app).get('/username').query({ username: 'newuser' });
    expect(free.body).toEqual({ usernameExists: false });
  });
});

describe('GET /fetch-audit', () => {
  beforeEach(() => vi.clearAllMocks());

  test('returns the login history rows', async () => {
    const rows = [{ username: 'admin', action: 'Log In' }];
    stubQuery(db.query, ({ cb }) => cb(null, rows));

    const res = await request(app).get('/fetch-audit');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });

  test('500s when the query fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    stubQuery(db.query, ({ cb }) => cb(new Error('boom')));

    const res = await request(app).get('/fetch-audit');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Error fetching login history' });
  });
});
