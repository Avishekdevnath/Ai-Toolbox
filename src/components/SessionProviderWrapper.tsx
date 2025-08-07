'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any;
  login: (token: string, isAdmin: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return { user: context.user };
};

interface SessionProviderWrapperProps {
  children: React.ReactNode;
}

export default function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing tokens on mount
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    
    if (adminToken) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      setUser({ id: 'admin', role: 'admin' });
    } else if (userToken) {
      setIsAuthenticated(true);
      setIsAdmin(false);
      setUser({ id: 'user', role: 'user' });
    }
  }, []);

  const login = (token: string, isAdminUser: boolean) => {
    if (isAdminUser) {
      localStorage.setItem('adminToken', token);
      setIsAdmin(true);
    } else {
      localStorage.setItem('userToken', token);
    }
    setIsAuthenticated(true);
    setUser({ id: isAdminUser ? 'admin' : 'user', role: isAdminUser ? 'admin' : 'user' });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isAdmin,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 