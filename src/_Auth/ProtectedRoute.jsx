import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <div>You do not have permission to view this page</div>;
  }

  if (isAuthenticated && allowedRoles.includes(role) && location.pathname === '/') {
    return <Navigate to="/dashboard" replace={true} />;
  }

  return element;
};

export default ProtectedRoute;