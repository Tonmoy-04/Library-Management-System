import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [initializing, setInitializing] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const refreshUser = useCallback(async () => {
    if (!token) {
      clearAuth();
      return null;
    }

    try {
      const response = await authAPI.me();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      clearAuth();
      return null;
    }
  }, [token, clearAuth]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      // Ignore API logout errors and clear local state regardless.
    } finally {
      clearAuth();
    }
  }, [token, clearAuth]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (token && !user) {
        await refreshUser();
      }

      if (mounted) {
        setInitializing(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [token, user, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshUser,
        initializing,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

