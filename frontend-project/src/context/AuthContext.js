import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/authAPI';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('crpms_token');
    const saved = localStorage.getItem('crpms_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authAPI.login({ username, password });
    localStorage.setItem('crpms_token', res.data.token);
    localStorage.setItem('crpms_user',  JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('crpms_token');
    localStorage.removeItem('crpms_user');
    setUser(null);
    toast.success('Logged out');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
