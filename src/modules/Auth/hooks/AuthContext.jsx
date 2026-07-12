import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [username, setUsername] = useState(null); // Add this line

  useEffect(() => {
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
    const storedRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username'); // Add this line
    
    if (storedIsAuthenticated === 'true') {
      setIsAuthenticated(true);
      setRole(storedRole);
      setUsername(storedUsername); // Set username
    }
    
    setLoading(false); // Done loading after checking localStorage
  }, []);

  const login = useCallback((userRole, userUsername) => {
    setIsAuthenticated(true);
    setRole(userRole);
    setUsername(userUsername); // Set username
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('role', userRole);
    localStorage.setItem('username', userUsername); // Save username
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setRole(null);
    setUsername(null); // Clear username
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  }, []);

  // Stable identity: without this, every login()/logout() state update
  // creates a new context value, which re-fires any consumer's
  // `useEffect(..., [logout])` — e.g. Login.jsx calls logout() on mount,
  // and an unstable reference made it re-fire right after a fresh login,
  // wiping the session it had just set.
  const value = useMemo(
    () => ({ isAuthenticated, role, username, login, logout, loading }),
    [isAuthenticated, role, username, login, logout, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};