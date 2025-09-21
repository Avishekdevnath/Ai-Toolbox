'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/lib/store';
import { fetchSession, loginThunk, logoutThunk, registerThunk } from '@/lib/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/lib/store';

type Role = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>;
  register: (data: Omit<AuthUser, 'id' | 'role'> & { password: string; role?: Role }) => Promise<{ success: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthStateBridge({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const loading = useAppSelector((s) => s.auth.loading);
  const error = useAppSelector((s) => s.auth.error);

  useEffect(() => {
    // Only fetch session once when component mounts
    console.log('🔄 AuthStateBridge: Fetching session...');
    dispatch(fetchSession());
  }, [dispatch]);

  useEffect(() => {
    console.log('🔍 AuthStateBridge: State changed:', {
      loading,
      user: user ? `${user.username} (${user.email})` : 'null',
      error
    });
  }, [loading, user, error]);

  const ctx: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    refresh: async () => { await dispatch(fetchSession()); },
    login: async (identifier, password) => {
      try { await dispatch(loginThunk({ identifier, password })).unwrap(); return { success: true }; }
      catch (e: any) { return { success: false, message: e.message }; }
    },
    logout: async () => { try { await dispatch(logoutThunk()).unwrap(); } catch {} },
    register: async (payload) => {
      try { await dispatch(registerThunk(payload as any)).unwrap(); return { success: true }; }
      catch (e: any) { return { success: false, message: e.message }; }
    },
  };

  return (
    <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AuthStateBridge>{children}</AuthStateBridge>
    </ReduxProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


