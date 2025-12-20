import httpClient, { httpClientWithAuth } from './httpClient';
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
 * 掛單列表回應格式（分頁）
 */
export interface PendingOrderListResponse {
  rows: PendingOrder[];
  page: number;
  size: number;
  total: number;
}

/**
 * 掛單列表查詢參數
 */
export interface GetPendingOrdersParams {
  type?: number; // 0: 買幣, 1: 賣幣
  balance?: number; // 餘額搜尋
  size?: number; // 每頁筆數
  page?: number; // 頁碼
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

/**
 * 訂單資料結構
 */
export interface Order {
  id: string;
  orderId: string; // 掛單 ID
  userId: number;
  amount: number;
  beneficiaryBankcardId: number;
  status: number; // 訂單狀態
  createdAt: string;
  updatedAt?: string;
}

/**
 * 建立訂單請求
 */
export interface CreateOrderRequest {
  orderId: string; // 掛單 ID
  amount: number; // 交易金額
  beneficiaryBankcardId: number; // 受益人銀行卡 ID
  transactionCode: string; // 交易密碼
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

  /**
   * 刪除掛單
   * 需要認證 token
   */
  deletePendingOrder: async (orderId: string): Promise<void> => {
    await httpClientWithAuth.deleteWithToken(`/pending/orders/${orderId}`);
  },

  /**
   * 取得掛單列表（公開API，無需認證）
   * 可依類型和餘額篩選，支援分頁
   */
  getPendingOrdersList: async (params?: GetPendingOrdersParams): Promise<PendingOrderListResponse> => {
    const response = await httpClient.get<ApiResponse<PendingOrderListResponse>>('/pending/orders', { params });
    return response.data.data;
  },

  /**
   * 建立訂單
   * 從掛單建立一筆新的訂單
   * 需要認證 token
   */
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await httpClientWithAuth.postWithToken<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  },
};
