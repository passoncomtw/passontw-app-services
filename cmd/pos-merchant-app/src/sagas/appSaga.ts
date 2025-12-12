import { call, put, takeLeading, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  FETCH_USER_REQUEST, 
  FETCH_USER_SUCCESS, 
  FETCH_USER_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
} from '../actions';
import { setUser, setLoading, setError } from '../reducers/appReducer';
import { userService } from '../services/userService';
import { User } from '../types';
import { authApi } from '../apis';

function* fetchUserSaga(action: PayloadAction<{ userId: string }>): SagaIterator {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    
    const user: User = yield call(userService.fetchUserFromApi, action.payload.userId);
    yield put(setUser(user));
    yield put({ type: FETCH_USER_SUCCESS, payload: { user } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '獲取用戶資料失敗';
    yield put(setError(errorMessage));
    yield put({ type: FETCH_USER_FAILURE, payload: { error: errorMessage } });
  } finally {
    yield put(setLoading(false));
  }
}

export function* appSaga(): SagaIterator {
  // 取得用戶資料：取最新一次請求，避免舊請求覆蓋新資料
  yield takeLatest(FETCH_USER_REQUEST, fetchUserSaga);
  // 登入：只處理第一個，避免重複登入並發
  yield takeLeading(LOGIN_REQUEST, loginSaga);
}

function* loginSaga(action: PayloadAction<{ pin: string }>): SagaIterator {
  try {
    yield put(setLoading(true));
    yield put(setError(null));

    const { pin } = action.payload;
    const data = yield call(authApi.login, pin);

    localStorage.setItem('authToken', data.token);

    const mappedUser: User = {
      id: data.user.user_id,
      name: data.user.username || 'POS 使用者',
      email: data.user.email,
      username: data.user.username,
      merchantId: data.user.merchant_id,
    };

    yield put(setUser(mappedUser));
    yield put({ type: LOGIN_SUCCESS });
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      '登入失敗，請稍後再試';
    yield put(setError(message));
    yield put({ type: LOGIN_FAILURE, payload: { error: message } });
  } finally {
    yield put(setLoading(false));
  }
}
