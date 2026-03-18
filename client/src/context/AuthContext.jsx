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
  }, []);

  const checkAuth = async () => {
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
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', credentials);
      // Backend returns { success, accessToken, user: { _id, name, email, phone, role } }
      const { accessToken, user: userData } = res.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(userData);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed.';
      setError(message);
      throw message;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', userData);
      const { accessToken, user: newUser } = res.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(newUser);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      setError(message);
      throw message;
    } finally {
      setLoading(false);
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

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, checkAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
