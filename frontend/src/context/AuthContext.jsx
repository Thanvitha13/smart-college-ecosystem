import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reset = () => { setUser(null); setLoading(false); };
    window.addEventListener('opportunityhub:unauthorized', reset);
    const token = localStorage.getItem('opportunityhub-token');
    if (!token) {
      setLoading(false);
      return () => window.removeEventListener('opportunityhub:unauthorized', reset);
    }
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => {
      localStorage.removeItem('opportunityhub-token');
      setUser(null);
    }).finally(() => setLoading(false));
    return () => window.removeEventListener('opportunityhub:unauthorized', reset);
  }, []);

  const signIn = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('opportunityhub-token', data.token);
    setUser(data.user);
    return data.user;
  };
  const register = async (details) => {
    const { data } = await api.post('/auth/register', details);
    localStorage.setItem('opportunityhub-token', data.token);
    setUser(data.user);
    return data.user;
  };
  const signOut = () => {
    localStorage.removeItem('opportunityhub-token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, loading, signIn, register, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
