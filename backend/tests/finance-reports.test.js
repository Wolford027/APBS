import { beforeEach, describe, expect, test, vi } from 'vitest';
import request from 'supertest';

vi.mock('../db.js', () => ({
  dbConfig: {},
  db: { query: vi.fn() },
  dbNew: { query: vi.fn(), execute: vi.fn() },
}));

import { db, dbNew } from '../db.js';
import earningsRoutes from '../routes/earnings-deductions.js';
import loanRoutes from '../routes/loans.js';
import payrollRoutes from '../routes/payroll.js';
import payslipRoutes from '../routes/payslip.js';
import reportRoutes from '../routes/reports.js';
import { makeApp, stubQuery } from './helpers.js';

const earningsApp = makeApp(earningsRoutes);
const loanApp = makeApp(loanRoutes);
const payrollApp = makeApp(payrollRoutes);
const payslipApp = makeApp(payslipRoutes);
const reportApp = makeApp(reportRoutes);

describe('payroll routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('POST /ViewPayrollPart1 reports when payroll already exists for the date range', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('COUNT(*) AS count');
      expect(params).toEqual(['2026-08-01', '2026-08-15']);
      cb(null, [{ count: 1 }]);
    });

    const res = await request(payrollApp)
      .post('/ViewPayrollPart1')
      .send({ startDate: '2026-08-01', endDate: '2026-08-15' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: true, message: 'Payroll exists for the given dates.' });
  });

  test('POST /payroll inserts a payroll run and returns its id', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('INSERT INTO emp_payroll');
      expect(params).toEqual(['2026-08-01', '2026-08-15', 'Semi-Monthly', '1stCycle', '2026-08-20']);
      cb(null, { insertId: 22 });
    });

    const res = await request(payrollApp)
      .post('/payroll')
      .send({
        startDate: '2026-08-01',
        endDate: '2026-08-15',
        payrollType: 'Semi-Monthly',
        payrollCycle: '1stCycle',
        payrollDate: '2026-08-20',
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Payroll data saved successfully', id: 22 });
  });

  test('PUT /payroll-settings/:id enforces semi-monthly exclusivity across payroll settings', async () => {
    dbNew.query.mockResolvedValue([{}]);

    const res = await request(payrollApp)
      .put('/payroll-settings/10')
      .send({ paysett_value: 1 });

    expect(res.status).toBe(200);
    expect(dbNew.query).toHaveBeenCalledWith(
      'UPDATE settings_payroll SET paysett_value = ? WHERE paysett_id = ?',
      [1, '10']
    );
    expect(dbNew.query).toHaveBeenCalledWith(
      'UPDATE settings_payroll SET paysett_value = 0 WHERE paysett_id = 11'
    );
    expect(dbNew.query).toHaveBeenCalledWith(
      "UPDATE settings_payroll_2 SET paysett2_value = 1 WHERE paysett2_name = '1stCycle' "
    );
    expect(dbNew.query).toHaveBeenCalledWith(
      "UPDATE settings_payroll_2 SET paysett2_value = 0 WHERE paysett2_name = 'Monthly'"
    );
  });

  test('GET /payroll-settings returns toggle rows from the promise pool', async () => {
    const rows = [{ paysett_id: 10, paysett_name: 'Semi-Monthly', paysett_value: 1 }];
    dbNew.query.mockResolvedValue([rows]);

    const res = await request(payrollApp).get('/payroll-settings');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });
});

describe('loan routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('GET /CheckDuplicateGovernmentLoan returns whether an active duplicate exists', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain("status = 'Active'");
      expect(params).toEqual(['EMP-001', 'SSS', 'SALARY']);
      cb(null, [{ emp_id: 'EMP-001' }]);
    });

    const res = await request(loanApp)
      .get('/CheckDuplicateGovernmentLoan')
      .query({ emp_id: 'EMP-001', government_id: 'SSS', loan_type_id: 'SALARY' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: true });
  });

  test('POST /AddGovernmentLoans rejects invalid loan payloads', async () => {
    const res = await request(loanApp)
      .post('/AddGovernmentLoans')
      .send({ emp_id: 'EMP-001' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid loan data' });
    expect(dbNew.query).not.toHaveBeenCalled();
  });

  test('POST /AddCompanyLoans inserts required company loan data', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('INSERT INTO emp_company_loans');
      expect(params.slice(0, 3)).toEqual(['EMP-002', 'Company Cash', 'Emergency']);
      cb(null, { insertId: 7 });
    });

    const res = await request(loanApp)
      .post('/AddCompanyLoans')
      .send({
        emp_id: 'EMP-002',
        company_loan_name: 'Company Cash',
        company_loan_type: 'Emergency',
        loan_amount: 1000,
        loan_monthly_payment: 100,
        payment_terms: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Loan data added successfully' });
  });
});

describe('earnings and deductions routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('POST /submit_earnings_deductions rejects empty submissions', async () => {
    const res = await request(earningsApp)
      .post('/submit_earnings_deductions')
      .send({ earningsList: [] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'No data provided' });
    expect(db.query).not.toHaveBeenCalled();
  });

  test('POST /submit_earnings_deductions bulk inserts rows and returns inserted ids', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('VALUES ?');
      expect(params[0]).toEqual([
        [5, 2026, 'August', '1stCycle', 'Semi-Monthly', 'EMP-001', 'Jane Doe', 'Earning', 'Bonus', 500, 'Performance'],
        [5, 2026, 'August', '1stCycle', 'Semi-Monthly', 'EMP-002', 'John Smith', 'Deduction', 'Cash Advance', 200, 'Repayment'],
      ]);
      cb(null, { insertId: 40 });
    });

    const res = await request(earningsApp)
      .post('/submit_earnings_deductions')
      .send({
        earningsList: [
          {
            pay_earn_deduct_id: 5,
            year: 2026,
            month: 'August',
            cycle_type: '1stCycle',
            payroll_type: 'Semi-Monthly',
            emp_id: 'EMP-001',
            emp_fullname: 'Jane Doe',
            earning_or_deduction: 'Earning',
            pay_description: 'Bonus',
            amount: 500,
            remarks: 'Performance',
          },
          {
            pay_earn_deduct_id: 5,
            year: 2026,
            month: 'August',
            cycle_type: '1stCycle',
            payroll_type: 'Semi-Monthly',
            emp_id: 'EMP-002',
            emp_fullname: 'John Smith',
            earning_or_deduction: 'Deduction',
            pay_description: 'Cash Advance',
            amount: 200,
            remarks: 'Repayment',
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Earnings/Deductions data submitted successfully',
      insertIds: [40, 41],
    });
  });

  test('DELETE /delete_earn_deduct/:id returns 404 when no row is deleted', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('DELETE FROM emp_onetime_earn_deduct_per_emp');
      expect(params).toEqual(['999']);
      cb(null, { affectedRows: 0 });
    });

    const res = await request(earningsApp).delete('/delete_earn_deduct/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Record not found' });
  });
});

describe('report and payslip routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('POST /emp-report saves an employee report contract', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('INSERT INTO emp_report');
      expect(params).toEqual(['2026-08-03', 'Headcount', 'EMP-001', 'Jane Doe']);
      cb(null, { insertId: 3 });
    });

    const res = await request(reportApp)
      .post('/emp-report')
      .send({ date: '2026-08-03', details: 'Headcount', employeeId: 'EMP-001', employeeName: 'Jane Doe' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 1, message: 'Employee Report Created' });
  });

  test('GET /report/:id returns the first report row for an employee', async () => {
    const row = { emp_id: 'EMP-001', detail: 'Attendance' };
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('WHERE emp_id = ?');
      expect(params).toEqual(['EMP-001']);
      cb(null, [row]);
    });

    const res = await request(reportApp).get('/report/EMP-001');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(row);
  });

  test('GET /payslip/:id returns 404 when payroll data is missing', async () => {
    stubQuery(db.query, ({ sql, params, cb }) => {
      expect(sql).toContain('emp_payroll_part_1');
      expect(params).toEqual(['EMP-404']);
      cb(null, []);
    });

    const res = await request(payslipApp).get('/payslip/EMP-404');

    expect(res.status).toBe(404);
    expect(res.text).toBe('No data found for the given ID');
  });
});
