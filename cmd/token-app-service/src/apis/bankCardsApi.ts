import httpClient from './httpClient';
import type { ApiResponse } from './authApi';

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

export const bankCardsApi = {
  /**
   * 取得使用者的銀行卡列表
   */
  getBankCards: async (): Promise<BankCard[]> => {
    const response = await httpClient.get<ApiResponse<BankCard[]>>('/bankcards');
    return response.data.data;
  },
};

