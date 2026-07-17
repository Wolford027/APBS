import { describe, test, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../db.js', () => ({
  dbConfig: {},
  db: { query: vi.fn() },
  dbNew: { query: vi.fn(), execute: vi.fn() },
}));
vi.mock('../upload.js', () => ({
  upload: { single: () => (req, res, next) => next() },
  uploadDB: { single: () => (req, res, next) => next() },
}));

import { db } from '../db.js';
import employeeRoutes from '../routes/employees.js';
import { makeApp, stubQuery } from './helpers.js';

const app = makeApp(employeeRoutes);

describe('employee routes', () => {
  beforeEach(() => vi.clearAllMocks());

  test('GET /emp returns only non-archived employees', async () => {
    const rows = [{ emp_id: 'EMP-001', first_name: 'Jane', is_archive: 0 }];
    stubQuery(db.query, ({ sql, cb }) => {
      expect(sql).toContain('is_archive = 0');
      cb(null, rows);
    });

    const res = await request(app).get('/emp');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });

  test('GET /emp/:id queries by the employee id', async () => {
    const rows = [{ emp_id: 'EMP-007', first_name: 'Juan' }];
    stubQuery(db.query, ({ params, cb }) => {
      expect(params).toEqual(['EMP-007']);
      cb(null, rows);
    });

    const res = await request(app).get('/emp/EMP-007');

    expect(res.body).toEqual(rows);
  });

  test('PUT /emp/:id updates the archive flag and confirms', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('UPDATE emp_info SET is_archive');
      expect(params).toEqual([0, 'EMP-003']);
      cb(null, { affectedRows: 1 });
    });

    const res = await request(app).put('/emp/EMP-003').send({ is_archive: 0 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 1, message: 'Employee unarchived successfully' });
  });

  test('GET /count_emp returns the active-employee count', async () => {
    stubQuery(db.query, ({ sql, cb }) => {
      expect(sql).toContain('COUNT(*)');
      expect(sql).toContain('is_archive = 0');
      cb(null, [{ count: 12 }]);
    });

    const res = await request(app).get('/count_emp');

    expect(res.body).toEqual([{ count: 12 }]);
  });

  test('GET /archived returns archived employees', async () => {
    const rows = [{ emp_id: 'EMP-009', is_archive: 1 }];
    stubQuery(db.query, ({ sql, cb }) => {
      expect(sql).toContain('is_archive = 1');
      cb(null, rows);
    });

    const res = await request(app).get('/archived');

    expect(res.body).toEqual(rows);
  });
});
