import { all, fork } from 'redux-saga/effects';
import {watchAuthSagas} from './authSagas';

export default function* rootSaga() {
  yield all([fork(watchAuthSagas)]);
}
