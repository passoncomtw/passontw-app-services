import { call, put, takeLatest, delay } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { loginStart, loginSuccess, loginFailure } from '../slices/authSlices';

/**
 * Action Types for Saga
 * 定義 Saga 專用的 action types
 */
export const AUTH_SAGA_ACTIONS = {
  LOGIN_REQUEST: 'auth/loginRequest',
  LOGOUT_REQUEST: 'auth/logoutRequest',
} as const;

/**
 * API 呼叫函數
 * 處理實際的 HTTP 請求
 */
interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  id: string;
  name: string;
  token: string;
}

async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模擬登入驗證
  if (credentials.username === 'demo' && credentials.password === 'password') {
    return {
      id: '1',
      name: 'Demo User',
      token: 'mock-jwt-token-' + Date.now(),
    };
  }
  
  throw new Error('使用者名稱或密碼錯誤');
  
  /* 實際的 API 呼叫範例：
  const response = await fetch('https://api.example.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('登入失敗');
  }

  return response.json();
  */
}

/**
 * Login Saga
 * 處理登入流程的 saga
 */
function* loginSaga(action: PayloadAction<LoginCredentials>) {
  try {
    // 開始登入流程
    yield put(loginStart());

    // 呼叫 API（使用 call effect 以便於測試）
    const user: LoginResponse = yield call(loginApi, action.payload);

    // 可以在這裡處理其他副作用
    // 例如：儲存 token 到 localStorage (Web) 或 AsyncStorage (React Native)
    if (user.token) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', user.token);
      }
      // React Native: await AsyncStorage.setItem('authToken', user.token);
    }

    // 登入成功
    yield put(loginSuccess({ id: user.id, name: user.name }));
  } catch (error) {
    // 登入失敗
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    yield put(loginFailure(errorMessage));
  }
}

/**
 * Logout Saga
 * 處理登出流程的 saga
 */
function* logoutSaga() {
  try {
    // 可以在這裡處理登出的副作用
    // 例如：清除 token、呼叫登出 API 等
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    // React Native: await AsyncStorage.removeItem('authToken');
    
    // 延遲一下讓使用者看到登出動畫（可選）
    yield delay(300);
    
    // 觸發登出 action
    yield put({ type: 'auth/logout' });
    
    console.log('✅ 登出成功');
  } catch (error) {
    console.error('❌ 登出失敗', error);
    // 即使失敗也執行登出
    yield put({ type: 'auth/logout' });
  }
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