import { all, fork } from 'redux-saga/effects';
import { watchAuthSagas } from './authSagas';
import { watchOrdersSagas } from './ordersSaga';
import { watchBankCardsSagas } from './bankCardsSaga';
import { watchMarketSagas } from './marketSaga';

export default function* rootSaga() {
  yield all([
    fork(watchAuthSagas),
    fork(watchOrdersSagas),
    fork(watchBankCardsSagas),
    fork(watchMarketSagas),
  ]);
}
