import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { getToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

/**
 * Owns authentication state only — the current user, whether we're still
 * figuring that out on startup, and login/register/logout actions.
 * Deliberately knows nothing about transactions/budgets/goals; that stays
 * FinanceContext's responsibility.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // On startup: if a token is already stored, verify it against the server
  // and restore the session. An invalid/expired token is discarded rather
  // than left around to fail again on every subsequent request.
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = getToken();
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const data = await authService.getCurrentUser();
        if (isMounted) setUser(data.user);
      } catch (error) {
        clearToken();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      return data.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setAuthError(null);
    try {
      const data = await authService.register({ name, email, password });
      setUser(data.user);
      return data.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setAuthError(null);
  }, []);

  // Merges a server-confirmed partial user (e.g. the response from a
  // profile/onboarding update elsewhere) into the current user, so
  // AuthContext stays in sync without a refresh or a redundant /auth/me
  // round-trip. Never makes its own API call — callers pass already-fetched
  // data.
  const updateUser = useCallback((partialUser) => {
    setUser((prev) => (prev ? { ...prev, ...partialUser } : partialUser));
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    authError,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
