import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 使用 Expo 環境變數，從 .env 讀取 BASE_URL
// Expo 需要使用 EXPO_PUBLIC_ 前綴才能在 JavaScript 中使用
const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://token-app-api.passon.tw';

// 儲存導航引用（需要在 App 初始化時設定）
let navigationRef: any = null;

/**
 * 設定導航引用（用於未授權時導航到登入頁）
 */
export function setNavigationRef(ref: any) {
  navigationRef = ref;
}

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
  async (config) => {
    // 可以在這裡添加認證 token 等
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[HTTP] Failed to get token from AsyncStorage:', error);
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
  async (error) => {
    // 統一錯誤處理
    console.error('[HTTP] Response error:', error);

    const isAuthLogin =
      typeof error?.config?.url === 'string' &&
      (error.config.url.includes('/auth/login') ||
       error.config.url.includes('/api/v1/auth/login'));

    if (error.response?.status === 401 && !isAuthLogin) {
      // 其他 API 未授權時清除 token 並導航到登入頁
      try {
        await AsyncStorage.removeItem('authToken');
      } catch (storageError) {
        console.error('[HTTP] Failed to remove token from AsyncStorage:', storageError);
      }

      // React Native 環境：使用導航引用導航到登入頁
      if (navigationRef) {
        import('@react-navigation/native').then(({ CommonActions }) => {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          );
        }).catch((error) => {
          console.error('[HTTP] Failed to navigate to login:', error);
        });
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;

