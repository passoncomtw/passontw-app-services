import { all, fork } from 'redux-saga/effects';
import { counterSaga } from './counterSaga';
import { appSaga } from './appSaga';

export function* rootSaga() {
  yield all([
    fork(counterSaga),
    fork(appSaga),
  ]);
}
