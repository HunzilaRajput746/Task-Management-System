import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pulse_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('pulse_token');
      const storedUser = localStorage.getItem('pulse_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Refresh user profile from backend
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('pulse_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Failed to verify stored session', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('pulse_token', receivedToken);
      localStorage.setItem('pulse_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', userData);
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('pulse_token', receivedToken);
      localStorage.setItem('pulse_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
    setUser(null);
    setToken(null);
  };

  // Quick 1-Click Demo Login Switcher
  const quickDemoLogin = async (role) => {
    const roleCredentials = {
      admin: { email: 'admin@pulse.io', password: 'Password123!' },
      manager: { email: 'manager@pulse.io', password: 'Password123!' },
      member: { email: 'member@pulse.io', password: 'Password123!' },
    };

    const creds = roleCredentials[role];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        quickDemoLogin,
        hasRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
