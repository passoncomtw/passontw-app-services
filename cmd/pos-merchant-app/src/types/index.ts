// 應用程式狀態類型定義
export interface RootState {
  app: AppState;
}

// App 狀態
export interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  products: Product[];
  productsLoading: boolean;
}

// 用戶類型
export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  merchantId?: string;
  avatar?: string;
}

// 商品類型
export interface Product {
  id: string;
  name: string;
  category: 'drink' | 'oden';
  price: number;
  description: string;
  image?: string;
  is_active?: boolean;
  customizable?: boolean;
  customizations?: ProductCustomization[];
}

// 商品客製化選項
export interface ProductCustomization {
  type: 'sugar' | 'ice';
  name: string;
  options: CustomizationOption[];
}

// 客製化選項
export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

// 購物車項目
export interface CartItem {
  product: Product;
  quantity: number;
  customizations: {
    sugar?: string;
    ice?: string;
  };
  totalPrice: number;
}

// 訂單類型
export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  cashReceived: number;
  change: number;
  createdAt: string;
}

// API 回應類型
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Auth
export interface AuthLoginData {
  token: string;
  user: {
    user_id: string;
    merchant_id: string;
    username: string;
    email: string;
  };
  request_id?: string;
}

// API 錯誤類型
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
