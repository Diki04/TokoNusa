import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient, { ApiError } from '../services/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem('tokonusa_user');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setTokenState] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('tokonusa_token') || null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync token to API client
  const persistSession = useCallback((newToken, newUser) => {
    setTokenState(newToken);
    setUser(newUser);
    if (typeof window !== 'undefined' && window.localStorage) {
      if (newToken) {
        window.localStorage.setItem('tokonusa_token', newToken);
        apiClient.setToken(newToken);
      } else {
        window.localStorage.removeItem('tokonusa_token');
        apiClient.clearToken();
      }

      if (newUser) {
        window.localStorage.setItem('tokonusa_user', JSON.stringify(newUser));
      } else {
        window.localStorage.removeItem('tokonusa_user');
      }
    }
  }, []);

  const logout = useCallback(() => {
    persistSession(null, null);
    setAuthError(null);
  }, [persistSession]);

  // Validate session on initial load
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedToken = apiClient.getToken();
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const profile = await apiClient.auth.getProfile();
        if (isMounted) {
          setUser(profile);
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('tokonusa_user', JSON.stringify(profile));
          }
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const unsubscribe = apiClient.onUnauthorized(() => {
      logout();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [logout]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await apiClient.auth.login({ email, password });
      const authToken = result.token || result.accessToken;
      const userProfile = result.user || result;

      persistSession(authToken, userProfile);
      return { success: true, user: userProfile };
    } catch (err) {
      const message = err.message || 'Login gagal, periksa email & kata sandi Anda';
      setAuthError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await apiClient.auth.register(userData);
      const authToken = result.token || result.accessToken;
      const userProfile = result.user || result;

      if (authToken) {
        persistSession(authToken, userProfile);
      }
      return { success: true, data: result };
    } catch (err) {
      const message = err.message || 'Pendaftaran gagal';
      setAuthError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
