import { all, fork } from 'redux-saga/effects';
import { watchAuthSagas } from './authSagas';
import { watchOrdersSagas } from './ordersSaga';
import { watchBankCardsSagas } from './bankCardsSaga';

export default function* rootSaga() {
  yield all([
    fork(watchAuthSagas),
    fork(watchOrdersSagas),
    fork(watchBankCardsSagas),
  ]);
}
