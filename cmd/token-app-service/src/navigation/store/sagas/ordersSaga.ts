import { call, put, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { PayloadAction } from '@reduxjs/toolkit';
import logger from '@pkg/logger';
import { ordersApi } from '@/apis';
import { ORDERS_ACTIONS, CreatePendingOrderPayload, DeletePendingOrderPayload } from '../actions/ordersActions';
import {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  deleteOrderStart,
  deleteOrderSuccess,
  deleteOrderFailure,
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
 * Create Pending Order Saga
 * 使用 httpClient 處理建立掛單流程
 * 
 * 支援 onSuccess 和 onError 回調函數，讓 UI 可以在 API 完成後執行特定邏輯
 */
function* createPendingOrderSaga(action: PayloadAction<CreatePendingOrderPayload>): SagaIterator {
  const { data, onSuccess, onError } = action.payload;

  // 步驟 1: 開始建立掛單（設置 creating 狀態）
  yield put(createOrderStart());

  try {
    // 步驟 2: 使用 httpClient 呼叫建立掛單 API
    const orderData = yield call(ordersApi.createPendingOrder, data);

    logger.info('建立掛單成功', {
      orderId: orderData.id,
      type: data.type === 0 ? '買幣' : '賣幣',
      amount: data.amount,
    });

    // 步驟 3: 建立成功後，更新 Redux State
    yield put(createOrderSuccess(orderData));

    // 步驟 4: 重新取得掛單列表以確保資料同步
    yield put({ type: ORDERS_ACTIONS.FETCH_PENDING_ORDERS_REQUEST });

    // 步驟 5: 調用成功回調（如果有提供）
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    logger.error('建立掛單失敗', {
      error: error.message || error,
      type: data.type === 0 ? '買幣' : '賣幣',
    });

    // 步驟 6: 如果有錯誤，設置錯誤訊息
    const errorMessage = error.response?.data?.message || error.message || '建立掛單失敗，請稍後再試';
    yield put(createOrderFailure(errorMessage));

    // 步驟 7: 調用錯誤回調（如果有提供）
    if (onError) {
      onError(errorMessage);
    }
  }
}

/**
 * Delete Pending Order Saga
 * 使用 httpClient 處理刪除掛單流程
 * 
 * 支援 onSuccess 和 onError 回調函數，讓 UI 可以在 API 完成後執行特定邏輯
 */
function* deletePendingOrderSaga(action: PayloadAction<DeletePendingOrderPayload>): SagaIterator {
  const { orderId, onSuccess, onError } = action.payload;

  // 步驟 1: 開始刪除掛單（設置 deleting 狀態）
  yield put(deleteOrderStart());

  try {
    // 步驟 2: 使用 httpClient 呼叫刪除掛單 API
    yield call(ordersApi.deletePendingOrder, orderId);

    logger.info('刪除掛單成功', {
      orderId,
    });

    // 步驟 3: 刪除成功後，更新 Redux State
    yield put(deleteOrderSuccess(orderId));

    // 步驟 4: 重新取得掛單列表以確保資料同步
    yield put({ type: ORDERS_ACTIONS.FETCH_PENDING_ORDERS_REQUEST });

    // 步驟 5: 調用成功回調（如果有提供）
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    logger.error('刪除掛單失敗', {
      error: error.message || error,
      orderId,
    });

    // 步驟 6: 如果有錯誤，設置錯誤訊息
    const errorMessage = error.response?.data?.message || error.message || '刪除掛單失敗，請稍後再試';
    yield put(deleteOrderFailure(errorMessage));

    // 步驟 7: 調用錯誤回調（如果有提供）
    if (onError) {
      onError(errorMessage);
    }
  }
}

/**
 * Watcher Saga
 * 監聽特定的 action 並觸發對應的 saga
 */
export function* watchOrdersSagas(): SagaIterator {
  // takeLatest: 如果有多個請求，只處理最新的一個
  yield takeLatest(ORDERS_ACTIONS.FETCH_PENDING_ORDERS_REQUEST, fetchPendingOrdersSaga);
  yield takeLatest(ORDERS_ACTIONS.CREATE_PENDING_ORDER_REQUEST, createPendingOrderSaga);
  yield takeLatest(ORDERS_ACTIONS.DELETE_PENDING_ORDER_REQUEST, deletePendingOrderSaga);
}

