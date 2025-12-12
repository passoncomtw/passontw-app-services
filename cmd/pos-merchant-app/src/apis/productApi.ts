import httpClient from './httpClient';
import { ApiResponse, Product } from '../types';

// API 回應的產品格式（依實際後端為準，這裡做必要欄位型別）
export interface ProductResponse {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  is_active?: boolean;
  customizable?: boolean;
  customizations?: Array<{
    type: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      price_modifier?: number;
    }>;
  }>;
}

export const productApi = {
  getProducts: async (): Promise<ProductResponse[]> => {
    const response = await httpClient.get<ApiResponse<ProductResponse[]>>(
      '/api/v1/products'
    );
    return response.data.data;
  },
};

