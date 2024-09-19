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
    return <div style={{backgroundColor: '#f7f7f7', padding: '20px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
      <h2 style={{fontSize: '24px', fontWeight: 600, color: '#222', marginBottom: '10px'}}>
        <i style={{fontSize: '24px', marginRight: '10px'}}></i> Access Denied
      </h2>
      <p style={{fontSize: '18px', color: '#333'}}>
        You do not have permission to view this page
      </p>
      <p style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>
        Please contact the administrator for more information
      </p>
    </div>
  }

  if (isAuthenticated && allowedRoles.includes(role) && location.pathname === '/') {
    return <Navigate to="/dashboard" replace={true} />;
  }

  return element;
};

export default ProtectedRoute;