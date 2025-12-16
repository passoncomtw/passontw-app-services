import { httpClientWithAuth } from './httpClient';
import type { ApiResponse } from './authApi';

/**
 * 掛單資料結構
 */
export interface PendingOrder {
  id: string;
  userId?: number;
  type: number; // 0: 買幣, 1: 賣幣
  status: number; // 狀態：0=active, 1=locked 等
  amount: number;
  balance: number;
  minAmount: number;
  transactionMinutes: number;
  createdAt: string;
  updatedAt?: string;
  // 交易統計
  doneAmount?: number;
  doneCount?: number;
  processAmount?: number;
  processCount?: number;
  cancelAmount?: number;
  cancelCount?: number;
  isSplit?: boolean;
  // 銀行卡資訊
  bankcard?: {
    id: number;
    bankId: number;
    cardNumber: string;
    name: string;
    branchName?: string;
    status: number;
    createdAt: string;
    bank?: {
      id: number;
      bankCode: string;
      bankName: string;
    };
  };
  // 使用者資訊
  user?: {
    id: number;
    name: string;
  };
}

/**
 * 使用者掛單回應格式
 */
export interface UserPendingOrdersResponse {
  buy: PendingOrder | null;
  sell: PendingOrder | null;
}

/**
 * 建立掛單請求
 */
export interface CreatePendingOrderRequest {
  type: number; // 0: 買幣, 1: 賣幣
  amount: number; // 掛單金額
  minAmount: number; // 最小交易金額
  bankcardId: number; // 銀行卡 ID
  transactionCode: string; // 交易密碼
  transactionMinutes: number; // 交易時限（分鐘）
}

export const ordersApi = {
  /**
   * 取得使用者自己建立的掛單列表
   * 返回買幣和賣幣掛單
   * 需要認證 token
   */
  getPendingOrders: async (): Promise<UserPendingOrdersResponse> => {
    const response = await httpClientWithAuth.getWithToken<ApiResponse<UserPendingOrdersResponse>>('/users/pending/orders');
    return response.data.data;
  },

  /**
   * 建立掛單
   * 需要認證 token
   */
  createPendingOrder: async (data: CreatePendingOrderRequest): Promise<PendingOrder> => {
    const response = await httpClientWithAuth.postWithToken<ApiResponse<PendingOrder>>('/pending/orders', data);
    return response.data.data;
  },
};
