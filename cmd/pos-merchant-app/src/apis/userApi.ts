import httpClient from './httpClient';
import { User, ApiResponse } from '../types';

export const userApi = {
  // 獲取用戶資料
  getUser: async (userId: string): Promise<User> => {
    const response = await httpClient.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data.data;
  },

  // 獲取所有用戶
  getUsers: async (): Promise<User[]> => {
    const response = await httpClient.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },

  // 建立用戶
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await httpClient.post<ApiResponse<User>>('/users', userData);
    return response.data.data;
  },

  // 更新用戶
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await httpClient.put<ApiResponse<User>>(`/users/${userId}`, userData);
    return response.data.data;
  },

  // 刪除用戶
  deleteUser: async (userId: string): Promise<void> => {
    await httpClient.delete(`/users/${userId}`);
  },
};
