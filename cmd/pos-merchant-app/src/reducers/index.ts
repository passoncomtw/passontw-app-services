import { combineReducers } from '@reduxjs/toolkit';
import counterReducer from './counterReducer';
import appReducer from './appReducer';

export const rootReducer = combineReducers({
  counter: counterReducer,
  app: appReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
