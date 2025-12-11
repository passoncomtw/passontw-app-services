import httpClient from './httpClient';
import { ApiResponse, AuthLoginData } from '../types';

export const authApi = {
  /**
   * PIN 登入
   */
  login: async (pin: string): Promise<AuthLoginData> => {
    const response = await httpClient.post<ApiResponse<AuthLoginData>>(
      '/api/v1/auth/login',
      { pin }
    );
    return response.data.data;
  },
};

