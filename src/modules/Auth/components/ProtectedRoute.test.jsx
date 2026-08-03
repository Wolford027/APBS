import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../hooks/AuthContext';
import ProtectedRoute from './ProtectedRoute';

function renderProtected({ initialPath = '/payroll', role, authenticated = true } = {}) {
  localStorage.clear();
  if (authenticated) {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('role', role);
    localStorage.setItem('username', 'tester');
  }

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/payroll"
            element={
              <ProtectedRoute
                allowedRoles={['Admin', 'Accountant']}
                element={<div>Payroll Workspace</div>}
              />
            }
          />
          <Route path="/login" element={<div>Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('redirects unauthenticated users to login', async () => {
    renderProtected({ authenticated: false });

    expect(await screen.findByText('Login Screen')).toBeInTheDocument();
  });

  test('renders the protected element for an allowed role', async () => {
    renderProtected({ role: 'Accountant' });

    expect(await screen.findByText('Payroll Workspace')).toBeInTheDocument();
  });

  test('shows access denied for an authenticated but disallowed role', async () => {
    renderProtected({ role: 'HR' });

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
    expect(screen.queryByText('Payroll Workspace')).not.toBeInTheDocument();
  });
});
