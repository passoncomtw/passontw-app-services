import axios, { AxiosInstance, AxiosResponse } from 'axios';
import logger from '@pkg/logger';

// 使用 Vite 環境變數，預設指向本機 API
const baseURL =
  import.meta.env?.VITE_API_BASE_URL?.toString() || 'http://localhost:3001';

// HTTP 客戶端配置
const httpClient: AxiosInstance = axios.create({
  baseURL,
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
      logger.debug('HTTP Request - Authorization header set', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
      });
    }
    
    // 記錄請求
    logger.info(`HTTP ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    logger.error('HTTP Request error', { error });
    return Promise.reject(error);
  }
);

// 回應攔截器
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 記錄成功回應
    logger.info(`HTTP ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // 統一錯誤處理
    logger.error('HTTP Response error', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    });

    const isAuthLogin =
      typeof error?.config?.url === 'string' &&
      error.config.url.includes('/api/v1/auth/login');

    if (error.response?.status === 401 && !isAuthLogin) {
      // 其他 API 未授權時清除 token 並回登入頁
      logger.warn('HTTP 401 Unauthorized - Redirecting to login', {
        url: error.config?.url,
      });
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default httpClient;
