'use client';

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  createClientUserSession,
  getClientSession,
  signOutClient,
} from '@/lib/authService';

export type Role = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
}

export interface SecurityQuestionRegistrationInput {
  questionId: string;
  answer: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string;
}

interface AuthApiSuccessResponse {
  success: boolean;
  message?: string;
  token: string;
  user: AuthUser;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: '',
};

export const fetchSession = createAsyncThunk('auth/fetchSession', async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const session = getClientSession();
  return (session?.isAuthenticated ? session.user : null) as AuthUser | null;
});

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: { identifier: string; password: string }) => {
    const isEmail = payload.identifier.includes('@');
    const loginData = isEmail
      ? { email: payload.identifier, password: payload.password }
      : { username: payload.identifier, password: payload.password };

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Login failed');
    }

    const authResponse = data as AuthApiSuccessResponse;

    createClientUserSession({
      token: authResponse.token,
      user: authResponse.user,
    });

    return authResponse.user;
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Logout failed');
    }
  } finally {
    signOutClient();
  }

  return null as AuthUser | null;
});

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (
    payload: Omit<AuthUser, 'id' | 'role'> & {
      password: string;
      role?: Role;
      securityQuestions: SecurityQuestionRegistrationInput[];
    }
  ) => {
    const registerData = {
      email: payload.email,
      username: payload.username,
      password: payload.password,
      name: `${payload.firstName} ${payload.lastName}`.trim(),
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
      securityQuestions: payload.securityQuestions,
    };

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Registration failed');
    }

    const authResponse = data as AuthApiSuccessResponse;

    createClientUserSession({
      token: authResponse.token,
      user: authResponse.user,
    });

    return authResponse.user;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSession.pending, (state) => {
        if (state.user === null) {
          state.loading = true;
        }
        state.error = '';
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = '';
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed';
        if (!state.user) {
          state.user = null;
        }
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed';
      })
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.error.message || 'Failed';
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed';
      });
  }
});

export const { setUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
