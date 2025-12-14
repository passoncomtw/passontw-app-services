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
}

const initialState: OrdersState = {
  buy: null,
  sell: null,
  loading: false,
  error: null,
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
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  clearOrdersError,
} = ordersSlice.actions;

export default ordersSlice.reducer;
