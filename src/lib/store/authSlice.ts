'use client';

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string;
}

const initialState: AuthState = {
  user: null,
  loading: true, // Start with loading true to show loading state on initial load
  error: '',
};

export const fetchSession = createAsyncThunk('auth/fetchSession', async () => {
  try {
    console.log('🔄 Starting fetchSession...');
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const res = await fetch('/api/auth/me', { 
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log('📡 fetchSession response:', res.status, res.statusText);
    
    if (!res.ok) {
      // 401 is expected when not authenticated, don't throw error
      if (res.status === 401) {
        console.log('🔐 No active session (401)');
        return null;
      }
      console.error('❌ API error:', res.status, res.statusText);
      return null; // Return null instead of throwing for other errors
    }
    
    const data = await res.json();
    console.log('✅ Session data received:', data.authenticated ? 'authenticated' : 'not authenticated');
    return (data.authenticated ? data.user : null) as AuthUser | null;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('⚠️ Request timeout in fetchSession - this is normal for slow connections');
      return null; // Don't treat timeout as error
    } else {
      console.error('❌ Network error in fetchSession:', error);
    }
    // Return null instead of throwing to prevent infinite loops
    return null;
  }
});

export const loginThunk = createAsyncThunk('auth/login', async (payload: { identifier: string; password: string }) => {
  // Determine if identifier is email or username
  const isEmail = payload.identifier.includes('@');
  const loginData = isEmail 
    ? { email: payload.identifier, password: payload.password }
    : { username: payload.identifier, password: payload.password };
    
  const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginData) });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Login failed');
  const me = await (await fetch('/api/auth/me', { cache: 'no-store' })).json();
  return (me.authenticated ? me.user : null) as AuthUser | null;
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Logout failed');
  return null as AuthUser | null;
});

export const registerThunk = createAsyncThunk('auth/register', async (payload: Omit<AuthUser, 'id' | 'role'> & { password: string; role?: Role }) => {
  const registerData = {
    email: payload.email,
    username: payload.username,
    password: payload.password,
    name: `${payload.firstName} ${payload.lastName}`.trim(),
    firstName: payload.firstName,
    lastName: payload.lastName
  };
  
  const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registerData) });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Registration failed');
  const me = await (await fetch('/api/auth/me', { cache: 'no-store' })).json();
  return (me.authenticated ? me.user : null) as AuthUser | null;
});

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
        if (state.user === null) { // Only set loading if we don't have a user yet
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
        // Don't set error for timeouts, just log them
        if (action.error.message?.includes('timeout')) {
          console.warn('⚠️ Session fetch timeout - continuing without error');
          state.error = '';
        } else {
          state.error = action.error.message || 'Failed';
        }
        // Only clear user if we don't have an initial user
        if (!state.user) {
          state.user = null; 
        }
      })

      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = ''; })
      .addCase(loginThunk.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginThunk.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed'; })

      .addCase(logoutThunk.pending, (state) => { state.loading = true; state.error = ''; })
      .addCase(logoutThunk.fulfilled, (state) => { state.loading = false; state.user = null; })
      .addCase(logoutThunk.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed'; })

      .addCase(registerThunk.pending, (state) => { state.loading = true; state.error = ''; })
      .addCase(registerThunk.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(registerThunk.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed'; });
  }
});

export const { setUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;


