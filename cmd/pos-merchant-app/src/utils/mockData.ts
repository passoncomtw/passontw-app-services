// Mock 資料 - 遵循 DRY 原則，統一管理測試資料

import type { Product, CustomizationOption } from '../types'

// 客製化選項
export const SUGAR_OPTIONS: CustomizationOption[] = [
  { id: 'no-sugar', name: '無糖', price: 0 },
  { id: 'half-sugar', name: '半糖', price: 0 },
  { id: 'full-sugar', name: '全糖', price: 0 },
]

export const ICE_OPTIONS: CustomizationOption[] = [
  { id: 'no-ice', name: '去冰', price: 0 },
  { id: 'less-ice', name: '少冰', price: 0 },
  { id: 'normal-ice', name: '正常冰', price: 0 },
]

// Mock 商品資料 - 40 個商品
export const MOCK_PRODUCTS: Product[] = [
  // 飲料類商品 (20項)
  {
    id: 'drink-1',
    name: '珍珠奶茶',
    category: 'drink',
    price: 45,
    description: '香濃奶茶搭配Q彈珍珠',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-2',
    name: '紅茶',
    category: 'drink',
    price: 25,
    description: '經典阿薩姆紅茶',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-3',
    name: '綠茶',
    category: 'drink',
    price: 25,
    description: '清香茉莉綠茶',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-4',
    name: '烏龍茶',
    category: 'drink',
    price: 30,
    description: '濃郁烏龍茶香',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-5',
    name: '檸檬茶',
    category: 'drink',
    price: 35,
    description: '清爽檸檬紅茶',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-6',
    name: '蜂蜜檸檬',
    category: 'drink',
    price: 40,
    description: '天然蜂蜜檸檬',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-7',
    name: '冬瓜茶',
    category: 'drink',
    price: 30,
    description: '傳統冬瓜茶',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-8',
    name: '青草茶',
    category: 'drink',
    price: 35,
    description: '清涼青草茶',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-9',
    name: '仙草茶',
    category: 'drink',
    price: 35,
    description: '滑嫩仙草茶',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-10',
    name: '奶茶',
    category: 'drink',
    price: 40,
    description: '香濃奶茶',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-11',
    name: '咖啡',
    category: 'drink',
    price: 45,
    description: '香醇美式咖啡',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-12',
    name: '拿鐵',
    category: 'drink',
    price: 50,
    description: '香濃拿鐵咖啡',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-13',
    name: '卡布奇諾',
    category: 'drink',
    price: 50,
    description: '義式卡布奇諾',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-14',
    name: '摩卡',
    category: 'drink',
    price: 55,
    description: '巧克力摩卡咖啡',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-15',
    name: '焦糖瑪奇朵',
    category: 'drink',
    price: 60,
    description: '香甜焦糖瑪奇朵',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-16',
    name: '抹茶拿鐵',
    category: 'drink',
    price: 55,
    description: '日式抹茶拿鐵',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-17',
    name: '巧克力牛奶',
    category: 'drink',
    price: 45,
    description: '濃郁巧克力牛奶',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-18',
    name: '草莓牛奶',
    category: 'drink',
    price: 50,
    description: '香甜草莓牛奶',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-19',
    name: '芒果冰沙',
    category: 'drink',
    price: 65,
    description: '新鮮芒果冰沙',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  {
    id: 'drink-20',
    name: '草莓冰沙',
    category: 'drink',
    price: 65,
    description: '香甜草莓冰沙',
    customizations: [
      {
        type: 'sugar',
        name: '糖度',
        options: SUGAR_OPTIONS,
      },
      {
        type: 'ice',
        name: '冰量',
        options: ICE_OPTIONS,
      },
    ],
  },
  // 關東煮類商品 (20項)
  {
    id: 'oden-1',
    name: '白蘿蔔',
    category: 'oden',
    price: 15,
    description: '清甜白蘿蔔',
  },
  {
    id: 'oden-2',
    name: '魚板',
    category: 'oden',
    price: 20,
    description: 'Q彈魚板',
  },
  {
    id: 'oden-3',
    name: '竹輪',
    category: 'oden',
    price: 20,
    description: '香嫩竹輪',
  },
  {
    id: 'oden-4',
    name: '魚丸',
    category: 'oden',
    price: 25,
    description: '彈牙魚丸',
  },
  {
    id: 'oden-5',
    name: '蝦丸',
    category: 'oden',
    price: 30,
    description: '鮮甜蝦丸',
  },
  {
    id: 'oden-6',
    name: '貢丸',
    category: 'oden',
    price: 25,
    description: '香嫩貢丸',
  },
  {
    id: 'oden-7',
    name: '花枝丸',
    category: 'oden',
    price: 30,
    description: 'Q彈花枝丸',
  },
  {
    id: 'oden-8',
    name: '蟹肉棒',
    category: 'oden',
    price: 25,
    description: '鮮甜蟹肉棒',
  },
  {
    id: 'oden-9',
    name: '海帶',
    category: 'oden',
    price: 15,
    description: '滑嫩海帶',
  },
  {
    id: 'oden-10',
    name: '豆皮',
    category: 'oden',
    price: 20,
    description: '香嫩豆皮',
  },
  {
    id: 'oden-11',
    name: '油豆腐',
    category: 'oden',
    price: 20,
    description: '嫩滑油豆腐',
  },
  {
    id: 'oden-12',
    name: '蒟蒻',
    category: 'oden',
    price: 15,
    description: 'Q彈蒟蒻',
  },
  {
    id: 'oden-13',
    name: '香菇',
    category: 'oden',
    price: 25,
    description: '香嫩香菇',
  },
  {
    id: 'oden-14',
    name: '金針菇',
    category: 'oden',
    price: 20,
    description: '滑嫩金針菇',
  },
  {
    id: 'oden-15',
    name: '玉米',
    category: 'oden',
    price: 20,
    description: '香甜玉米',
  },
  {
    id: 'oden-16',
    name: '高麗菜',
    category: 'oden',
    price: 15,
    description: '清甜高麗菜',
  },
  {
    id: 'oden-17',
    name: '白菜',
    category: 'oden',
    price: 15,
    description: '嫩滑白菜',
  },
  {
    id: 'oden-18',
    name: '茼蒿',
    category: 'oden',
    price: 20,
    description: '清香茼蒿',
  },
  {
    id: 'oden-19',
    name: '蛋',
    category: 'oden',
    price: 15,
    description: '嫩滑水煮蛋',
  },
  {
    id: 'oden-20',
    name: '豆腐',
    category: 'oden',
    price: 20,
    description: '嫩滑豆腐',
  },
]

// 工具函數
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
  }).format(amount)
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
} 