import axios, { AxiosInstance, AxiosResponse } from 'axios';

// HTTP 客戶端配置
const httpClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
httpClient.interceptors.request.use(
  (config) => {
    // 可以在這裡添加認證 token 等
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 記錄請求
    console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('[HTTP] Request error:', error);
    return Promise.reject(error);
  }
);

// 回應攔截器
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 記錄成功回應
    console.log(`[HTTP] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // 統一錯誤處理
    console.error('[HTTP] Response error:', error);
    
    if (error.response?.status === 401) {
      // 處理未授權錯誤
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default httpClient;
