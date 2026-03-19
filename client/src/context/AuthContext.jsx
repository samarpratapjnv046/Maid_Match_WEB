import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

// Convenience hook — can be imported directly from this file
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();

    // When the axios interceptor fails to refresh the token, it dispatches this event.
    // Handle it here so we clear user state without a full page reload.
    const handleSessionExpired = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('auth:sessionExpired', handleSessionExpired);
    return () => window.removeEventListener('auth:sessionExpired', handleSessionExpired);
  }, []);

  const checkAuth = async () => {
    // Skip the API call entirely if there is no token — avoids a pointless
    // 401 → refresh attempt → failure cycle on public pages (register, home, etc.)
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      // Backend returns { success, data: { ...user } }
      setUser(res.data?.data || res.data);
    } catch {
      setUser(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      // Backend returns { success, accessToken, user: { _id, name, email, phone, role } }
      const { accessToken, user: userData } = res.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(userData);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      throw message;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { accessToken, user: newUser } = res.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(newUser);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      throw message;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const loginWithToken = async (token) => {
    localStorage.setItem('accessToken', token);
    try {
      const res = await api.get('/auth/me');
      const userData = res.data?.data || res.data;
      setUser(userData);
      return userData.role;
    } catch (err) {
      localStorage.removeItem('accessToken');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, checkAuth, updateUser, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
};
