import React from 'react';
import { useAuth } from '../_Auth/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}