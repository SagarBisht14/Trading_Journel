import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('tradepilot_token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let ignore = false;
    async function loadMe() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (!ignore) setUser(data.user);
      } catch {
        localStorage.removeItem('tradepilot_token');
        if (!ignore) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadMe();
    return () => {
      ignore = true;
    };
  }, [token]);

  const saveAuth = (payload) => {
    localStorage.setItem('tradepilot_token', payload.token);
    setToken(payload.token);
    setUser(payload.user);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      async login(credentials) {
        const { data } = await api.post('/auth/login', credentials);
        saveAuth(data);
        toast.success('Welcome back');
      },
      async register(payload) {
        const { data } = await api.post('/auth/register', payload);
        saveAuth(data);
        toast.success('Account created');
      },
      async logout() {
        try {
          await api.post('/auth/logout');
        } finally {
          localStorage.removeItem('tradepilot_token');
          setToken(null);
          setUser(null);
        }
      },
      setUser,
      setToken
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
