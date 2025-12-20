import { put, select, call } from 'redux-saga/effects';
import logger from '../logger';

/**
 * Snackbar 配置
 */
interface SnackbarConfig {
  level: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

/**
 * Success Action Payload
 */
interface SuccessActionPayload<T = any> {
  type: string;
  payload: T;
  snackbar?: SnackbarConfig;
}

/**
 * Error Payload
 */
interface ErrorPayload {
  code: string;
  message: string;
}

/**
 * Error Action Payload
 */
interface ErrorActionPayload {
  type: string;
  payload: ErrorPayload;
  snackbar: SnackbarConfig;
}

/**
 * API 標準響應格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  code: string;
}

/**
 * 檢查值是否為空
 */
const isEmpty = (value: any): boolean => {
  return value === undefined || value === null || value === '';
};

/**
 * 檢查是否為函數
 */
const isFunction = (value: any): value is Function => {
  return typeof value === 'function';
};

/**
 * 生成成功的 Action
 */
const okFetch = <T = any>(
  payload: T,
  action: string,
  message?: string
): SuccessActionPayload<T> => {
  const successPayload: SuccessActionPayload<T> = {
    type: `${action}_SUCCESS`,
    payload,
    snackbar: {
      level: 'success',
      message: message || '',
    },
  };

  // 如果 message 為空，移除 snackbar
  if (isEmpty(message)) {
    delete successPayload.snackbar;
  }

  return successPayload;
};

/**
 * 生成錯誤的 Action
 */
const errFetch = (
  error: ErrorPayload,
  action: string
): ErrorActionPayload => ({
  type: `${action}_ERROR`,
  payload: {
    code: error.code,
    message: error.message,
  },
  snackbar: {
    level: 'error',
    message: error.message,
  },
});

/**
 * fetchAPIResult 參數選項
 */
export interface FetchAPIOptions<TPayload = any, TResponse = any> {
  /** API 呼叫函數 */
  apiResult: (config: {
    customHeaders: Record<string, string>;
    payload: TPayload;
  }) => Promise<ApiResponse<TResponse>>;
  
  /** 自訂 Headers */
  headers?: Record<string, string>;
  
  /** 請求 Payload */
  payload: TPayload;
  
  /** Action 名稱（用於生成 SUCCESS/ERROR action types） */
  action: string;
  
  /** 成功訊息（顯示在 Snackbar） */
  message?: string;
  
  /** 結果處理器（可選，用於轉換響應數據） */
  resultHandler?: ((data: TResponse) => any) | null;
  
  /** 成功回調 */
  onSuccess?: ((data: TResponse) => void) | ((data: TResponse) => Generator<any, void, any>);
  
  /** 錯誤回調 */
  onError?: ((error: ErrorPayload) => void) | ((error: ErrorPayload) => Generator<any, void, any>);
  
  /** Token Selector（從 Redux Store 讀取 token） */
  tokenSelector?: (state: any) => string | null;
}

/**
 * 通用的 Saga API 呼叫 Helper
 * 
 * 功能：
 * 1. 自動從 Redux Store 讀取 token 並添加到 Authorization header
 * 2. 統一處理 API 響應格式
 * 3. 自動 dispatch SUCCESS/ERROR actions
 * 4. 支持 Snackbar 通知
 * 5. 支持自訂結果處理器
 * 
 * @example
 * ```typescript
 * import logger from '@pkg/logger';
 * 
 * function* loginSaga(action: PayloadAction<LoginCredentials>) {
 *   yield call(fetchAPIResult, {
 *     apiResult: loginApi,
 *     payload: action.payload,
 *     action: 'auth/login',
 *     message: '登入成功',
 *     tokenSelector: (state) => state.auth.accessToken,
 *     onSuccess: (data) => {
 *       logger.info('登入成功', data);
 *     },
 *     onError: (error) => {
 *       logger.warn('登入失敗', error);
 *     },
 *   });
 * }
 * ```
 */
export default function* fetchAPIResult<TPayload = any, TResponse = any>({
  apiResult,
  headers = {},
  payload,
  action,
  message = '',
  resultHandler = null,
  onSuccess,
  onError,
  tokenSelector,
}: FetchAPIOptions<TPayload, TResponse>): Generator<any, void, any> {
  try {
    // 準備 Headers
    const customHeaders: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    };

    // 如果提供了 tokenSelector，從 Redux Store 讀取 token
    if (tokenSelector) {
      const token: string | null = yield select(tokenSelector);
      if (token) {
        customHeaders.Authorization = `Bearer ${token}`;
      }
    }

    // 呼叫 API
    logger.debug(`[${action}] API 請求開始`);
    
    const resp: ApiResponse<TResponse> = yield call(apiResult, {
      customHeaders,
      payload,
    });

    logger.info(`[${action}] API 響應成功`, {
      success: resp.success,
      code: resp.code,
    });

    // 檢查業務邏輯是否成功
    if (!resp.success || resp.code !== 'SUCCESS') {
      throw {
        code: resp.code || 'API_ERROR',
        message: resp.message || '請求失敗',
      };
    }

    const { data } = resp;

    // 如果有結果處理器，使用它轉換數據
    if (isFunction(resultHandler)) {
      const transformedData = resultHandler(data);
      yield put(okFetch(transformedData, action, message));
      
      // 執行成功回調
      if (onSuccess) {
        const result = onSuccess(transformedData);
        // 如果是 generator，yield 它
        if (result && typeof result === 'object' && 'next' in result) {
          yield result;
        }
      }
      return;
    }

    // 沒有結果處理器，直接使用原始數據
    yield put(okFetch(data, action, message));

    // 執行成功回調
    if (onSuccess) {
      const result = onSuccess(data);
      // 如果是 generator，yield 它
      if (result && typeof result === 'object' && 'next' in result) {
        yield result;
      }
    }
  } catch (error: any) {
    logger.warn(`[${action}] API 錯誤`, error);

    // 標準化錯誤格式
    let errorPayload: ErrorPayload;

    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      // 已經是標準格式
      errorPayload = {
        code: error.code,
        message: error.message,
      };
    } else if (error instanceof Error) {
      // JavaScript Error
      errorPayload = {
        code: 'ERROR',
        message: error.message,
      };
    } else if (typeof error === 'string') {
      // 字串錯誤
      errorPayload = {
        code: 'ERROR',
        message: error,
      };
    } else {
      // 未知錯誤
      errorPayload = {
        code: 'UNKNOWN_ERROR',
        message: '未知錯誤',
      };
    }

    // Dispatch 錯誤 Action
    yield put(errFetch(errorPayload, action));

    // 執行錯誤回調
    if (onError) {
      const result = onError(errorPayload);
      // 如果是 generator，yield 它
      if (result && typeof result === 'object' && 'next' in result) {
        yield result;
      }
    }
  }
}

/**
 * 錯誤處理結果（包含狀態碼）
 */
export interface SagaErrorResult {
  message: string;
  statusCode?: number;
}

/**
 * 統一的錯誤處理函數
 * 
 * 區分業務邏輯錯誤和系統錯誤：
 * - API 回應錯誤（如密碼錯誤、餘額不足）：使用 logger.warn
 * - 系統錯誤（如網路異常、伺服器崩潰）：使用 logger.error
 * 
 * @param error - 錯誤對象
 * @param context - 錯誤上下文（如 '登入失敗'、'建立訂單失敗'）
 * @param additionalInfo - 額外資訊（如 orderId、userId 等）
 * @returns 錯誤訊息和 HTTP 狀態碼
 * 
 * @example
 * ```typescript
 * try {
 *   const data = yield call(api.login, credentials);
 * } catch (error: any) {
 *   const errorResult = handleSagaError(error, '登入失敗');
 *   yield put(loginFailure(errorResult));
 *   // errorSaga 會自動檢查 statusCode，如果是 401 會自動登出
 * }
 * ```
 */
export function handleSagaError(
  error: any,
  context: string,
  additionalInfo?: Record<string, any>
): SagaErrorResult {
  const statusCode = error.response?.status;
  const errorMessage = error.response?.data?.message || error.message || `${context}，請稍後再試`;
  
  if (error.response?.data?.message) {
    // API 回應的業務邏輯錯誤（預期內的錯誤）
    logger.warn(`${context} - API 回應錯誤`, {
      message: errorMessage,
      statusCode,
      ...additionalInfo,
    });
  } else {
    // 系統錯誤（網路異常或意外錯誤）
    logger.error(`${context} - 系統錯誤`, {
      error: error.message || error,
      statusCode,
      ...additionalInfo,
    });
  }
  
  return {
    message: errorMessage,
    statusCode,
  };
}

/**
 * 通用的 API 請求函數
 * 
 * @param apiBaseUrl - API 基礎 URL
 * @param endpoint - API 端點（例如：'/auth/login'）
 * @param method - HTTP 方法
 * @param body - 請求體
 * @param customHeaders - 自訂 Headers
 */
export async function apiRequest<T = any>(
  apiBaseUrl: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  body?: any,
  customHeaders: Record<string, string> = {}
): Promise<ApiResponse<T>> {
  const url = `${apiBaseUrl}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: customHeaders,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  logger.debug(`API 請求: ${method} ${url}`);

  try {
    const response = await fetch(url, options);
    const data: ApiResponse<T> = await response.json();

    logger.debug(`API 響應: ${response.status}`, {
      success: data.success,
      code: data.code,
    });

    if (!response.ok) {
      throw {
        code: data.code || `HTTP_${response.status}`,
        message: data.message || `請求失敗 (${response.status})`,
      };
    }

    return data;
  } catch (error) {
    logger.warn('API 請求異常', error);

    // 網路錯誤處理
    if (error instanceof TypeError) {
      if (error.message.includes('Network request failed') || 
          error.message.includes('Failed to fetch')) {
        throw {
          code: 'NETWORK_ERROR',
          message: '網路連線失敗，請檢查網路設定',
        };
      }
    }
    
    throw error;
  }
}

