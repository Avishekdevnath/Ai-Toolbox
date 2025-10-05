'use client';

import React, { createContext, useContext, useEffect, useState, startTransition } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/lib/store';
import { fetchSession, loginThunk, logoutThunk, registerThunk, setUser, setLoading } from '@/lib/store/authSlice';
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

function AuthStateBridge({ children, initialUser }: { children: React.ReactNode; initialUser?: AuthUser }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const loading = useAppSelector((s) => s.auth.loading);
  const error = useAppSelector((s) => s.auth.error);

  useEffect(() => {
    // Seed initial user immediately (no network) if provided
    if (initialUser && !user) {
      dispatch(setUser(initialUser));
      dispatch(setLoading(false));
    }
    // Always fetch session on mount to restore state from cookies
    if (typeof window !== 'undefined') {
      startTransition(() => {
        dispatch(fetchSession());
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 AuthStateBridge: State changed:', {
        loading,
        user: user ? `${user.username} (${user.email})` : 'null',
        error
      });
    }
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

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: AuthUser }) {
  return (
    <ReduxProvider store={store}>
      <AuthStateBridge initialUser={initialUser}>{children}</AuthStateBridge>
    </ReduxProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


