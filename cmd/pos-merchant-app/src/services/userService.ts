// import { userApi } from '../apis'; // 未來會使用
import { User } from '../types';
import { delay } from '../utils';

export const userService = {
  // 獲取用戶資料 (包含緩存和錯誤處理)
  fetchUserFromApi: async (userId: string): Promise<User> => {
    try {
      // 模擬網路延遲
      await delay(500);
      
      // 實際環境中這裡會調用真實的 API
      // return await userApi.getUser(userId);
      
      // 模擬數據 (開發階段使用)
      const mockUser: User = {
        id: userId,
        name: `用戶 ${userId}`,
        email: `user${userId}@example.com`,
        avatar: `https://i.pravatar.cc/150?u=${userId}`,
      };
      
      return mockUser;
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      throw new Error(error.message || '獲取用戶資料失敗');
    }
  },

  // 獲取用戶列表
  fetchUsers: async (): Promise<User[]> => {
    try {
      await delay(300);
      
      // 模擬數據
      const mockUsers: User[] = [
        {
          id: '1',
          name: '張三',
          email: 'zhang@example.com',
          avatar: 'https://i.pravatar.cc/150?u=1',
        },
        {
          id: '2',
          name: '李四',
          email: 'li@example.com',
          avatar: 'https://i.pravatar.cc/150?u=2',
        },
        {
          id: '3',
          name: '王五',
          email: 'wang@example.com',
          avatar: 'https://i.pravatar.cc/150?u=3',
        },
      ];
      
      return mockUsers;
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      throw new Error(error.message || '獲取用戶列表失敗');
    }
  },

  // 建立用戶
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
      await delay(500);
      
      // 模擬建立用戶
      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
      };
      
      return newUser;
    } catch (error: any) {
      console.error('Failed to create user:', error);
      throw new Error(error.message || '建立用戶失敗');
    }
  },

  // 更新用戶
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    try {
      await delay(400);
      
      // 模擬更新用戶
      const updatedUser: User = {
        id: userId,
        name: userData.name || `用戶 ${userId}`,
        email: userData.email || `user${userId}@example.com`,
        avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userId}`,
      };
      
      return updatedUser;
    } catch (error: any) {
      console.error('Failed to update user:', error);
      throw new Error(error.message || '更新用戶失敗');
    }
  },
};
