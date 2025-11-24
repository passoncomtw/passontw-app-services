import { put, takeEvery, delay } from 'redux-saga/effects';
import { INCREMENT_ASYNC, DECREMENT_ASYNC } from '../actions';
import { increment, decrement, setLoading } from '../reducers/counterReducer';

function* incrementAsyncSaga() {
  try {
    yield put(setLoading(true));
    yield delay(1000); // 模擬異步操作
    yield put(increment());
  } finally {
    yield put(setLoading(false));
  }
}

function* decrementAsyncSaga() {
  try {
    yield put(setLoading(true));
    yield delay(1000); // 模擬異步操作
    yield put(decrement());
  } finally {
    yield put(setLoading(false));
  }
}

export function* counterSaga() {
  yield takeEvery(INCREMENT_ASYNC, incrementAsyncSaga);
  yield takeEvery(DECREMENT_ASYNC, decrementAsyncSaga);
}
