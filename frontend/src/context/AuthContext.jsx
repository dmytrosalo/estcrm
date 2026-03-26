import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = useCallback(async (username, password) => {
    const res = await client.post('/api/auth/login', { username, password });
    const { access_token } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    navigate('/');
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
