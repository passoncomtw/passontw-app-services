import httpClient from './httpClient';

/**
 * 登入憑證
 */
export interface LoginCredentials {
  account: string;
  password: string;
  notificationToken?: string;
}

/**
 * 註冊憑證
 */
export interface RegisterCredentials {
  nickname: string;
  account: string;
  email: string;
  password: string;
  transactionPassword: string;
  referralCode?: string;
  notificationToken?: string;
}

/**
 * 登入響應數據
 */
export interface LoginData {
  access_token: string;
  expireIn: number;
  user: User;
}

/**
 * 推薦人資訊
 */
export interface ReferralUser {
  id: number;
  account: string;
  email: string;
  name: string;
  type: number;
}

/**
 * 用戶資訊
 */
export interface User {
  id: number;
  type: number;
  account: string;
  name: string;
  email: string;
  createAt: string;
  referralCode: string;
  referralUser?: ReferralUser;
  wallet: UserWallet;
}

/**
 * 用戶錢包資訊
 */
export interface UserWallet {
  status: number;
  usefulBalance: number;
  guaranteedBalance: number;
  freezeBalance: number;
}

/**
 * 註冊響應數據
 */
export interface RegisterData {
  id: number;
  type: number;
  account: string;
  name: string;
  email: string;
  createAt: string;
  referralCode: string;
  wallet: UserWallet;
}

/**
 * API 回應格式
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: string;
}

export const authApi = {
  /**
   * 登入
   */
  login: async (credentials: LoginCredentials): Promise<LoginData> => {
    const response = await httpClient.post<ApiResponse<LoginData>>('/auth/login', {
      account: credentials.account,
      password: credentials.password,
      notificationToken: credentials.notificationToken || 'expo_default_token',
    });
    return response.data.data;
  },

  /**
   * 註冊
   */
  register: async (credentials: RegisterCredentials): Promise<RegisterData> => {
    const response = await httpClient.post<ApiResponse<RegisterData>>('/users', {
      account: credentials.account,
      email: credentials.email,
      name: credentials.nickname,
      password: credentials.password,
      transactionCode: credentials.transactionPassword,
      referralCode: credentials.referralCode || '',
      type: 0,
    });
    return response.data.data;
  },

  /**
   * 登出
   */
  logout: async (): Promise<void> => {
    await httpClient.post<ApiResponse<void>>('/auth/logout', {});
  },
};

