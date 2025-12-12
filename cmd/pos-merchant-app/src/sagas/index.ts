import { all, fork } from 'redux-saga/effects';
import { appSaga } from './appSaga';
import { productSaga } from './productSaga';

export function* rootSaga() {
  yield all([
    fork(appSaga),
    fork(productSaga),
  ]);
}
