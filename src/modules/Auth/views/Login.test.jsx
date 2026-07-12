import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import { AuthProvider } from '../hooks/AuthContext';

jest.mock('axios');

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/loading" element={<div>LOADING_SCREEN</div>} />
          <Route path="/dashboard" element={<div>DASHBOARD_SCREEN</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    axios.post.mockReset();
  });

  // Regression test for the reported bug: "after I login it redirects to
  // loading and after that it goes to login page again". The backend
  // returns role "Admin" (capitalized), which routes through /loading; the
  // session used to get wiped moments later by AuthContext's identity bug
  // (see AuthContext.test.jsx), bouncing the user back to /login.
  test('successful login persists the session past the /loading redirect', async () => {
    axios.post.mockImplementation((url) => {
      if (url.includes('/login-history')) return Promise.resolve({ data: {} });
      if (url.includes('/login')) {
        return Promise.resolve({ data: { message: 'Log in Successfully', role: 'Admin', emp_id: 1 } });
      }
      return Promise.reject(new Error(`unexpected POST ${url}`));
    });

    renderLogin();

    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/^password/i), 'admin123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText('LOADING_SCREEN')).toBeInTheDocument());

    expect(localStorage.getItem('isAuthenticated')).toBe('true');
    expect(localStorage.getItem('role')).toBe('Admin');

    // Give any stray re-render-triggered effects a chance to run before
    // asserting the session is still intact.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(localStorage.getItem('isAuthenticated')).toBe('true');
    expect(screen.getByText('LOADING_SCREEN')).toBeInTheDocument();
  });

  test('failed login shows an inline error and does not navigate away', async () => {
    axios.post.mockResolvedValue({ data: 'No Record Found' });

    renderLogin();

    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/^password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/wrong password or username/i)).toBeInTheDocument();
    expect(screen.queryByText('LOADING_SCREEN')).not.toBeInTheDocument();
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
  });

  test('toggling the visibility icon reveals the password', async () => {
    renderLogin();

    const passwordInput = screen.getByLabelText(/^password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByLabelText(/show password/i));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
