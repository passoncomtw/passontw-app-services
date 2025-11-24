// 應用程式常數
export const APP_NAME = 'Electron React App';
export const APP_VERSION = '1.0.0';

// 路由常數
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SETTINGS: '/settings',
  DASHBOARD: '/dashboard',
} as const;

// 主題常數
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// API 常數
export const API_ENDPOINTS = {
  USERS: '/api/users',
  SETTINGS: '/api/settings',
} as const;

// 本地存儲 keys
export const STORAGE_KEYS = {
  THEME: 'app_theme',
  SIDEBAR_STATE: 'sidebar_state',
  USER_PREFERENCES: 'user_preferences',
} as const;
