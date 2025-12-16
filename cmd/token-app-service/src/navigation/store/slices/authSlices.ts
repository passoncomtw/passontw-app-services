import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 用戶錢包資訊
 */
interface UserWallet {
  status: number;
  usefulBalance: number;
  guaranteedBalance: number;
  freezeBalance: number;
}

/**
 * 推薦人資訊
 */
interface ReferralUser {
  id: number;
  account: string;
  email: string;
  name: string;
  type: number;
}

/**
 * 用戶資訊
 */
interface User {
  id: number;
  type: number;
  account: string;
  name: string;
  email: string;
  createAt: string;
  referralCode: string;
  referralUser?: ReferralUser;
  wallet: UserWallet;
}

/**
 * Auth State
 */
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  expireIn: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  expireIn: null,
  loading: false,
  error: null,
};

/**
 * Auth Slice
 * 負責管理使用者認證相關的狀態
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ user: User; accessToken: string; expireIn: number }>) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.expireIn = action.payload.expireIn;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    registerSuccess(state) {
      state.loading = false;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.expireIn = null;
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, registerSuccess, clearError, updateUser } = authSlice.actions;

export default authSlice.reducer;