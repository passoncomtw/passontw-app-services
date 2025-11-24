// Electron 特定服務
export const electronService = {
  // 檢查是否在 Electron 環境中
  isElectron: (): boolean => {
    return !!(window as any).electronAPI;
  },

  // 獲取 Electron 版本資訊
  getVersions: () => {
    if (typeof process !== 'undefined' && process.versions) {
      return {
        electron: process.versions.electron || 'N/A',
        node: process.versions.node || 'N/A',
        chrome: process.versions.chrome || 'N/A',
      };
    }
    return {
      electron: 'N/A',
      node: 'N/A',
      chrome: 'N/A',
    };
  },

  // 開啟外部連結
  openExternal: (url: string) => {
    if (electronService.isElectron()) {
      // 在 Electron 中使用 shell.openExternal
      window.open(url, '_blank');
    } else {
      // 在瀏覽器中正常開啟
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  },

  // 顯示訊息對話框
  showMessageBox: async (message: string, _type: 'info' | 'warning' | 'error' = 'info') => {
    if (electronService.isElectron()) {
      // 這裡可以調用 Electron 的 dialog API
      alert(message); // 暫時使用 alert
    } else {
      alert(message);
    }
  },

  // 獲取應用程式路徑
  getAppPath: (): string => {
    if (electronService.isElectron() && (window as any).electronAPI?.getAppPath) {
      return (window as any).electronAPI.getAppPath();
    }
    return '/';
  },

  // 最小化視窗
  minimizeWindow: () => {
    if (electronService.isElectron() && (window as any).electronAPI?.minimizeWindow) {
      (window as any).electronAPI.minimizeWindow();
    }
  },

  // 最大化視窗
  maximizeWindow: () => {
    if (electronService.isElectron() && (window as any).electronAPI?.maximizeWindow) {
      (window as any).electronAPI.maximizeWindow();
    }
  },

  // 關閉視窗
  closeWindow: () => {
    if (electronService.isElectron() && (window as any).electronAPI?.closeWindow) {
      (window as any).electronAPI.closeWindow();
    }
  },
};
