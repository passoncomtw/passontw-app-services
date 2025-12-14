/**
 * Orders Actions
 * 定義掛單相關的 action creators
 */

export const ORDERS_ACTIONS = {
  FETCH_PENDING_ORDERS_REQUEST: 'orders/fetchPendingOrdersRequest',
} as const;

/**
 * 請求取得掛單列表
 */
export const fetchPendingOrdersRequest = () => ({
  type: ORDERS_ACTIONS.FETCH_PENDING_ORDERS_REQUEST,
});

