import { beforeEach, describe, expect, test, vi } from 'vitest';
import request from 'supertest';

vi.mock('../db.js', () => ({
  dbConfig: {},
  db: { query: vi.fn() },
  dbNew: { query: vi.fn(), execute: vi.fn() },
}));

import { db } from '../db.js';
import attendanceRoutes from '../routes/attendance.js';
import leaveRoutes from '../routes/leaves.js';
import { makeApp, stubQuery } from './helpers.js';

const attendanceApp = makeApp(attendanceRoutes);
const leaveApp = makeApp(leaveRoutes);

describe('attendance routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('POST /attendance-scan records a late time-in when no daily record exists', async () => {
    db.query
      .mockImplementationOnce((sql, params, cb) => {
        expect(sql).toContain('SELECT * FROM emp_attendance');
        expect(params).toEqual(['EMP-001', '2026-08-03']);
        cb(null, []);
      })
      .mockImplementationOnce((sql, params, cb) => {
        expect(sql).toContain('INSERT INTO emp_attendance');
        expect(params).toEqual(['EMP-001', '11:30', '2026-08-03', 'Late']);
        cb(null, { insertId: 12 });
      });

    const res = await request(attendanceApp)
      .post('/attendance-scan')
      .send({ emp_id: 'EMP-001', date: '2026-08-03', time: '11:30' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Time-in recorded (Late).' });
  });

  test('POST /attendance-scan records time-out totals for an existing time-in', async () => {
    db.query
      .mockImplementationOnce((sql, params, cb) => {
        expect(params).toEqual(['EMP-002', '2026-08-03']);
        cb(null, [{
          emp_id: 'EMP-002',
          time_in: '2026-08-03T11:00:00',
          time_out: null,
          break_in: '12:00:00',
          break_out: '12:30:00',
        }]);
      })
      .mockImplementationOnce((sql, params, cb) => {
        expect(sql).toContain('UPDATE emp_attendance');
        expect(params).toEqual([
          0.5,
          5.5,
          0.5,
          'Regular Day',
          '16:30',
          'Overtime',
          'EMP-002',
          '2026-08-03',
        ]);
        cb(null, { affectedRows: 1 });
      });

    const res = await request(attendanceApp)
      .post('/attendance-scan')
      .send({ emp_id: 'EMP-002', date: '2026-08-03', time: '16:30' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: 'Time-out recorded (Overtime).',
      total_break_hours: 0.5,
      total_hours: 5.5,
      total_ot_hours: 0.5,
      day_status: 'Regular Day',
    });
  });

  test('GET /scan/:rfid returns 404 when no employee matches the RFID', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('WHERE rfid = ?');
      expect(params).toEqual(['CARD-404']);
      cb(null, []);
    });

    const res = await request(attendanceApp).get('/scan/CARD-404');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'No employee found with this RFID' });
  });

  test('POST /register-rfid updates the selected employee RFID', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('UPDATE emp_info SET rfid');
      expect(params).toEqual(['RFID-1', 'EMP-003']);
      cb(null, { affectedRows: 1 });
    });

    const res = await request(attendanceApp)
      .post('/register-rfid')
      .send({ emp_id: 'EMP-003', rfid: 'RFID-1' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'RFID registered successfully!' });
  });
});

describe('leave routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('POST /emp_leave_save rejects missing required fields', async () => {
    const res = await request(leaveApp)
      .post('/emp_leave_save')
      .send({ emp_id: 'EMP-001' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Missing required fields' });
    expect(db.query).not.toHaveBeenCalled();
  });

  test('POST /emp_leave_save rejects duplicate leave records', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('SELECT * FROM emp_leave');
      expect(params).toEqual(['EMP-001', 2, '2026-08-03', '2026-08-04']);
      cb(null, [{ emp_id: 'EMP-001' }]);
    });

    const res = await request(leaveApp)
      .post('/emp_leave_save')
      .send({
        emp_id: 'EMP-001',
        leave_type_id: 2,
        leave_type_name: 'Sick Leave',
        date_start: '2026-08-03',
        date_end: '2026-08-04',
        leave_use: 2,
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already exists');
  });

  test('POST /emp_leave_save inserts leave and recomputes balance', async () => {
    db.query
      .mockImplementationOnce((sql, params, cb) => {
        expect(sql).toContain('SELECT * FROM emp_leave');
        cb(null, []);
      })
      .mockImplementationOnce((sql, params, cb) => {
        expect(sql).toContain('INSERT INTO emp_leave');
        expect(params).toEqual(['EMP-001', 2, 'Sick Leave', '2026-08-03', '2026-08-04', 2]);
        cb(null, { insertId: 9 });
      })
      .mockImplementationOnce((sql, params, cb) => {
        expect(sql).toContain('UPDATE emp_leave_balance');
        expect(params).toEqual(['EMP-001', 2]);
        cb(null, { affectedRows: 1 });
      });

    const res = await request(leaveApp)
      .post('/emp_leave_save')
      .send({
        emp_id: 'EMP-001',
        leave_type_id: 2,
        leave_type_name: 'Sick Leave',
        date_start: '2026-08-03',
        date_end: '2026-08-04',
        leave_use: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Leave data and balance updated successfully');
  });
});
