import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserPendingOrdersResponse } from '@/apis/ordersApi';

/**
 * Orders State
 */
interface OrdersState {
  buy: any | null; // PendingOrder | null
  sell: any | null; // PendingOrder | null
  loading: boolean;
  error: string | null;
  creating: boolean; // 建立掛單中
  createError: string | null; // 建立掛單錯誤
}

const initialState: OrdersState = {
  buy: null,
  sell: null,
  loading: false,
  error: null,
  creating: false,
  createError: null,
};

/**
 * Orders Slice
 * 負責管理掛單相關的狀態
 */
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    fetchOrdersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess(state, action: PayloadAction<UserPendingOrdersResponse>) {
      state.loading = false;
      state.buy = action.payload.buy;
      state.sell = action.payload.sell;
      state.error = null;
    },
    fetchOrdersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearOrdersError(state) {
      state.error = null;
    },
    createOrderStart(state) {
      state.creating = true;
      state.createError = null;
    },
    createOrderSuccess(state, action: PayloadAction<any>) {
      state.creating = false;
      // 根據類型更新對應的掛單
      if (action.payload.type === 0) {
        state.buy = action.payload;
      } else {
        state.sell = action.payload;
      }
      state.createError = null;
    },
    createOrderFailure(state, action: PayloadAction<string>) {
      state.creating = false;
      state.createError = action.payload;
    },
    clearCreateError(state) {
      state.createError = null;
    },
    resetOrders() {
      // 重置為初始狀態（用於登出）
      return initialState;
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  clearOrdersError,
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  clearCreateError,
  resetOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;
