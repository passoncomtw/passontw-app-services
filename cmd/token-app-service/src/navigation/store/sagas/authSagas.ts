import { call, put, takeLatest, delay } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginStart, loginSuccess, loginFailure, logout, registerSuccess } from '../slices/authSlices';
import logger from '@pkg/logger';
import { authApi } from '@/apis';
import type { LoginCredentials, RegisterCredentials, LoginData, RegisterData } from '@/apis';

/**
 * Action Types for Saga
 * 定義 Saga 專用的 action types
 */
export const AUTH_SAGA_ACTIONS = {
  LOGIN_REQUEST: 'auth/loginRequest',
  REGISTER_REQUEST: 'auth/registerRequest',
  LOGOUT_REQUEST: 'auth/logoutRequest',
} as const;

/**
 * Login Saga
 * 使用 httpClient 處理登入流程
 */
function* loginSaga(action: PayloadAction<LoginCredentials>) {
  // 開始登入（設置 loading 狀態）
  yield put(loginStart());

  try {
    // 使用 httpClient 呼叫登入 API
    const data: LoginData = yield call(authApi.login, action.payload);

    logger.info('登入成功', {
      userId: data.user.id,
      userName: data.user.name,
      account: data.user.account,
    });

    // 儲存 token 到 AsyncStorage
    if (data.access_token) {
      yield call([AsyncStorage, 'setItem'], 'authToken', data.access_token);
      yield call([AsyncStorage, 'setItem'], 'expireIn', data.expireIn.toString());
      yield call([AsyncStorage, 'setItem'], 'user', JSON.stringify(data.user));
    }

    // Dispatch loginSuccess（更新 Redux State）
    yield put(loginSuccess({
      user: data.user,
      accessToken: data.access_token,
      expireIn: data.expireIn,
    }));
  } catch (error: any) {
    logger.error('登入失敗', {
      error: error.message || error,
    });

    // Dispatch loginFailure（設置錯誤訊息）
    const errorMessage = error.response?.data?.message || error.message || '登入失敗，請稍後再試';
    yield put(loginFailure(errorMessage));
  }
}

/**
 * Register Saga
 * 使用 httpClient 處理註冊流程
 * 註冊成功後返回登入頁面
 */
function* registerSaga(action: PayloadAction<RegisterCredentials>) {
  // 開始註冊（設置 loading 狀態）
  yield put(loginStart());

  try {
    // 使用 httpClient 呼叫註冊 API
    const data: RegisterData = yield call(authApi.register, action.payload);

    logger.info('註冊成功', {
      userId: data.id,
      userName: data.name,
      account: data.account,
    });

    // 清除 loading 狀態並標記註冊成功
    yield put(registerSuccess());
  } catch (error: any) {
    logger.error('註冊失敗', {
      error: error.message || error,
    });

    // Dispatch loginFailure（設置錯誤訊息）
    const errorMessage = error.response?.data?.message || error.message || '註冊失敗，請稍後再試';
    yield put(loginFailure(errorMessage));
  }
}

/**
 * Logout Saga
 * 使用 httpClient 處理登出流程
 */
function* logoutSaga() {
  logger.info('開始登出流程');

  try {
    // 使用 httpClient 呼叫登出 API
    yield call(authApi.logout);
    logger.info('登出 API 呼叫成功');
  } catch (error: any) {
    logger.error('登出 API 呼叫失敗', error);
    // 即使 API 失敗，也要清除本地數據並登出
  } finally {
    // 清除 AsyncStorage
    yield call([AsyncStorage, 'multiRemove'], ['authToken', 'expireIn', 'user']);

    // 延遲一下讓使用者看到登出動畫
    yield delay(300);
    
    // Dispatch logout（清除 Redux State）
    yield put(logout());
  }
}

/**
 * Watcher Saga
 * 監聽特定的 action 並觸發對應的 saga
 */
export function* watchAuthSagas() {
  // takeLatest: 如果有多個請求，只處理最新的一個
  yield takeLatest(AUTH_SAGA_ACTIONS.LOGIN_REQUEST, loginSaga);
  yield takeLatest(AUTH_SAGA_ACTIONS.REGISTER_REQUEST, registerSaga);
  yield takeLatest(AUTH_SAGA_ACTIONS.LOGOUT_REQUEST, logoutSaga);
}
