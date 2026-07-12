import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const { isAuthenticated, role, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="isAuthenticated">{String(isAuthenticated)}</span>
      <span data-testid="role">{String(role)}</span>
      <button onClick={() => login('Admin', 'admin')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('login sets isAuthenticated/role in context and localStorage', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('login'));

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('role')).toHaveTextContent('Admin');
    expect(localStorage.getItem('isAuthenticated')).toBe('true');
    expect(localStorage.getItem('role')).toBe('Admin');
  });

  test('logout clears context and localStorage', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('login'));
    await userEvent.click(screen.getByText('logout'));

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
  });

  // Regression test for: after logging in, the app bounced from /loading
  // back to /login. Root cause: AuthProvider recreated `login`/`logout` on
  // every render, so login()'s own setState triggered a re-render that
  // handed consumers a *new* `logout` reference. Login.jsx has
  // `useEffect(() => { logout() }, [logout])` to clear stale sessions on
  // mount — with an unstable reference, that effect re-fired right after a
  // fresh login and wiped the session it had just set. The fix wraps
  // login/logout in useCallback and the context value in useMemo so their
  // identity only changes when the underlying state actually changes.
  test('login()/logout() identity stays stable across re-renders, so a mount-effect keyed on logout does not refire after login', async () => {
    const logoutRefs = [];

    function EffectProbe() {
      const { login, logout, isAuthenticated } = useAuth();
      React.useEffect(() => {
        logoutRefs.push(logout);
      }, [logout]);
      return (
        <div>
          <span data-testid="auth-state">{String(isAuthenticated)}</span>
          <button onClick={() => login('Admin', 'admin')}>login</button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <EffectProbe />
      </AuthProvider>
    );

    expect(logoutRefs).toHaveLength(1); // one run, on mount

    await userEvent.click(screen.getByText('login'));

    expect(screen.getByTestId('auth-state')).toHaveTextContent('true');
    // If `logout` had a new identity after login(), this effect (keyed on
    // [logout]) would have run again.
    expect(logoutRefs).toHaveLength(1);
    expect(localStorage.getItem('isAuthenticated')).toBe('true');
  });
});
