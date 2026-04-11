import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authAPI, readerAuthAPI, publisherAuthAPI } from '../services/api';

export const AuthContext = createContext();

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
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
      let response;
      if (role === 'reader') {
        response = await readerAuthAPI.me();
      } else if (role === 'publisher') {
        response = await publisherAuthAPI.me();
      } else {
        response = await authAPI.me();
      }
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
        } else if (role === 'publisher') {
          await publisherAuthAPI.logout();
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
    const bootstrap = async () => {
      try {
        if (token) {
          await refreshUser();
        }
      } catch (error) {
        clearAuth();
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [token, refreshUser, clearAuth]);

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
        isAdmin: !token || (role !== 'reader' && role !== 'publisher'),
        isReader: role === 'reader',
        isPublisher: role === 'publisher',
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

