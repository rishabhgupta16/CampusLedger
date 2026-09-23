import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

/**
 * Gates any route behind authentication. Distinguishes "still figuring out
 * if we're logged in" (renders a loader, never the app shell) from
 * "definitely not logged in" (redirect to /login) from "logged in" (render).
 * Onboarding-completion gating is handled separately in App.jsx, since that
 * depends on FinanceContext, not auth state.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
