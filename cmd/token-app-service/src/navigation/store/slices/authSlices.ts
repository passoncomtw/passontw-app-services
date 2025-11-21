import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from '../configureStore';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; name: string } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
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
    loginSuccess(state, action: PayloadAction<{ id: string; name: string }>) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

/**
 * Thunk Action 範例
 * 處理非同步登入邏輯
 */
export const loginUser = (username: string, password: string): AppThunk => 
  async (dispatch) => {
    try {
      dispatch(loginStart());
      
      // 模擬 API 呼叫
      const response = await fetch('https://api.example.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error('登入失敗');
      }
      
      const user = await response.json();
      dispatch(loginSuccess(user));
    } catch (error) {
      dispatch(loginFailure(error instanceof Error ? error.message : '未知錯誤'));
    }
  };

export default authSlice.reducer;