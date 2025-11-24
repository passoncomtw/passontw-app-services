import { call, put, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  FETCH_USER_REQUEST, 
  FETCH_USER_SUCCESS, 
  FETCH_USER_FAILURE 
} from '../actions';
import { setUser, setLoading, setError } from '../reducers/appReducer';
import { userService } from '../services/userService';
import { User } from '../types';

function* fetchUserSaga(action: PayloadAction<{ userId: string }>) {
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

export function* appSaga() {
  yield takeEvery(FETCH_USER_REQUEST, fetchUserSaga);
}
