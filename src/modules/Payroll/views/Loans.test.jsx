import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

import Loan from './Loans';

jest.mock('axios');
// SideNav pulls in routing/auth context and ViewListLoans fetches its own
// data; both are outside what this view test pins down.
jest.mock('../../../shared/components/SideNav', () => () => <div data-testid="sidenav" />);
jest.mock('../components/ViewListLoans', () => () => null);

const LOAN_RECORDS = [
  {
    emp_loans_id: 7,
    emp_loans_date: '2026-07-01',
    emp_date_coverage: 'July 1 - July 15, 2026',
    emp_loans_payroll_type: 'Semi-Monthly',
    emp_loans_payroll_cycle: 'First Cycle',
  },
];

const LOAN_SUMMARIES = [
  {
    emp_id: 'EMP-001',
    loan_type_name: 'SSS Loan',
    loan_amount: '1500.00',
    penalty: '0.00',
    total_loan: '1500.00',
    payment_terms: 6,
  },
];

// Renders the view and flushes the initial /emp-loans fetch inside act so
// state updates from the effect don't leak outside the test's control.
async function renderLoans() {
  let utils;
  await act(async () => {
    utils = render(<Loan />);
  });
  return utils;
}

describe('Loans view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows the loading skeleton, then the empty state when there are no loan runs', async () => {
    let resolveFetch;
    axios.get.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));
    const { container } = render(<Loan />);

    expect(container.querySelectorAll('td[aria-hidden="true"]').length).toBeGreaterThan(0);
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8800/emp-loans');

    await act(async () => resolveFetch({ data: [] }));

    expect(screen.getByText('No loan runs yet')).toBeInTheDocument();
    expect(container.querySelectorAll('td[aria-hidden="true"]')).toHaveLength(0);
  });

  test('renders a row per loan run', async () => {
    axios.get.mockResolvedValue({ data: LOAN_RECORDS });
    await renderLoans();

    expect(screen.getByRole('cell', { name: '2026-07-01' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'July 1 - July 15, 2026' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Semi-Monthly' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
  });

  test('clicking View opens the Loan Summary modal with the fetched entries', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/emp_loan_summary/')) {
        return Promise.resolve({ data: LOAN_SUMMARIES });
      }
      return Promise.resolve({ data: LOAN_RECORDS });
    });
    await renderLoans();

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'View' }));
    });

    expect(screen.getByText('Loan Summary')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith('http://localhost:8800/emp_loan_summary/2026-07-01');
    expect(screen.getByText('Coverage: July 1 - July 15, 2026')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'SSS Loan' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'EMP-001' })).toBeInTheDocument();
  });

  test('shows an error inside the modal when the summary fetch fails', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/emp_loan_summary/')) {
        return Promise.reject(new Error('server down'));
      }
      return Promise.resolve({ data: LOAN_RECORDS });
    });
    await renderLoans();

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'View' }));
    });

    expect(screen.getByText('No loan summary found or server error.')).toBeInTheDocument();
  });
});
