import { call, put, takeLatest, delay } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import { loginStart, loginSuccess, loginFailure, logout } from '../slices/authSlices';
import fetchAPIResult, { apiRequest, type ApiResponse } from '@pkg/utils/sagaHelpers';
import type { RootState } from '../configureStore';

/**
 * Action Types for Saga
 * 定義 Saga 專用的 action types
 */
export const AUTH_SAGA_ACTIONS = {
  LOGIN_REQUEST: 'auth/loginRequest',
  LOGOUT_REQUEST: 'auth/logoutRequest',
} as const;

/**
 * 登入憑證
 */
interface LoginCredentials {
  account: string;
  password: string;
  notificationToken?: string;
}

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
  wallet: UserWallet;
}

/**
 * 登入響應數據
 */
interface LoginData {
  access_token: string;
  expireIn: number;
  user: User;
}

/**
 * API 基礎 URL
 */
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 
                     process.env.EXPO_PUBLIC_API_BASE_URL || 
                     'https://token-app-api.passon.tw';

/**
 * 登入 API
 * 使用 apiRequest helper 呼叫後端 API
 */
const loginApi = async ({
  customHeaders,
  payload,
}: {
  customHeaders: Record<string, string>;
  payload: LoginCredentials;
}): Promise<ApiResponse<LoginData>> => {
  return apiRequest<LoginData>(
    API_BASE_URL,
    '/auth/login',
    'POST',
    {
      account: payload.account,
      password: payload.password,
      notificationToken: payload.notificationToken || 'expo_default_token',
    },
    customHeaders
  );
};

/**
 * 登出 API
 * 使用 apiRequest helper 呼叫後端 API
 */
const logoutApi = async ({
  customHeaders,
}: {
  customHeaders: Record<string, string>;
  payload?: any;
}): Promise<ApiResponse<void>> => {
  // 如果後端有登出 API，使用以下代碼
  return apiRequest<void>(
    API_BASE_URL,
    '/auth/logout',
    'POST',
    {},
    customHeaders
  );
  
  // 如果沒有登出 API，返回模擬響應
  // return Promise.resolve({
  //   success: true,
  //   message: '登出成功',
  //   data: undefined as any,
  //   code: 'SUCCESS',
  // });
};

/**
 * Login Saga
 * 使用 fetchAPIResult helper 處理登入流程
 */
function* loginSaga(action: PayloadAction<LoginCredentials>) {
  // 開始登入（設置 loading 狀態）
  yield put(loginStart());

  // 使用 fetchAPIResult helper 呼叫登入 API
  yield call(fetchAPIResult<LoginCredentials, LoginData>, {
    apiResult: loginApi,
    payload: action.payload,
    action: 'auth/login',
    message: '登入成功！歡迎回來',
    tokenSelector: (state: RootState) => state.auth.accessToken,
    
    // 成功回調
    onSuccess: function* (data: LoginData) {
      console.log('✅ 登入成功:', {
        userId: data.user.id,
        userName: data.user.name,
        account: data.user.account,
      });

      // 儲存 token 到本地存儲
      if (data.access_token) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('authToken', data.access_token);
          localStorage.setItem('expireIn', data.expireIn.toString());
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // TODO: React Native 使用 AsyncStorage
        // import AsyncStorage from '@react-native-async-storage/async-storage';
        // AsyncStorage.setItem('authToken', data.access_token);
        // AsyncStorage.setItem('expireIn', data.expireIn.toString());
        // AsyncStorage.setItem('user', JSON.stringify(data.user));
      }

      // Dispatch loginSuccess（更新 Redux State）
      yield put(loginSuccess({
        user: data.user,
        accessToken: data.access_token,
        expireIn: data.expireIn,
      }));
    },
    
    // 錯誤回調
    onError: function* (error: { code: string; message: string }) {
      console.error('❌ 登入失敗:', {
        code: error.code,
        message: error.message,
      });

      // Dispatch loginFailure（設置錯誤訊息）
      yield put(loginFailure(error.message));
    },
  });
}

/**
 * Logout Saga
 * 使用 fetchAPIResult helper 處理登出流程
 */
function* logoutSaga() {
  console.log('🔄 開始登出流程');

  // 使用 fetchAPIResult helper 呼叫登出 API
  yield call(fetchAPIResult, {
    apiResult: logoutApi,
    payload: {},
    action: 'auth/logout',
    message: '登出成功，期待您再次光臨',
    tokenSelector: (state: RootState) => state.auth.accessToken,
    
    // 成功回調
    onSuccess: function* () {
      console.log('✅ 登出 API 呼叫成功');

      // 清除本地存儲
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('expireIn');
        localStorage.removeItem('user');
      }
      // TODO: React Native 使用 AsyncStorage
      // AsyncStorage.multiRemove(['authToken', 'expireIn', 'user']);

      // 延遲一下讓使用者看到登出動畫
      yield delay(300);
      
      // Dispatch logout（清除 Redux State）
      yield put(logout());
    },
    
    // 錯誤回調
    onError: function* (error: { code: string; message: string }) {
      console.error('❌ 登出失敗:', error);
      
      // 即使 API 失敗，也要清除本地數據並登出
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      
      // Dispatch logout
      yield put(logout());
    },
  });
}

/**
 * Watcher Saga
 * 監聽特定的 action 並觸發對應的 saga
 */
export function* watchAuthSagas() {
  // takeLatest: 如果有多個請求，只處理最新的一個
  yield takeLatest(AUTH_SAGA_ACTIONS.LOGIN_REQUEST, loginSaga);
  yield takeLatest(AUTH_SAGA_ACTIONS.LOGOUT_REQUEST, logoutSaga);
}