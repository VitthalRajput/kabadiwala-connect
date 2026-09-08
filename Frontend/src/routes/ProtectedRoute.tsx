import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';
import { Loader } from '../components/common/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullPage text="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role guard
  if (allowedRole && role !== allowedRole) {
    // Redirect to proper role dashboard
    const correctPath = role === 'recycler' ? '/recycler/dashboard' : '/seller/dashboard';
    return <Navigate to={correctPath} replace />;
  }

  return <>{children}</>;
};

