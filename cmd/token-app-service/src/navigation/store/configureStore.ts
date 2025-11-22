import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from './slices/authSlices';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

/**
 * 配置 Redux Store
 * 
 * 使用 Redux Toolkit 的 configureStore，自動整合了：
 * - redux-thunk 中間件（用於處理非同步邏輯）
 * - Redux DevTools Extension（開發環境下的除錯工具）
 * - 序列化檢查中間件（防止 non-serializable 值進入 store）
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 中間件配置選項
      thunk: true, // 啟用 redux-thunk（預設已啟用）
      serializableCheck: {
        // 如果需要在 action 中傳遞 non-serializable 的值（如 Date、Promise 等），
        // 可以在此處配置忽略的 action types 或路徑
        ignoredActions: [],
        ignoredActionPaths: [],
        ignoredPaths: [],
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production', // 只在開發環境啟用 DevTools
});

sagaMiddleware.run(rootSaga);

/**
 * 從 store 本身推斷出 RootState 和 AppDispatch 型別
 * 這些型別將在整個應用程式中使用
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Thunk Action 的型別定義
 * 用於定義非同步 action creators
 */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;