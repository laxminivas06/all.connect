import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('allconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('allconnect_token'));
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then((res) => {
          setUser(res.user);
          localStorage.setItem('allconnect_user', JSON.stringify(res.user));
          fetchNotifications();
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const list = await api.getNotifications();
      setNotifications(list);
    } catch {
      // ignore in background
    }
  };

  const login = async (username, password) => {
    const res = await api.login({ username, password });
    localStorage.setItem('allconnect_token', res.access_token);
    localStorage.setItem('allconnect_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    await fetchNotifications();
    return res.user;
  };

  const loginAs = async (roleKey) => {
    const credMap = {
      super_admin: { u: 'admin', p: 'Admin@123' },
      patient: { u: 'patient', p: 'Patient@123' },
      hospital: { u: 'hospital', p: 'Hospital@123' },
      clinic: { u: 'clinic', p: 'Clinic@123' },
      doctor: { u: 'doctor', p: 'Doctor@123' },
      pharmacy: { u: 'pharmacy', p: 'Pharmacy@123' }
    };
    const cred = credMap[roleKey];
    if (cred) {
      return await login(cred.u, cred.p);
    }
  };

  const logout = () => {
    localStorage.removeItem('allconnect_token');
    localStorage.removeItem('allconnect_user');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      loginAs,
      logout,
      notifications,
      unreadCount,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || {};
};
