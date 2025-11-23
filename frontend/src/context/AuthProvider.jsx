import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { getUser, setUser as saveUser, removeUser, setToken, removeToken } from '../utils/storage';

// This is the Provider component - uses sessionStorage for tab-specific sessions
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use sessionStorage for tab-specific sessions
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Use sessionStorage so each tab has its own session
    saveUser(userData);
    setToken(userData.token);
    setUser(userData);
  };

  const logout = () => {
    // Only affects the current tab
    removeUser();
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}