import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';
import AppLayout from './components/layout/AppLayout';

// Pages — route-level code splitting (Phase B9). Each page loads on demand
// instead of all being bundled into the single initial chunk; Recharts in
// particular (pulled in by Budget/Goals/SpendingOverview/Dashboard's charts)
// no longer has to load before a user can even reach the login screen.
// LoadingScreen (already used for the auth-restoration loading state below)
// doubles as the Suspense fallback so there's no new loading UI to design.
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions/Transactions'));
// SpendingOverview renders the "/analytics" route — file renamed from
// Analytics.jsx in Phase B8 to avoid a browser content-blocker path match;
// the route, nav label, and page title all remain "Analytics" (see the
// component file's own comment for details).
const SpendingOverview = lazy(() => import('./pages/SpendingOverview/SpendingOverview'));
const Budget = lazy(() => import('./pages/Budget/Budget'));
const Goals = lazy(() => import('./pages/Goals/Goals'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Onboarding = lazy(() => import('./pages/Onboarding/Onboarding'));

function AppRoutes() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Never render the app shell (or a stale login form) while we're still
  // figuring out whether a stored token is valid.
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Onboarding-completion is authoritative from MongoDB (Phase B5) via
  // AuthContext's user object — not a local FinanceContext flag. This is the
  // single source of truth for this routing decision; FinanceContext no
  // longer tracks it at all.
  const needsOnboarding = isAuthenticated && user && !user.onboardingCompleted;
  const postAuthRedirect = needsOnboarding ? '/onboarding' : '/';

  return (
    <Suspense fallback={<LoadingScreen />}>
    <Routes>
      {/* Public auth routes — already-authenticated users are redirected away */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={postAuthRedirect} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={postAuthRedirect} replace /> : <Register />}
      />

      {/* Onboarding (always accessible once authenticated, for re-configuration) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Main App Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {needsOnboarding ? <Navigate to="/onboarding" replace /> : <AppLayout />}
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="analytics" element={<SpendingOverview />} />
        <Route path="budget" element={<Budget />} />
        <Route path="goals" element={<Goals />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={isAuthenticated ? postAuthRedirect : '/login'} replace />} />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
