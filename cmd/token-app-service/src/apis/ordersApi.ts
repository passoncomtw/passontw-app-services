import httpClient from './httpClient';
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

export const ordersApi = {
  /**
   * 取得使用者自己建立的掛單列表
   * 返回買幣和賣幣掛單
   */
  getPendingOrders: async (): Promise<UserPendingOrdersResponse> => {
    const response = await httpClient.get<ApiResponse<UserPendingOrdersResponse>>('/users/pending/orders');
    return response.data.data;
  },
};
