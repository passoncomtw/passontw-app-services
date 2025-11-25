# PassonTW Merchant App

現代化的 Electron + React 桌面應用程式，整合 Redux Toolkit、Redux Saga、Material-UI，支援跨平台編譯。

---

## 📋 目錄

- [功能特性](#功能特性)
- [技術架構](#技術架構)
- [快速開始](#快速開始)
- [開發指南](#開發指南)
- [編譯指令速查](#編譯指令速查)
- [跨平台編譯](#跨平台編譯)
- [圖標資源準備](#圖標資源準備)
- [CI/CD 自動化](#cicd-自動化)
- [常見問題](#常見問題)

---

## 功能特性

### ✨ 核心功能

- ✅ **Electron + React** - 桌面應用程式框架
- ✅ **Redux Toolkit + Redux Saga** - 狀態管理和非同步流程控制
- ✅ **Material-UI** - 現代化的 UI 元件庫
- ✅ **TypeScript** - 完整的類型安全
- ✅ **React Router** - 單頁應用程式路由
- ✅ **Vite** - 快速的開發建置工具

### 🎨 UI/UX 特性

- 🎯 **響應式設計** - 適配不同螢幕尺寸
- 🌓 **主題支援** - Material-UI 主題系統
- 📱 **跨平台** - Windows、macOS、Linux 支援

---

## 技術架構

### 主要技術棧

```
Electron (30.0.1)
├── React (18.2.0)
├── TypeScript (5.2.2)
├── Vite (5.1.6)
└── 狀態管理
    ├── @reduxjs/toolkit (2.8.2)
    ├── redux-saga (1.3.0)
    └── react-redux (9.2.0)
└── UI 框架
    ├── @mui/material (7.1.2)
    ├── @mui/icons-material (7.1.2)
    └── @emotion/react + @emotion/styled
└── 路由
    └── react-router-dom (7.6.2)
```

---

## 快速開始

### 安裝依賴

```bash
# 使用 yarn
yarn install

# 或使用 npm
npm install
```

### 開發模式

```bash
# 啟動開發伺服器
yarn dev

# 檢查程式碼
yarn lint

# 預覽編譯結果
yarn preview
```

---

## 開發指南

### 專案結構

```
pos-merchant-app/
├── electron/              # Electron 主程序
│   ├── main.ts           # 主程序入口
│   └── preload.ts        # 預載腳本
├── src/
│   ├── actions/          # Redux Actions
│   ├── apis/             # API 客戶端
│   ├── components/       # React 元件
│   │   ├── common/       # 通用元件
│   │   └── layout/       # 版面配置元件
│   ├── layouts/          # 頁面版面
│   ├── pages/            # 頁面元件
│   │   ├── login/        # 登入頁面
│   │   ├── pos/          # POS 頁面
│   │   ├── products/     # 產品頁面
│   │   └── checkout/     # 結帳頁面
│   ├── reducers/         # Redux Reducers
│   ├── sagas/            # Redux Sagas
│   ├── services/         # 服務層
│   ├── store/            # Redux Store
│   ├── theme/            # Material-UI 主題
│   ├── types/            # TypeScript 類型定義
│   └── utils/            # 工具函數
├── build/                # 編譯資源（圖標等）
├── dist/                 # 編譯輸出
└── dist-electron/        # Electron 編譯輸出
```

### 開發流程

1. **啟動開發模式**
   ```bash
   yarn dev
   ```

2. **修改程式碼**
   - React 元件會熱重載
   - Electron 主程序需要重啟

3. **檢查錯誤**
   ```bash
   yarn lint
   ```

4. **測試編譯**
   ```bash
   yarn build
   ```

---

## 編譯指令速查

### 📦 開發

```bash
yarn dev              # 啟動開發模式
yarn lint             # 檢查程式碼
yarn preview          # 預覽編譯結果
```

### 🏗️ 單一平台編譯

#### Windows

```bash
yarn build:win                # Windows 所有版本（推薦）
yarn build:win:x64            # Windows 64-bit
yarn build:win:ia32           # Windows 32-bit
yarn build:win:arm64          # Windows ARM64
```

**輸出檔案**：
- `PassonTW Merchant-Setup-0.0.0-x64.exe` - 64 位元安裝程式
- `PassonTW Merchant-Setup-0.0.0-ia32.exe` - 32 位元安裝程式
- `PassonTW Merchant-0.0.0-x64.exe` - 64 位元 Portable 版

#### macOS

```bash
yarn build:mac                # macOS 所有版本（推薦：分別編譯 x64 和 arm64）
yarn build:mac:intel          # Intel Mac（x64）
yarn build:mac:arm            # Apple Silicon（arm64）
yarn build:mac:universal      # Universal Binary（可能遇到編譯錯誤，見 BUILD_NOTES.md）
```

**輸出檔案**：
- `PassonTW Merchant-0.0.0-x64.dmg` - Intel Mac DMG
- `PassonTW Merchant-0.0.0-x64-mac.zip` - Intel Mac ZIP
- `PassonTW Merchant-0.0.0-arm64.dmg` - Apple Silicon DMG
- `PassonTW Merchant-0.0.0-arm64-mac.zip` - Apple Silicon ZIP

> ⚠️ **注意**: 當前配置會分別編譯 x64 和 arm64 版本，而不是 Universal Binary。詳見 [BUILD_NOTES.md](./BUILD_NOTES.md)

#### Linux

```bash
yarn build:linux              # Linux 所有版本（推薦）
yarn build:linux:x64          # Linux 64-bit
yarn build:linux:arm64        # Linux ARM64
```

**輸出檔案**：
- `PassonTW Merchant-0.0.0-x64.AppImage` - AppImage（通用格式）
- `PassonTW Merchant-0.0.0-amd64.deb` - Debian/Ubuntu 套件
- `PassonTW Merchant-0.0.0-x86_64.rpm` - Fedora/RedHat 套件

### 🌍 多平台編譯

```bash
yarn build:all                # 所有平台（macOS + Windows + Linux）
```

### 📊 輸出檔案結構

```
dist/
├── Windows
│   ├── PassonTW Merchant-Setup-0.0.0-x64.exe     (安裝程式)
│   ├── PassonTW Merchant-Setup-0.0.0-ia32.exe    (32-bit)
│   └── PassonTW Merchant-0.0.0-x64.exe           (Portable)
├── macOS
│   ├── PassonTW Merchant-0.0.0-x64.dmg           (Intel Mac DMG)
│   ├── PassonTW Merchant-0.0.0-x64-mac.zip       (Intel Mac ZIP)
│   ├── PassonTW Merchant-0.0.0-arm64.dmg         (Apple Silicon DMG)
│   └── PassonTW Merchant-0.0.0-arm64-mac.zip     (Apple Silicon ZIP)
└── Linux
    ├── PassonTW Merchant-0.0.0-x64.AppImage      (AppImage)
    ├── PassonTW Merchant-0.0.0-amd64.deb         (Debian)
    └── PassonTW Merchant-0.0.0-x86_64.rpm        (RedHat)
```

### ✅ 推薦編譯組合

#### 生產環境

```bash
yarn build:win:x64            # Windows 64-bit
yarn build:mac                # macOS（x64 + arm64）
yarn build:linux:x64          # Linux 64-bit
```

#### 完整發布

```bash
yarn build:all                # 所有平台所有版本
```

---

## 跨平台編譯

### 📋 支援的目標平台

| 平台 | 架構 | 格式 | 腳本 |
|------|------|------|------|
| **Windows** | x64 | NSIS 安裝程式 | `yarn build:win:x64` |
| **Windows** | ia32 | NSIS 安裝程式 | `yarn build:win:ia32` |
| **Windows** | arm64 | NSIS 安裝程式 | `yarn build:win:arm64` |
| **Windows** | x64 | Portable 版 | `yarn build:win` |
| **macOS** | x64 + arm64 | DMG + ZIP（分開） | `yarn build:mac` ✅ |
| **macOS** | x64 | DMG + ZIP | `yarn build:mac:intel` |
| **macOS** | arm64 | DMG + ZIP | `yarn build:mac:arm` |
| **macOS** | Universal | DMG（單一檔案）| `yarn build:mac:universal` ⚠️ |
| **Linux** | x64 | AppImage + DEB + RPM | `yarn build:linux:x64` |
| **Linux** | arm64 | AppImage + DEB + RPM | `yarn build:linux:arm64` |

> ⚠️ **macOS Universal Binary**: 可能會遇到編譯錯誤。建議使用 `yarn build:mac`（分別編譯 x64 和 arm64）。

### 🌍 跨平台編譯限制

| 編譯平台 | 可編譯目標 | 限制 |
|---------|-----------|------|
| **macOS** | Windows, macOS, Linux | ✅ 可以編譯所有平台 |
| **Windows** | Windows, Linux | ❌ 無法編譯 macOS（缺少 SDK） |
| **Linux** | Windows, Linux | ❌ 無法編譯 macOS（需要 wine 編譯 Windows） |

#### 在 macOS 上編譯所有平台

```bash
# macOS 是最佳的跨平台編譯環境
yarn build:all
```

#### 在 Windows 上編譯

```bash
# Windows 可以編譯 Windows 和 Linux
yarn build:win && yarn build:linux
```

#### 在 Linux 上編譯

```bash
# 需要安裝 wine 來編譯 Windows
sudo apt-get install wine64
yarn build:win && yarn build:linux
```

---

## 圖標資源準備

### 📁 所需檔案

```
build/
├── icon.ico                # Windows 圖標（256x256）
├── icon.icns               # macOS 圖標
└── icons/                  # Linux 圖標（多尺寸）
    ├── 16x16.png
    ├── 32x32.png
    ├── 48x48.png
    ├── 64x64.png
    ├── 128x128.png
    ├── 256x256.png
    └── 512x512.png
```

### 創建圖標

#### macOS ICNS

```bash
# 需要原始 1024x1024 PNG 圖片
# 使用 iconutil（macOS 內建工具）
mkdir icon.iconset
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o build/icon.icns
```

#### Windows ICO

```bash
# 使用線上工具或 ImageMagick
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 build/icon.ico
```

---

## CI/CD 自動化

### GitHub Actions 範例

創建 `.github/workflows/build.yml`：

```yaml
name: Build App

on:
  push:
    tags:
      - 'v*'

jobs:
  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: yarn install
      - run: yarn build:mac
      - uses: actions/upload-artifact@v3
        with:
          name: macos-build
          path: dist/*.dmg

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: yarn install
      - run: yarn build:win
      - uses: actions/upload-artifact@v3
        with:
          name: windows-build
          path: dist/*.exe

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: yarn install
      - run: yarn build:linux
      - uses: actions/upload-artifact@v3
        with:
          name: linux-build
          path: dist/*.AppImage
```

---

## 常見問題

### Q1: 編譯失敗 - TypeScript 錯誤

```bash
# 先修復 TypeScript 錯誤
yarn lint

# 清除並重新編譯
rm -rf dist dist-electron
yarn build
```

### Q2: 找不到圖標檔案

```bash
# 確認 build/ 目錄存在
mkdir -p build/icons

# 準備圖標檔案
# - build/icon.ico (Windows)
# - build/icon.icns (macOS)
# - build/icons/*.png (Linux)
```

### Q3: macOS 無法開啟應用程式（未驗證開發者）

```bash
# 在 macOS 上執行
xattr -cr /Applications/PassonTW\ Merchant.app
```

### Q4: Linux 缺少依賴

```bash
# Ubuntu/Debian
sudo apt-get install libnotify4 libxtst6 libnss3

# Fedora
sudo dnf install libnotify libXtst nss
```

### Q5: 編譯速度太慢

```bash
# 只編譯當前平台
yarn build

# 或只編譯特定架構
yarn build:win:x64        # 只編譯 Windows 64-bit
yarn build:mac:universal  # 只編譯 macOS Universal
```

---

## 🛠️ 編譯配置說明

### Windows 配置

```json
{
  "win": {
    "target": ["nsis", "portable"],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,                    // 允許自訂安裝路徑
    "allowToChangeInstallationDirectory": true,
    "perMachine": true,                   // 所有使用者安裝
    "createDesktopShortcut": true,        // 建立桌面捷徑
    "createStartMenuShortcut": true,      // 建立開始選單捷徑
    "runAfterFinish": true                // 安裝後執行
  }
}
```

### macOS 配置

```json
{
  "mac": {
    "target": ["dmg", "zip"],
    "icon": "build/icon.icns",
    "category": "public.app-category.business",
    "hardenedRuntime": true,              // 強化執行時期
    "darkModeSupport": true               // 支援深色模式
  },
  "dmg": {
    "window": { "width": 540, "height": 380 }
  }
}
```

### Linux 配置

```json
{
  "linux": {
    "target": ["AppImage", "deb", "rpm"],
    "icon": "build/icons",
    "category": "Office"
  },
  "deb": {
    "depends": ["libnotify4", "libxtst6", "libnss3"]
  }
}
```

---

## 📝 版本號管理

更新 `package.json` 中的 `version` 欄位：

```json
{
  "version": "1.0.0"
}
```

編譯檔案名稱會自動包含版本號：
- `PassonTW Merchant-Setup-1.0.0-x64.exe`
- `PassonTW Merchant-1.0.0-universal.dmg`

---

## 📚 相關資源

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux Saga Documentation](https://redux-saga.js.org/)

---

## 🎯 完整編譯腳本列表

```bash
# 基本編譯
yarn build              # 編譯當前平台
yarn build:win          # Windows 所有格式
yarn build:mac          # macOS 所有格式
yarn build:linux        # Linux 所有格式
yarn build:all          # 所有平台所有格式

# Windows 特定架構
yarn build:win:x64      # Windows 64-bit
yarn build:win:ia32     # Windows 32-bit
yarn build:win:arm64    # Windows ARM64

# macOS 特定架構
yarn build:mac:intel    # macOS Intel
yarn build:mac:arm      # macOS Apple Silicon
yarn build:mac:universal # macOS Universal

# Linux 特定架構
yarn build:linux:x64    # Linux 64-bit
yarn build:linux:arm64  # Linux ARM64
```

---

## 📄 授權

Copyright © 2025 PassonTW

---

## 👥 貢獻

歡迎提交 Pull Request 或 Issue！

---

**開始編譯你的 PassonTW Merchant 應用程式吧！** 🚀

