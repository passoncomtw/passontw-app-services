import { call, put, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import logger from '@pkg/logger';
import { ordersApi } from '@/apis';
import { ORDERS_ACTIONS } from '../actions/ordersActions';
import {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
} from '../slices/ordersSlice';

/**
 * Fetch Pending Orders Saga
 * 使用 httpClient 處理取得掛單列表流程
 * 
 * 流程：
 * 1. 組件 dispatch fetchPendingOrdersRequest()
 * 2. Saga 監聽到 action，先設置 loading 狀態
 * 3. Saga 調用 API 取得資料
 * 4. 取得資料後，Saga dispatch fetchOrdersSuccess() 更新 store
 * 5. 如果有錯誤，Saga dispatch fetchOrdersFailure() 設置錯誤訊息
 */
function* fetchPendingOrdersSaga(): SagaIterator {
  // 步驟 1: 開始取得掛單（設置 loading 狀態）
  yield put(fetchOrdersStart());

  try {
    // 步驟 2: 使用 httpClient 呼叫取得掛單 API
    const ordersData = yield call(ordersApi.getPendingOrders);

    logger.info('取得掛單列表成功', {
      hasBuy: !!ordersData.buy,
      hasSell: !!ordersData.sell,
    });

    // 步驟 3: 取得資料後，更新 Redux State
    yield put(fetchOrdersSuccess(ordersData));
  } catch (error: any) {
    logger.error('取得掛單列表失敗', {
      error: error.message || error,
    });

    // 步驟 4: 如果有錯誤，設置錯誤訊息
    const errorMessage = error.response?.data?.message || error.message || '取得掛單列表失敗，請稍後再試';
    yield put(fetchOrdersFailure(errorMessage));
  }
}

/**
 * Watcher Saga
 * 監聽特定的 action 並觸發對應的 saga
 */
export function* watchOrdersSagas(): SagaIterator {
  // takeLatest: 如果有多個請求，只處理最新的一個
  yield takeLatest(ORDERS_ACTIONS.FETCH_PENDING_ORDERS_REQUEST, fetchPendingOrdersSaga);
}

