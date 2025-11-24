import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, User } from '../types';

const initialState: AppState = {
  theme: 'light',
  sidebarOpen: false,
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setUser,
  setLoading,
  setError,
  clearError,
  logout,
} = appSlice.actions;

export default appSlice.reducer;
