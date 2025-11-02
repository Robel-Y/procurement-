// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireSupplier = false 
}) => {
  const { user, loading, isAdmin, isSupplier } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requireAdmin && !isAdmin) {
    console.log('Admin access required, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  if (requireSupplier && !isSupplier) {
    console.log('Supplier access required, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;