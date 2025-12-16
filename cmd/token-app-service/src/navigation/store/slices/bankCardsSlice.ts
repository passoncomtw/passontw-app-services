import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 銀行資訊
 */
export interface Bank {
  id: number;
  bankCode: string;
  bankName: string;
}

/**
 * 銀行卡資訊
 */
export interface BankCard {
  id: number;
  userId: number;
  bankId: number;
  name: string;
  cardNumber: string;
  branchName: string;
  status: number;
  createdAt: string;
  bank: Bank;
}

/**
 * BankCards State
 */
interface BankCardsState {
  cards: BankCard[];
  loading: boolean;
  error: string | null;
}

const initialState: BankCardsState = {
  cards: [],
  loading: false,
  error: null,
};

/**
 * BankCards Slice
 * 負責管理銀行卡相關的狀態
 */
const bankCardsSlice = createSlice({
  name: 'bankCards',
  initialState,
  reducers: {
    fetchBankCardsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchBankCardsSuccess(state, action: PayloadAction<BankCard[]>) {
      state.loading = false;
      state.cards = action.payload;
      state.error = null;
    },
    fetchBankCardsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearBankCardsError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchBankCardsStart,
  fetchBankCardsSuccess,
  fetchBankCardsFailure,
  clearBankCardsError,
} = bankCardsSlice.actions;

export default bankCardsSlice.reducer;

