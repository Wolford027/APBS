import { describe, test, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../db.js', () => ({
  dbConfig: {},
  db: { query: vi.fn() },
  dbNew: { query: vi.fn(), execute: vi.fn() },
}));

import { db } from '../db.js';
import systemVariableRoutes from '../routes/system-variables.js';
import { makeApp, stubQuery } from './helpers.js';

const app = makeApp(systemVariableRoutes);

// The get-* routes in system-variables.js all share the same
// select-and-return shape; exercising a representative pair pins the
// success and failure contracts for the whole family.
describe('system variable routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('GET /get-dmb returns the sys_dmb rows', async () => {
    const rows = [{ id: 1, dmb_name: 'Monthly' }];
    stubQuery(db.query, ({ sql, cb }) => {
      expect(sql).toContain('sys_dmb');
      cb(null, rows);
    });

    const res = await request(app).get('/get-dmb');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });

  test('GET /get-dmb 500s with an error payload when the query fails', async () => {
    stubQuery(db.query, ({ cb }) => cb(new Error('db down')));

    const res = await request(app).get('/get-dmb');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch DMB values' });
  });

  test('GET /get-tax returns the sys_tax rows', async () => {
    const rows = [{ id: 3, bracket: '250k and below', rate: 0 }];
    stubQuery(db.query, ({ sql, cb }) => {
      expect(sql).toContain('sys_tax');
      cb(null, rows);
    });

    const res = await request(app).get('/get-tax');

    expect(res.body).toEqual(rows);
  });

  test('GET /get-leave-type returns leave types', async () => {
    const rows = [{ id: 2, leave_type: 'Sick Leave' }];
    stubQuery(db.query, ({ cb }) => cb(null, rows));

    const res = await request(app).get('/get-leave-type');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });
});
