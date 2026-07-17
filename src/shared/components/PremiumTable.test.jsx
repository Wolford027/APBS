import React from 'react';
import { render, screen } from '@testing-library/react';

import PremiumTable, { TableSkeleton, TableEmptyState } from './PremiumTable';

// PremiumTable is the shared shell used by every list page; these tests pin
// the contract the pages rely on: plain thead/tbody markup renders inside a
// real table, skeletons mirror the column count, and the empty state spans
// the full width with title/description/action.
describe('PremiumTable', () => {
  test('renders children markup inside a table', () => {
    render(
      <PremiumTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Jane Cruz</td>
            <td>Admin</td>
          </tr>
        </tbody>
      </PremiumTable>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Jane Cruz' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Admin' })).toBeInTheDocument();
  });
});

describe('TableSkeleton', () => {
  test('renders one row per `rows` and one cell per column', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableSkeleton
            rows={4}
            columns={['id', 'text', { variant: 'chip', align: 'center' }, 'buttons']}
          />
        </tbody>
      </table>
    );

    expect(container.querySelectorAll('tbody tr')).toHaveLength(4);
    expect(container.querySelectorAll('td[aria-hidden="true"]')).toHaveLength(16);
  });

  test('defaults to 6 rows', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableSkeleton columns={['id', 'text']} />
        </tbody>
      </table>
    );

    expect(container.querySelectorAll('tbody tr')).toHaveLength(6);
  });
});

describe('TableEmptyState', () => {
  test('renders title, description, and action spanning the full width', () => {
    render(
      <table>
        <tbody>
          <TableEmptyState
            colSpan={5}
            title="No employees yet"
            description="Add your first employee to get started."
            action={<button type="button">Add Employee</button>}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('No employees yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first employee to get started.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Employee' })).toBeInTheDocument();
    expect(screen.getByRole('cell')).toHaveAttribute('colspan', '5');
  });

  test('falls back to the default title when none is given', () => {
    render(
      <table>
        <tbody>
          <TableEmptyState colSpan={3} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });
});
