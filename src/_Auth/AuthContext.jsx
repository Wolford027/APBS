import React, { createContext, useContext, useEffect, useState } from 'react';

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

  const login = (userRole, userUsername) => {
    setIsAuthenticated(true);
    setRole(userRole);
    setUsername(userUsername); // Set username
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('role', userRole);
    localStorage.setItem('username', userUsername); // Save username
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUsername(null); // Clear username
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, username, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};