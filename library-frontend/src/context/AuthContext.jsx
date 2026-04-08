import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authAPI, readerAuthAPI } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'admin');
  const [initializing, setInitializing] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setRole('admin');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }, []);

  const login = (userData, authToken, authRole = 'admin') => {
    setUser(userData);
    setToken(authToken);
    setRole(authRole);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    localStorage.setItem('role', authRole);
  };

  const refreshUser = useCallback(async () => {
    if (!token) {
      clearAuth();
      return null;
    }

    try {
      const response = role === 'reader' ? await readerAuthAPI.me() : await authAPI.me();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      clearAuth();
      return null;
    }
  }, [token, role, clearAuth]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        if (role === 'reader') {
          await readerAuthAPI.logout();
        } else {
          await authAPI.logout();
        }
      }
    } catch (error) {
      // Ignore API logout errors and clear local state regardless.
    } finally {
      clearAuth();
    }
  }, [token, role, clearAuth]);

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
        role,
        isAdmin: !token || role !== 'reader',
        isReader: role === 'reader',
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

