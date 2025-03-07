import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component for routes that require authentication
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute render:', { isLoading, isAuthenticated });

  // Show a simple loading message while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return children;
};

// Component for routes that require admin role
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  
  console.log('AdminRoute render:', { isLoading, isAuthenticated, isAdmin: isAdmin?.() });

  // Show a simple loading message while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // If not authenticated, redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/login?admin=true" state={{ from: location }} replace />;
  }
  
  // If not admin, redirect to unauthorized
  if (!isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If admin, render the children
  return children;
};

// Create a named object for default export
const ProtectedRoutes = { ProtectedRoute, AdminRoute };

export default ProtectedRoutes; 