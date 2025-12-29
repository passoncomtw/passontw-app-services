# iOS TestFlight 完整指南

本指南提供兩種方式將 `token-app-service` 應用程式上傳到 Apple App Store 的 TestFlight：
1. **手動上傳**：使用 EAS CLI 手動建置和提交
2. **自動化部署**：使用 GitHub Actions 自動化流程

參考文檔：[Expo - Submit to the Apple App Store](https://docs.expo.dev/submit/ios/)

## 📋 目錄

- [前置需求](#前置需求)
- [第一部分：手動上傳流程](#第一部分手動上傳流程)
  - [步驟 1: 建立 Expo 帳號並安裝 EAS CLI](#步驟-1-建立-expo-帳號並安裝-eas-cli)
  - [步驟 2: App Store Connect 設定](#步驟-2-app-store-connect-設定)
  - [步驟 3: 配置憑證](#步驟-3-配置憑證)
  - [步驟 4: 建置和提交](#步驟-4-建置和提交)
- [第二部分：自動化部署流程](#第二部分自動化部署流程)
  - [步驟 1: 建立 Expo Access Token](#步驟-1-建立-expo-access-token)
  - [步驟 2: 取得 Apple Developer 資訊](#步驟-2-取得-apple-developer-資訊)
  - [步驟 3: 建立 App-Specific Password](#步驟-3-建立-app-specific-password)
  - [步驟 4: 設定 GitHub Secrets](#步驟-4-設定-github-secrets)
  - [步驟 5: 觸發自動化部署](#步驟-5-觸發自動化部署)
- [測試人員設定](#測試人員設定)
- [常見問題排除](#常見問題排除)
- [相關資源](#相關資源)

---

## 前置需求

在開始之前，請確認您已具備：

- ✅ **Apple Developer 帳號**（年費 $99 USD）
  - 註冊網址：[Apple Developer Portal](https://developer.apple.com/)
- ✅ **Expo 帳號**（免費）
  - 註冊網址：[Expo](https://expo.dev/)
- ✅ **GitHub 帳號**（僅自動化部署需要）
- ✅ **App Store Connect 存取權限**
- ✅ **已註冊的 App ID**（Bundle ID: `com.passon.ecoinwallet`）

---

## Monorepo 配置說明

本專案使用 **Monorepo** 結構：
- 應用程式位於：`cmd/token-app-service`
- 共用套件位於：`pkg/`（包含 `logger`、`utils` 等）

### Metro 配置

`cmd/token-app-service/metro.config.js` 已配置為支援 monorepo：

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 監聽 workspace root 的變化
config.watchFolders = [workspaceRoot];

// 配置 node_modules 解析路徑
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 配置模組別名
config.resolver.extraNodeModules = {
  '@pkg': path.resolve(workspaceRoot, 'pkg'),
};

config.resolver.alias = {
  '@pkg/utils': path.resolve(workspaceRoot, 'pkg/utils'),
  '@pkg/logger': path.resolve(workspaceRoot, 'pkg/logger'),
};

module.exports = config;
```

### EAS Build 自動處理

EAS Build 會自動：
- 讀取 `metro.config.js` 配置
- 包含 `pkg` 目錄中的共用模組
- 正確解析 `@pkg` 別名

### 重要注意事項

1. **不使用 `import.meta`**：
   - React Native/Expo 使用 Hermes 引擎，不支援 `import.meta`
   - `pkg/logger` 已移除所有 `import.meta` 的使用
   - 使用 `process.env` 和 `__DEV__` 來判斷環境

2. **環境變數**：
   - 在 React Native 環境中，使用 `process.env.EXPO_PUBLIC_*` 前綴的環境變數
   - 這些變數會在建置時被內嵌到應用程式中

3. **共用模組更新**：
   - 更新 `pkg` 目錄中的模組後，需要重新建置應用程式
   - EAS Build 會自動包含最新的共用模組

---

## 第一部分：手動上傳流程

### 步驟 1: 建立 Expo 帳號並安裝 EAS CLI

#### 1.1 建立 Expo 帳號

1. 前往 [Expo 官網](https://expo.dev/)
2. 點擊「Sign Up」註冊帳號（可使用 GitHub 帳號登入）

#### 1.2 安裝 EAS CLI

```bash
npm install -g eas-cli
```

#### 1.3 登入 Expo

```bash
eas login
```

輸入您的 Expo 帳號和密碼。

### 步驟 2: App Store Connect 設定

#### 2.1 建立 App 記錄

1. 登入 [App Store Connect](https://appstoreconnect.apple.com/)
2. 選擇您的團隊
3. 點擊「Apps」標籤
4. 點擊藍色「+」按鈕，選擇「New App」
5. 填寫以下資訊：
   - **App Name**: E幣錢包
   - **Primary Language**: 繁體中文
   - **Bundle ID**: `com.passon.ecoinwallet`（必須與 `app.json` 中的 `bundleIdentifier` 一致）
   - **SKU**: 可以是任何唯一字串（例如：`com.passon.ecoinwallet`）
6. 點擊「Create」建立應用程式記錄

#### 2.2 取得 App Store Connect App ID (ascAppId)

1. 在 App Store Connect 中選擇您的應用程式
2. 確保「App Store」標籤處於活動狀態
3. 在左側面板的「General」區段下，選擇「App Information」
4. 在「General Information」區段中找到「Apple ID」
5. 複製這個 Apple ID（例如：`6477443899`）

> **注意**：此 ID 已配置在 `eas.json` 的 `submit.production.ios.ascAppId` 中

### 步驟 3: 配置憑證

#### 方法一：使用 EAS 管理憑證（推薦）

```bash
cd cmd/token-app-service
eas credentials --platform ios
```

按照提示操作：
1. 選擇 `production` build profile
2. 使用 Apple Developer 帳號登入
3. 選擇「App Store Connect: Manage your API Key」
4. 選擇「Set up your project to use an API Key for EAS Submit」

#### 方法二：使用 App-Specific Password

如果您想使用 App-Specific Password：

1. 在 Apple ID 帳號設定中建立 App-Specific Password（參考[步驟 3: 建立 App-Specific Password](#步驟-3-建立-app-specific-password)）
2. 在 `eas.json` 中已配置 `appleId` 欄位
3. 設定環境變數：

```bash
export EXPO_APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"
```

### 步驟 4: 建置和提交

#### 4.1 檢查配置

確認以下檔案已正確配置：

**`app.json`**：
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.passon.ecoinwallet",
      "buildNumber": "1"
    }
  }
}
```

**`eas.json`**：
```json
{
  "cli": {
    "version": ">= 5.9.0",
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "distribution": "store",
      "ios": {
        "simulator": false,
        "credentialsSource": "remote"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "horsekit1982@gmail.com",
        "ascAppId": "6477443899",
        "appleTeamId": "W6K7F9HNX5"
      }
    }
  }
}
```

#### 4.1.1 Monorepo 配置說明

本專案使用 **Monorepo** 結構，應用程式位於 `cmd/token-app-service`，共用套件位於 `pkg` 目錄。

**Metro 配置** (`metro.config.js`)：
- 已配置 `watchFolders` 以監聽 workspace root
- 已配置 `resolver.extraNodeModules` 和 `resolver.alias` 以解析 `@pkg` 別名
- EAS Build 會自動包含這些配置

**重要注意事項**：
- `pkg/logger` 模組已針對 React Native/Expo 環境優化
- 不使用 `import.meta`（Hermes 不支援）
- 使用 `process.env` 和 `__DEV__` 來判斷環境

#### 4.2 建置 Production 版本

```bash
cd cmd/token-app-service
eas build --platform ios --profile production --non-interactive
```

此命令會：
- 在 Expo 的雲端建置服務上建置您的應用程式
- 自動包含 `pkg` 目錄中的共用模組
- 使用遠端儲存的憑證（不需要每次登入 Apple 帳號）
- 產生一個 `.ipa` 檔案
- 建置過程可能需要 10-20 分鐘

**選項**：
- `--non-interactive`: 非互動式模式，使用已儲存的憑證（推薦用於 CI/CD）
- `--local`: 在本機建置（需要 macOS 和 Xcode）
- `--auto-submit`: 建置完成後自動提交到 TestFlight

#### 4.3 提交到 TestFlight

**方法 A：建置後自動提交**

```bash
eas build --platform ios --profile production --auto-submit
```

**方法 B：手動提交**

如果已經有建置好的版本：

```bash
eas submit --platform ios --profile production
```

此命令會：
- 上傳 `.ipa` 檔案到 App Store Connect
- 處理時間約 10-15 分鐘
- 完成後可在 App Store Connect 中看到建置版本

#### 4.4 在 App Store Connect 中處理建置

1. 登入 [App Store Connect](https://appstoreconnect.apple.com/)
2. 選擇您的應用程式
3. 進入「TestFlight」標籤
4. 等待建置處理完成（通常需要 10-15 分鐘）
5. 處理完成後，建置會出現在「iOS Builds」區段

---

## 第二部分：自動化部署流程

### 步驟 1: 建立 Expo Access Token

#### 1.1 建立 Access Token

1. 前往 [Expo 設定頁面](https://expo.dev/accounts/[your-account]/settings/access-tokens)
2. 點擊「Create Token」
3. 輸入 Token 名稱（例如：`github-actions-token`）
4. 選擇權限範圍：**Full Access**
5. 點擊「Create」
6. **複製 Token**（只會顯示一次，請妥善保存）

> ⚠️ **重要**：Token 只會顯示一次，請立即複製並保存到安全的地方。

### 步驟 2: 取得 Apple Developer 資訊

#### 2.1 Apple ID

這是您用來登入 Apple Developer 和 App Store Connect 的電子郵件地址。

**範例**：`your-email@example.com`

#### 2.2 Team ID

1. 前往 [Apple Developer](https://developer.apple.com/account/)
2. 登入您的 Apple Developer 帳號
3. 在右上角點擊您的帳號名稱
4. 在「Membership」區塊中找到 **Team ID**

**範例**：`W6K7F9HNX5`

#### 2.3 App ID (ASC App ID)

1. 前往 [App Store Connect](https://appstoreconnect.apple.com/)
2. 登入您的帳號
3. 點擊「我的 App」
4. 選擇您的 App
5. 在「App 資訊」頁面，找到 **Apple ID**（這是 App Store Connect App ID）

**範例**：`6477443899`

> 📝 **注意**：如果還沒有建立 App，請先到 App Store Connect 建立一個新的 App（參考[步驟 2: App Store Connect 設定](#步驟-2-app-store-connect-設定)）。

### 步驟 3: 建立 App-Specific Password

App-Specific Password 用於自動化上傳到 TestFlight，不需要兩步驟驗證。

#### 3.1 建立步驟

1. 前往 [Apple ID 帳號頁面](https://appleid.apple.com/)
2. 登入您的 Apple ID
3. 在「安全性」區塊中，找到「App 專用密碼」
4. 點擊「產生 App 專用密碼」
5. 輸入標籤名稱（例如：`GitHub Actions TestFlight`）
6. 點擊「建立」
7. **複製密碼**（格式：`xxxx-xxxx-xxxx-xxxx`）

> ⚠️ **重要**：密碼只會顯示一次，請立即複製並保存。

#### 3.2 啟用兩步驟驗證

如果您的 Apple ID 還沒有啟用兩步驟驗證，需要先啟用：

1. 在「安全性」區塊中，點擊「啟用兩步驟驗證」
2. 按照指示完成設定

### 步驟 4: 設定 GitHub Secrets

#### 4.1 進入 Secrets 設定頁面

1. 前往您的 GitHub Repository
2. 點擊「Settings」
3. 在左側選單中，點擊「Secrets and variables」→「Actions」
4. 點擊「New repository secret」

#### 4.2 新增以下 Secrets

按照以下順序新增所有必要的 Secrets：

##### 4.2.1 EXPO_TOKEN_TOKEN_APP

- **Name**: `EXPO_TOKEN_TOKEN_APP`
- **Value**: 從步驟 1.1 取得的 Expo Access Token
- **範例**: `exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **說明**: 加上 `_TOKEN_APP` 後綴以便與其他 app 區分

##### 4.2.2 APPLE_ID_TOKEN_APP

- **Name**: `APPLE_ID_TOKEN_APP`
- **Value**: 您的 Apple ID 電子郵件地址
- **範例**: `your-email@example.com`
- **說明**: 如果多個 app 使用不同的 Apple ID，需要分別設定

##### 4.2.3 APPLE_APP_SPECIFIC_PASSWORD

- **Name**: `APPLE_APP_SPECIFIC_PASSWORD`
- **Value**: 從步驟 3.1 建立的 App-Specific Password
- **範例**: `xxxx-xxxx-xxxx-xxxx`
- **說明**: **共用 Secret** - 所有 app 共用同一個 App-Specific Password

##### 4.2.4 APPLE_TEAM_ID

- **Name**: `APPLE_TEAM_ID`
- **Value**: 從步驟 2.2 取得的 Team ID
- **範例**: `W6K7F9HNX5`
- **說明**: **共用 Secret** - 所有 app 共用同一個 Team ID

##### 4.2.5 APPLE_APP_ID_TOKEN_APP

- **Name**: `APPLE_APP_ID_TOKEN_APP`
- **Value**: 從步驟 2.3 取得的 App Store Connect App ID
- **範例**: `6477443899`
- **說明**: 每個 app 都有唯一的 App ID

#### 4.3 驗證 Secrets

確認所有 Secrets 都已正確設定：

```
✅ EXPO_TOKEN_TOKEN_APP          (Token App 專用)
✅ APPLE_ID_TOKEN_APP             (Token App 專用)
✅ APPLE_APP_SPECIFIC_PASSWORD    (共用 - 所有 app)
✅ APPLE_TEAM_ID                  (共用 - 所有 app)
✅ APPLE_APP_ID_TOKEN_APP         (Token App 專用)
```

#### 4.4 多 App 管理說明

**App 專用 Secrets**（每個 app 需要獨立設定）：
- `EXPO_TOKEN_TOKEN_APP` - Expo Access Token（建議每個 app 使用獨立的 token）
- `APPLE_ID_TOKEN_APP` - Apple ID（如果不同 app 使用不同的 Apple ID）
- `APPLE_APP_ID_TOKEN_APP` - App Store Connect App ID（每個 app 都有唯一的 App ID）

**共用 Secrets**（所有 app 共用）：
- `APPLE_APP_SPECIFIC_PASSWORD` - App-Specific Password（所有 app 共用）
- `APPLE_TEAM_ID` - Apple Developer Team ID（所有 app 共用）

**命名規則範例**：
- Token App: `EXPO_TOKEN_TOKEN_APP`, `APPLE_ID_TOKEN_APP`, `APPLE_APP_ID_TOKEN_APP`
- POS Merchant App: `EXPO_TOKEN_POS_MERCHANT_APP`, `APPLE_ID_POS_MERCHANT_APP`, `APPLE_APP_ID_POS_MERCHANT_APP`
- 共用: `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`

### 步驟 5: 觸發自動化部署

#### 5.1 使用 Git Tag 觸發（推薦）

當您準備發布新版本時：

```bash
# 1. 更新 app.json 中的版本號
# "version": "1.0.0"

# 2. 提交變更
git add app.json
git commit -m "Bump version to 1.0.0"
git push

# 3. 建立並推送版本標籤
git tag v1.0.0
git push origin v1.0.0
```

推送標籤後，GitHub Actions 會自動觸發構建和上傳流程。

#### 5.2 手動觸發

1. 前往 GitHub Repository → Actions
2. 選擇「Build and Deploy iOS to TestFlight」
3. 點擊「Run workflow」
4. 輸入版本號
5. 點擊「Run workflow」

#### 5.3 檢查 TestFlight

構建完成後（通常需要 15-30 分鐘）：

1. 前往 [App Store Connect](https://appstoreconnect.apple.com/)
2. 選擇您的 App
3. 點擊「TestFlight」標籤
4. 在「iOS Builds」區塊中，您應該會看到新的構建版本
5. 等待 Apple 處理完成（通常需要 10-30 分鐘）
6. 處理完成後，可以選擇測試群組進行分發

#### 5.4 工作流程說明

**完整流程圖**：
```
1. 推送 Git Tag (v1.0.0)
   ↓
2. GitHub Actions 觸發
   ↓
3. 安裝依賴
   ↓
4. 設定 Expo 和 EAS CLI
   ↓
5. 配置 Apple 憑證
   ↓
6. EAS Build (雲端構建)
   ↓
7. 等待構建完成
   ↓
8. 上傳到 TestFlight
   ↓
9. 完成！✅
```

**預估時間**：
- **構建時間**：15-30 分鐘（取決於專案大小）
- **Apple 處理時間**：10-30 分鐘
- **總計**：約 30-60 分鐘

---

## 測試人員設定

### Internal Testing（內部測試）

- 最多 100 名測試人員
- 不需要 App Review
- 適合團隊內部測試

**設定步驟**：
1. 在 TestFlight 頁面中，點擊「Internal Testing」
2. 建立測試群組（如果還沒有）
3. 選擇要測試的建置版本
4. 新增測試人員

### External Testing（外部測試）

- 無人數限制
- 需要通過 App Review
- 適合公開測試

**設定步驟**：
1. 在 TestFlight 頁面中，點擊「External Testing」
2. 建立測試群組（如果還沒有）
3. 選擇要測試的建置版本
4. 提交審核（如果需要）
5. 新增測試人員

---

## 常見問題排除

### ❌ 錯誤：`EXPO_TOKEN_TOKEN_APP is invalid`

**原因**：Expo Token 無效或已過期。

**解決方法**：
1. 前往 [Expo 設定頁面](https://expo.dev/accounts/[your-account]/settings/access-tokens)
2. 刪除舊的 Token
3. 建立新的 Token
4. 更新 GitHub Secret `EXPO_TOKEN_TOKEN_APP`（自動化）或重新登入（手動）

### ❌ 錯誤：`Apple ID authentication failed`

**原因**：Apple ID 或 App-Specific Password 錯誤。

**解決方法**：
1. 確認 Apple ID 是正確的電子郵件地址
2. 確認 App-Specific Password 格式正確（`xxxx-xxxx-xxxx-xxxx`）
3. 如果密碼已過期，建立新的 App-Specific Password
4. 確認 Apple ID 已啟用兩步驟驗證

### ❌ 錯誤：`Team ID not found`

**原因**：Team ID 設定錯誤或沒有權限。

**解決方法**：
1. 確認 Team ID 格式正確（10 個字元的英數字）
2. 確認您的 Apple ID 是該 Team 的成員
3. 前往 [Apple Developer](https://developer.apple.com/account/) 確認 Team ID

### ❌ 錯誤：`App not found in App Store Connect`

**原因**：App 尚未在 App Store Connect 建立，或 App ID 錯誤。

**解決方法**：
1. 前往 [App Store Connect](https://appstoreconnect.apple.com/)
2. 確認 App 已建立
3. 確認 App Store Connect App ID 是正確的
4. 確認 Bundle ID 與 `app.json` 中的設定一致

### ❌ 錯誤：`Build failed: Provisioning profile not found`

**原因**：缺少 Provisioning Profile 或憑證。

**解決方法**：
1. 確認您的 Apple Developer 帳號有建立 App ID
2. 確認已建立 Distribution Certificate 和 Provisioning Profile
3. EAS 會自動管理憑證，但需要正確的 Team ID 和 Bundle ID
4. 執行 `eas credentials --platform ios` 重新配置憑證

### ❌ 錯誤：`import.meta is not supported in Hermes`

**原因**：在 React Native/Expo 環境中使用了 `import.meta`，但 Hermes 引擎不支援。

**解決方法**：
1. 確認 `pkg/logger` 模組已更新，移除了 `import.meta` 的使用
2. 在 React Native/Expo 環境中，使用 `process.env` 和 `__DEV__` 來判斷環境
3. 如果仍有問題，檢查是否有其他模組使用了 `import.meta`

### ❌ 錯誤：`Couldn't find module @pkg/logger`

**原因**：Monorepo 結構中，EAS Build 無法找到共用模組。

**解決方法**：
1. 確認 `metro.config.js` 已正確配置 `watchFolders` 和 `resolver.extraNodeModules`
2. 確認 `pkg` 目錄在專案根目錄下
3. 確認 `package.json` 中沒有將 `@pkg` 列為依賴（應該透過 Metro 配置解析）

### ❌ 錯誤：`Build timeout`

**原因**：構建時間超過 1 小時。

**解決方法**：
1. 檢查是否有大量依賴需要下載
2. 檢查 EAS 服務狀態
3. 重新觸發構建

### ❌ 錯誤：`Submit failed: Invalid binary`

**原因**：構建的 App 不符合 App Store 要求。

**解決方法**：
1. 檢查 `app.json` 配置是否正確
2. 確認版本號已更新
3. 檢查是否有必要的權限設定
4. 查看詳細的錯誤訊息

### ❌ 錯誤：建置版本號衝突

**問題**：建置版本號已存在

**解決方案**：
在 `app.json` 中更新 `buildNumber`：

```json
{
  "expo": {
    "ios": {
      "buildNumber": "2"  // 遞增版本號
    }
  }
}
```

### ❌ 錯誤：Bundle ID 不匹配

**問題**：App Store Connect 中的 Bundle ID 與 `app.json` 不一致

**解決方案**：
- 確認 `app.json` 中的 `bundleIdentifier` 與 App Store Connect 中的一致
- 或是在 App Store Connect 中建立新的 App 記錄

---

## 相關資源

- [Expo EAS Build 文檔](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit 文檔](https://docs.expo.dev/submit/introduction/)
- [App Store Connect 說明](https://help.apple.com/app-store-connect/)
- [TestFlight 測試指南](https://developer.apple.com/testflight/)
- [Apple Developer 文檔](https://developer.apple.com/documentation/)
- [App Store Connect API](https://developer.apple.com/app-store-connect/api/)

---

## ✅ 檢查清單

在提交前，請確認：

### 基本設定
- [ ] Apple Developer 帳號已啟用
- [ ] Expo 帳號已建立並登入
- [ ] App Store Connect 中已建立 App 記錄
- [ ] `app.json` 中的 `bundleIdentifier` 正確
- [ ] `eas.json` 中的 `ascAppId` 正確

### 手動上傳
- [ ] 已安裝並登入 EAS CLI
- [ ] 憑證已正確配置（使用 `credentialsSource: "remote"`）
- [ ] 應用程式圖示和啟動畫面已設定
- [ ] 版本號和建置號碼已更新
- [ ] `eas.json` 中已設定 `cli.appVersionSource: "remote"`

### Monorepo 配置
- [ ] `metro.config.js` 已正確配置 `watchFolders` 和 `resolver.extraNodeModules`
- [ ] `pkg` 目錄中的模組不使用 `import.meta`（React Native 不支援）
- [ ] 共用模組（如 `@pkg/logger`）已針對 React Native 環境優化

### 自動化部署
- [ ] Expo Access Token 已建立並設定到 GitHub Secrets
- [ ] Apple Developer 資訊已取得
- [ ] App-Specific Password 已建立並設定到 GitHub Secrets
- [ ] 所有 GitHub Secrets 都已正確設定
- [ ] GitHub Actions Workflow 檔案已存在
- [ ] Workflow 中使用 `--non-interactive` 標誌

---

## 🎉 完成！

完成以上步驟後，您的應用程式應該已經成功上傳到 TestFlight。測試人員可以透過 TestFlight App 下載並測試您的應用程式。

---

## 安全建議

### ✅ 最佳實踐

1. **定期更新 Secrets**：每 90 天更新一次 App-Specific Password
2. **使用最小權限**：只給予必要的權限
3. **監控 Actions**：定期檢查 Actions 執行記錄
4. **保護 Token**：不要將 Token 提交到 Git Repository

### ⚠️ 注意事項

- Secrets 一旦設定，就無法再查看內容
- 如果忘記 Token，需要重新建立
- App-Specific Password 可以隨時撤銷

---

**最後更新**：2025-01-27  
**適用版本**：Expo SDK 54, EAS CLI 5.9.0+

