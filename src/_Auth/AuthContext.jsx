import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
    const storedRole = localStorage.getItem('role');
    
    if (storedIsAuthenticated === 'true') {
      setIsAuthenticated(true);
      setRole(storedRole);
    }
    
    setLoading(false); // Done loading after checking localStorage
  }, []);

  const login = (userRole) => {
    setIsAuthenticated(true);
    setRole(userRole);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('role', userRole);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};