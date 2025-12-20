import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SagaErrorResult } from '@pkg/utils/sagaHelpers';

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
 * 銀行資訊
 */
interface Bank {
  id: number;
  bankCode: string;
  bankName: string;
}

/**
 * 銀行卡資料結構
 */
interface BankCard {
  id: number;
  bankId: number;
  cardNumber: string;
  name: string;
  branchName?: string;
  status: number;
  createdAt: string;
  bank: Bank;
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
  bankCards?: BankCard[]; // 登入時會返回銀行卡列表
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
    loginFailure(state, action: PayloadAction<SagaErrorResult>) {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload.message;
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
      // 完全重置為初始狀態
      return initialState;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, registerSuccess, clearError, updateUser } = authSlice.actions;

export default authSlice.reducer;