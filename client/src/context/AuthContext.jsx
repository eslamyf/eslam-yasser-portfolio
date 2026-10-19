import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('adminToken') || null;
    } catch (e) {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('adminUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem('adminToken', token);
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } catch (e) {}
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data?.success && res.data?.token) {
        setToken(res.data.token);
        setUser(res.data.user || { email });
        localStorage.setItem('adminToken', res.data.token);
        if (res.data.user) {
          localStorage.setItem('adminUser', JSON.stringify(res.data.user));
        }
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: res.data?.message || 'Login failed' };
      }
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Network error'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
