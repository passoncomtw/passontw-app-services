/**
 * Logger 模組
 * 提供統一的日誌記錄功能，支持不同層級的日誌輸出
 * 可通過環境變數 LOG_LEVEL 或 EXPO_PUBLIC_LOG_LEVEL 設定日誌級別
 */

/**
 * 日誌層級
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Logger 配置
 */
interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableColors: boolean;
}

/**
 * 從環境變數讀取日誌級別
 * 支援多種環境：Node.js、Expo、Vite
 */
const getLogLevelFromEnv = (): LogLevel => {
  let envLevel: string | undefined;

  // 檢查不同環境的環境變數
  if (typeof process !== 'undefined' && process.env) {
    // Node.js 或 Electron 環境
    envLevel = process.env.EXPO_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL;
  } else if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Vite 環境
    envLevel = import.meta.env.VITE_LOG_LEVEL || import.meta.env.EXPO_PUBLIC_LOG_LEVEL;
  } else if (typeof window !== 'undefined' && (window as any).__ENV__) {
    // 其他瀏覽器環境（如果有注入環境變數）
    const windowEnv = (window as any).__ENV__;
    envLevel = windowEnv.EXPO_PUBLIC_LOG_LEVEL || windowEnv.LOG_LEVEL;
  }
  
  if (!envLevel) {
    // 如果沒有設定，則根據環境決定
    // 檢查是否為開發環境
    const isDev = 
      (typeof __DEV__ !== 'undefined' && __DEV__) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
    
    return isDev ? LogLevel.DEBUG : LogLevel.WARN;
  }

  // 將字串轉換為 LogLevel
  const levelMap: Record<string, LogLevel> = {
    'DEBUG': LogLevel.DEBUG,
    'INFO': LogLevel.INFO,
    'WARN': LogLevel.WARN,
    'ERROR': LogLevel.ERROR,
    'NONE': LogLevel.NONE,
  };

  const upperEnvLevel = envLevel.toUpperCase();
  const isDev = 
    (typeof __DEV__ !== 'undefined' && __DEV__) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
  
  return levelMap[upperEnvLevel] ?? (isDev ? LogLevel.DEBUG : LogLevel.WARN);
};

/**
 * 默認配置
 */
const defaultConfig: LoggerConfig = {
  level: getLogLevelFromEnv(),
  enableTimestamp: true,
  enableColors: true,
};

/**
 * 當前配置
 */
let currentConfig: LoggerConfig = { ...defaultConfig };

/**
 * 日誌顏色映射（僅用於終端輸出）
 */
const levelColors: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '🔍',
  [LogLevel.INFO]: 'ℹ️',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '❌',
  [LogLevel.NONE]: '',
};

const levelNames: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.NONE]: 'NONE',
};

/**
 * 格式化時間戳
 */
const formatTimestamp = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

/**
 * 格式化日誌訊息
 */
const formatMessage = (level: LogLevel, message: string, data?: any): string => {
  const parts: string[] = [];

  if (currentConfig.enableTimestamp) {
    parts.push(`[${formatTimestamp()}]`);
  }

  if (currentConfig.enableColors) {
    parts.push(`${levelColors[level]} ${levelNames[level]}`);
  } else {
    parts.push(`[${levelNames[level]}]`);
  }

  parts.push(message);

  return parts.join(' ');
};

/**
 * 核心日誌函數
 */
const log = (level: LogLevel, message: string, ...args: any[]) => {
  // 檢查日誌層級
  if (level < currentConfig.level) {
    return;
  }

  const formattedMessage = formatMessage(level, message);

  // 根據層級選擇 console 方法
  switch (level) {
    case LogLevel.DEBUG:
    case LogLevel.INFO:
      console.log(formattedMessage, ...args);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, ...args);
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage, ...args);
      break;
  }
};

/**
 * Logger 對象
 */
export const logger = {
  /**
   * DEBUG 層級日誌
   * 用於詳細的調試信息
   */
  debug: (message: string, ...args: any[]) => {
    log(LogLevel.DEBUG, message, ...args);
  },

  /**
   * INFO 層級日誌
   * 用於一般信息
   */
  info: (message: string, ...args: any[]) => {
    log(LogLevel.INFO, message, ...args);
  },

  /**
   * WARN 層級日誌
   * 用於警告信息
   */
  warn: (message: string, ...args: any[]) => {
    log(LogLevel.WARN, message, ...args);
  },

  /**
   * ERROR 層級日誌
   * 用於錯誤信息
   */
  error: (message: string, ...args: any[]) => {
    log(LogLevel.ERROR, message, ...args);
  },

  /**
   * 設置日誌層級
   */
  setLevel: (level: LogLevel) => {
    currentConfig.level = level;
  },

  /**
   * 從字串設置日誌層級
   */
  setLevelByName: (levelName: string) => {
    const levelMap: Record<string, LogLevel> = {
      'DEBUG': LogLevel.DEBUG,
      'INFO': LogLevel.INFO,
      'WARN': LogLevel.WARN,
      'ERROR': LogLevel.ERROR,
      'NONE': LogLevel.NONE,
    };
    const level = levelMap[levelName.toUpperCase()];
    if (level !== undefined) {
      currentConfig.level = level;
    }
  },

  /**
   * 設置配置
   */
  configure: (config: Partial<LoggerConfig>) => {
    currentConfig = { ...currentConfig, ...config };
  },

  /**
   * 重置為默認配置
   */
  reset: () => {
    currentConfig = { ...defaultConfig };
  },

  /**
   * 獲取當前配置
   */
  getConfig: () => ({ ...currentConfig }),

  /**
   * 獲取當前日誌級別名稱
   */
  getCurrentLevelName: (): string => {
    return levelNames[currentConfig.level] || 'UNKNOWN';
  },
};

/**
 * 默認導出
 */
export default logger;

