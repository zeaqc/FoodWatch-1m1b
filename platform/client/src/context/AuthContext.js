import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('fw_token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('fw_token'))
      .finally(() => setLoading(false));
  }, []);

  const setAuth = useCallback((user, token) => {
    if (token) localStorage.setItem('fw_token', token);
    setUser(user);
  }, []);

  const login = useCallback(async (emailOrUser, passwordOrToken) => {
    if (emailOrUser && typeof emailOrUser === 'object') {
      if (passwordOrToken) localStorage.setItem('fw_token', passwordOrToken);
      setUser(emailOrUser);
      return emailOrUser;
    }
    const { data } = await api.post('/auth/login', { email: emailOrUser, password: passwordOrToken });
    localStorage.setItem('fw_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fw_token');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, setUser, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
