import type { CreatePendingOrderRequest } from '@/apis/ordersApi';

/**
 * Orders Actions
 * 定義掛單相關的 action creators
 */

export const ORDERS_ACTIONS = {
  FETCH_PENDING_ORDERS_REQUEST: 'orders/fetchPendingOrdersRequest',
  CREATE_PENDING_ORDER_REQUEST: 'orders/createPendingOrderRequest',
} as const;

/**
 * 建立掛單請求的參數
 */
export interface CreatePendingOrderPayload {
  data: CreatePendingOrderRequest;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * 請求取得掛單列表
 */
export const fetchPendingOrdersRequest = () => ({
  type: ORDERS_ACTIONS.FETCH_PENDING_ORDERS_REQUEST,
});

/**
 * 請求建立掛單
 */
export const createPendingOrderRequest = (payload: CreatePendingOrderPayload) => ({
  type: ORDERS_ACTIONS.CREATE_PENDING_ORDER_REQUEST,
  payload,
});

