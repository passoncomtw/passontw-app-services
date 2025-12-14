import httpClient from './httpClient';
import type { ApiResponse, User } from './authApi';

export const userApi = {
  /**
   * 取得用戶資訊
   */
  getUser: async (userId: number): Promise<User> => {
    const response = await httpClient.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data.data;
  },
};

