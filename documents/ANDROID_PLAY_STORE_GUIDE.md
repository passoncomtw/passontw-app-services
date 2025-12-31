# Android Google Play Store 完整指南

本指南提供兩種方式將 `token-app-service` 應用程式上傳到 Google Play Store：
1. **手動上傳**：使用 EAS CLI 手動建置和提交
2. **自動化部署**：使用 GitHub Actions 自動化流程

參考文檔：[Expo - Submit to Google Play Store](https://docs.expo.dev/submit/android/)

## 📋 目錄

- [前置需求](#前置需求)
- [第一部分：手動上傳流程](#第一部分手動上傳流程)
  - [步驟 1: 建立 Expo 帳號並安裝 EAS CLI](#步驟-1-建立-expo-帳號並安裝-eas-cli)
  - [步驟 2: Google Play Console 設定](#步驟-2-google-play-console-設定)
  - [步驟 3: 配置憑證](#步驟-3-配置憑證)
  - [步驟 4: 建置和提交](#步驟-4-建置和提交)
- [第二部分：自動化部署流程](#第二部分自動化部署流程)
  - [步驟 1: 建立 Expo Access Token](#步驟-1-建立-expo-access-token)
  - [步驟 2: 取得 Google Play 資訊](#步驟-2-取得-google-play-資訊)
  - [步驟 3: 建立 Service Account](#步驟-3-建立-service-account)
  - [步驟 4: 設定 GitHub Secrets](#步驟-4-設定-github-secrets)
  - [步驟 5: 觸發自動化部署](#步驟-5-觸發自動化部署)
- [測試平台設定](#測試平台設定)
  - [內部測試 (Internal Testing)](#內部測試-internal-testing)
  - [封閉測試 (Closed Testing)](#封閉測試-closed-testing)
  - [開放測試 (Open Testing)](#開放測試-open-testing)
- [正式平台發布](#正式平台發布)
- [常見問題排除](#常見問題排除)
- [相關資源](#相關資源)

---

## 前置需求

在開始之前，請確認您已具備：

- ✅ **Google Play Developer 帳號**（一次性註冊費 $25 USD）
  - 註冊網址：[Google Play Console](https://play.google.com/console/)
- ✅ **Expo 帳號**（免費）
  - 註冊網址：[Expo](https://expo.dev/)
- ✅ **GitHub 帳號**（僅自動化部署需要）
- ✅ **Google Play Console 存取權限**
- ✅ **已註冊的應用程式**（Package Name: `com.passon.ecoinwallet`）

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

### 步驟 2: Google Play Console 設定

#### 2.1 建立 Google Play Developer 帳號

1. 前往 [Google Play Console](https://play.google.com/console/)
2. 點擊「開始使用」或「Create Account」
3. 支付一次性註冊費 $25 USD
4. 完成開發者資料填寫

#### 2.2 建立應用程式

1. **登入 Google Play Console**
   - 網址：https://play.google.com/console/
   - 使用您的 Google 帳號登入

2. **建立新應用程式**
   - 點擊「建立應用程式」或「Create app」
   - 填寫應用程式詳細資訊：
     - **應用程式名稱**：E幣錢包
     - **預設語言**：繁體中文（台灣）
     - **應用程式或遊戲**：應用程式
     - **免費或付費**：免費
   - 點擊「建立」

   > **注意**：建立應用程式時**不需要輸入 Package Name**。Package Name 會在您第一次上傳 APK/AAB 檔案時，自動從應用程式檔案中讀取。

3. **確認 Package Name**
   - 在建立應用程式後，Package Name 會在您第一次上傳應用程式時自動設定
   - 上傳後，可以在「設定」→「應用程式完整性」中查看 Package Name
   - 確認 Package Name 為 `com.passon.ecoinwallet`（必須與 `app.json` 中的 `android.package` 完全一致）

4. **設定應用程式資訊**
   - **應用程式類別**：選擇適當的類別（例如：金融）
   - **內容分級**：完成內容分級問卷

#### 2.3 設定應用程式商店資訊

在「主要商店資訊」區塊中填寫：

- **應用程式圖示**：上傳 512x512 PNG 圖示
- **功能圖形**：上傳 1024x500 PNG 橫幅
- **螢幕截圖**：至少 2 張，最多 8 張（手機版）
- **簡短說明**：80 字以內
- **完整說明**：4000 字以內
- **應用程式網址**：可選
- **隱私權政策網址**：**必填**（如果應用程式處理使用者資料）

#### 2.4 取得應用程式 ID（Package Name）

1. 在 Google Play Console 中選擇您的應用程式
2. 在左側選單中，點擊「設定」→「應用程式完整性」
3. 在「應用程式完整性」頁面中，您會看到：
   - **應用程式 ID**（即 Package Name，格式：`com.passon.ecoinwallet`）
   - 此資訊會在您第一次上傳應用程式後自動顯示

> **重要**：
> - Package Name 會在第一次上傳 APK/AAB 時自動從應用程式檔案中讀取
> - 確認此 Package Name 與 `app.json` 中的 `expo.android.package` 完全一致（區分大小寫）
> - 如果 Package Name 不匹配，上傳會失敗

### 步驟 3: 配置憑證

#### 方法一：使用 EAS 管理憑證（推薦）

EAS 可以自動管理 Android 簽名憑證（Keystore），這是最簡單的方式。

```bash
cd cmd/token-app-service
eas credentials --platform android
```

按照提示操作：
1. 選擇 `production` build profile
2. 選擇「Let EAS handle credentials management」
3. EAS 會自動生成並管理 Keystore

#### 方法二：手動上傳 Keystore

如果您已有 Keystore 檔案：

1. **準備 Keystore 檔案**
   - 確保您有 `.jks` 或 `.keystore` 檔案
   - 記下 Keystore 的別名（alias）和密碼

2. **上傳到 EAS**
   ```bash
   eas credentials --platform android
   ```
   - 選擇「Upload credentials」
   - 上傳 Keystore 檔案
   - 輸入別名和密碼

#### 方法三：使用 Google Play App Signing

Google Play App Signing 允許 Google 管理您的應用程式簽名金鑰，提供更好的安全性。

1. **在 Google Play Console 中啟用**
   - 前往「應用程式完整性」→「應用程式簽名」
   - 選擇「讓 Google 管理並保護您的應用程式簽名金鑰」
   - 按照指示完成設定

2. **上傳應用程式簽名金鑰**
   - 如果使用 EAS 管理憑證，EAS 會自動處理
   - 如果手動管理，需要上傳應用程式簽名金鑰（Upload key）

### 步驟 4: 建置和提交

#### 4.1 檢查配置

確認以下檔案已正確配置：

**`app.json`**：
```json
{
  "expo": {
    "android": {
      "package": "com.passon.ecoinwallet",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/images/adaptive-icon.png",
        "backgroundColor": "#7B68C8"
      }
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
      "android": {
        "buildType": "app-bundle"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./path/to/service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

> **注意**：`production` profile 使用 `"buildType": "app-bundle"`（Android App Bundle），這是 Google Play Store 推薦的格式。`preview` profile 使用 `"buildType": "apk"` 用於測試。

#### 4.2 建置 Production 版本

**方法 A：只建置 AAB（推薦用於 Google Play Store）**

```bash
cd cmd/token-app-service
eas build --platform android --profile production --non-interactive
```

此命令會產生 `.aab` 檔案（Android App Bundle），這是 Google Play Store 推薦的格式。

**方法 B：只建置 APK（用於直接安裝或測試）**

```bash
cd cmd/token-app-service
eas build --platform android --profile production-apk --non-interactive
```

此命令會產生 `.apk` 檔案，可用於直接安裝到裝置或分發給測試人員。

**方法 C：同時建置 AAB 和 APK（手動執行）**

如果您需要同時產生兩種格式，可以手動執行兩次建置：

```bash
cd cmd/token-app-service

# 建置 AAB
eas build --platform android --profile production --non-interactive

# 建置 APK
eas build --platform android --profile production-apk --non-interactive
```

> **注意**：CI/CD workflow 預設只建置 AAB 格式（用於 Google Play Store）。如果需要 APK，請手動執行上述命令。

**建置說明**：
- 建置過程可能需要 10-20 分鐘（每個格式）
- 自動包含 `pkg` 目錄中的共用模組
- 使用遠端儲存的憑證（Keystore）

**選項**：
- `--non-interactive`: 非互動式模式，使用已儲存的憑證（推薦用於 CI/CD）
- `--local`: 在本機建置（需要 Android SDK）
- `--profile production`: 使用 production build profile（產生 AAB）
- `--profile production-apk`: 使用 production-apk build profile（產生 APK）

**建置類型比較**：
- **AAB (Android App Bundle)**：`production` profile 產生 AAB 檔案
  - Google Play Store 推薦格式
  - 檔案大小更小
  - Google Play 會根據裝置自動優化
  - 必須使用 AAB 格式才能上傳到 Google Play Store
- **APK**：`production-apk` profile 產生 APK 檔案
  - 用於直接安裝到裝置
  - 適合分發給測試人員
  - 不需要透過 Google Play Store 安裝

#### 4.3 提交到 Google Play Store

**方法 A：建置後自動提交**

```bash
eas build --platform android --profile production --auto-submit
```

**方法 B：手動提交**

如果已經有建置好的版本：

```bash
eas submit --platform android --profile production
```

此命令會：
- 上傳 `.aab` 或 `.apk` 檔案到 Google Play Console
- 處理時間約 5-10 分鐘
- 完成後可在 Google Play Console 中看到建置版本

**提交選項**：
- `--track internal`: 提交到內部測試軌道
- `--track alpha`: 提交到 Alpha 測試軌道
- `--track beta`: 提交到 Beta 測試軌道
- `--track production`: 提交到正式發布軌道

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

### 步驟 2: 取得 Google Play 資訊

#### 2.1 Package Name

這是應用程式的唯一識別碼，已在 `app.json` 中配置。

**範例**：`com.passon.ecoinwallet`

#### 2.2 應用程式 ID

在 Google Play Console 中：
1. 選擇您的應用程式
2. 在「設定」→「應用程式完整性」中找到應用程式 ID
3. 確認與 Package Name 一致

### 步驟 3: 建立 Service Account

Service Account 用於自動化上傳到 Google Play Store，不需要手動登入。

#### 3.1 建立 Service Account

1. **前往 Google Cloud Console**
   - 網址：https://console.cloud.google.com/
   - 登入您的 Google 帳號

2. **建立或選擇專案**
   - 如果還沒有專案，點擊「建立專案」
   - 輸入專案名稱（例如：`token-app-service`）
   - 點擊「建立」

3. **啟用 Google Play Android Developer API**
   - 在左側選單中，點擊「API 和服務」→「程式庫」
   - 搜尋「Google Play Android Developer API」
   - 點擊「啟用」

4. **建立 Service Account**
   - 在左側選單中，點擊「IAM 與管理」→「服務帳戶」
   - 點擊「建立服務帳戶」
   - 填寫服務帳戶詳細資訊：
     - **服務帳戶名稱**：`eas-submit`（或任何名稱）
     - **服務帳戶 ID**：自動生成
     - **說明**：`EAS Submit for token-app-service`
   - 點擊「建立並繼續」

5. **授予角色**
   - 在「授予此服務帳戶存取專案的權限」中，選擇「編輯者」或「擁有者」
   - 點擊「繼續」→「完成」

6. **建立金鑰**
   - 在服務帳戶列表中，點擊剛建立的服務帳戶
   - 點擊「金鑰」標籤
   - 點擊「新增金鑰」→「建立新金鑰」
   - 選擇「JSON」格式
   - 點擊「建立」
   - **下載 JSON 檔案**（只會顯示一次，請妥善保存）

#### 3.2 連結 Service Account 到 Google Play Console

1. **前往 Google Play Console**
   - 網址：https://play.google.com/console/
   - 選擇您的應用程式

2. **授予存取權限**
   - 在左側選單中，點擊「設定」→「API 存取權」
   - 在「服務帳戶」區塊中，點擊「連結服務帳戶」
   - 輸入 Service Account 的電子郵件地址（格式：`eas-submit@[project-id].iam.gserviceaccount.com`）
   - 點擊「邀請」
   - 授予「管理版本發布」權限
   - 點擊「套用」

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

##### 4.2.2 GOOGLE_SERVICE_ACCOUNT_KEY_TOKEN_APP

- **Name**: `GOOGLE_SERVICE_ACCOUNT_KEY_TOKEN_APP`
- **Value**: 從步驟 3.1 下載的 Service Account JSON 檔案的完整內容
- **說明**: 將整個 JSON 檔案內容複製貼上（包含所有大括號和引號）

**重要**：
- JSON 內容必須是單行格式，或使用 `\n` 表示換行
- 或者將 JSON 檔案內容進行 Base64 編碼後貼上

##### 4.2.3 GOOGLE_PACKAGE_NAME_TOKEN_APP

- **Name**: `GOOGLE_PACKAGE_NAME_TOKEN_APP`
- **Value**: 應用程式的 Package Name
- **範例**: `com.passon.ecoinwallet`
- **說明**: 每個 app 都有唯一的 Package Name

#### 4.3 驗證 Secrets

確認所有 Secrets 都已正確設定：

```
✅ EXPO_TOKEN_TOKEN_APP                    (Token App 專用)
✅ GOOGLE_SERVICE_ACCOUNT_KEY_TOKEN_APP     (Token App 專用)
✅ GOOGLE_PACKAGE_NAME_TOKEN_APP            (Token App 專用)
```

### 步驟 5: 觸發自動化部署

#### 5.1 使用 Git Tag 觸發（推薦）

當您準備發布新版本時：

```bash
# 1. 更新 app.json 中的版本號
# "version": "1.0.0"
# "android.versionCode": 2

# 2. 提交變更
git add app.json
git commit -m "Bump version to 1.0.0 (versionCode 2)"
git push

# 3. 建立並推送版本標籤
git tag v1.0.0
git push origin v1.0.0
```

推送標籤後，GitHub Actions 會自動觸發構建和上傳流程。

#### 5.2 手動觸發

1. 前往 GitHub Repository → Actions
2. 選擇「Build and Deploy Android to Play Store」
3. 點擊「Run workflow」
4. 選擇測試軌道（internal/alpha/beta/production）
5. 點擊「Run workflow」

#### 5.3 檢查 Google Play Console

構建完成後（通常需要 15-30 分鐘）：

1. 前往 [Google Play Console](https://play.google.com/console/)
2. 選擇您的應用程式
3. 點擊「發布」→「測試」或「正式版」
4. 在對應的測試軌道中，您應該會看到新的建置版本
5. 等待 Google 處理完成（通常需要 10-30 分鐘）
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
5. 配置 Android 憑證
   ↓
6. EAS Build (雲端構建)
   ↓
7. 等待構建完成
   ↓
8. 上傳到 Google Play Store
   ↓
9. 完成！✅
```

**預估時間**：
- **構建時間**：15-30 分鐘（取決於專案大小）
- **Google 處理時間**：10-30 分鐘
- **總計**：約 30-60 分鐘

---

## 測試平台設定

Google Play Console 提供三種測試軌道，用於在不同階段測試您的應用程式。

### 內部測試 (Internal Testing)

**特點**：
- 最多 100 名測試人員
- 不需要審核
- 適合團隊內部測試
- 發布速度最快（幾分鐘內）

**設定步驟**：

1. **建立內部測試版本**
   ```bash
   eas submit --platform android --track internal
   ```

2. **在 Google Play Console 中設定**
   - 前往「發布」→「測試」→「內部測試」
   - 點擊「建立新的發布版本」
   - 選擇已上傳的建置版本
   - 填寫「發布說明」
   - 點擊「審查發布」

3. **新增測試人員**
   - 在「測試人員」標籤中，點擊「建立郵件列表」
   - 輸入測試人員的電子郵件地址（最多 100 個）
   - 或使用 Google Groups

4. **分享測試連結**
   - 在「測試人員」標籤中，複製「加入連結」
   - 分享給測試人員
   - 測試人員點擊連結後，會收到安裝應用程式的邀請

### 封閉測試 (Closed Testing)

**特點**：
- 無人數限制
- 需要審核（通常 1-3 天）
- 適合小範圍公開測試
- 可以建立多個測試群組

**設定步驟**：

1. **建立封閉測試版本**
   ```bash
   eas submit --platform android --track alpha
   # 或
   eas submit --platform android --track beta
   ```

2. **在 Google Play Console 中設定**
   - 前往「發布」→「測試」→「封閉測試」
   - 選擇「Alpha」或「Beta」軌道
   - 點擊「建立新的發布版本」
   - 選擇已上傳的建置版本
   - 填寫「發布說明」
   - 點擊「審查發布」

3. **建立測試群組**
   - 在「測試人員」標籤中，點擊「建立測試群組」
   - 輸入群組名稱（例如：`Beta Testers`）
   - 選擇加入方式：
     - **郵件列表**：手動新增測試人員
     - **加入連結**：分享連結讓測試人員自行加入

4. **提交審核**
   - 完成所有必要資訊後，點擊「提交以供審核」
   - 等待 Google 審核（通常 1-3 天）

### 開放測試 (Open Testing)

**特點**：
- 無人數限制
- 需要審核（通常 1-3 天）
- 任何人都可以加入測試
- 適合大範圍公開測試

**設定步驟**：

1. **建立開放測試版本**
   ```bash
   eas submit --platform android --track beta
   ```

2. **在 Google Play Console 中設定**
   - 前往「發布」→「測試」→「開放測試」
   - 點擊「建立新的發布版本」
   - 選擇已上傳的建置版本
   - 填寫「發布說明」
   - 點擊「審查發布」

3. **提交審核**
   - 完成所有必要資訊後，點擊「提交以供審核」
   - 等待 Google 審核（通常 1-3 天）

4. **分享測試連結**
   - 審核通過後，在「測試人員」標籤中複製「加入連結」
   - 分享給任何人，他們都可以加入測試

---

## 正式平台發布

### 發布前檢查清單

在發布到正式版之前，請確認：

- [ ] **應用程式已完成測試**
  - [ ] 內部測試通過
  - [ ] 封閉測試通過（可選）
  - [ ] 開放測試通過（可選）

- [ ] **商店資訊完整**
  - [ ] 應用程式圖示已上傳
  - [ ] 功能圖形已上傳
  - [ ] 螢幕截圖已上傳（至少 2 張）
  - [ ] 簡短說明已填寫
  - [ ] 完整說明已填寫
  - [ ] 隱私權政策網址已提供（如果應用程式處理使用者資料）

- [ ] **內容分級已完成**
  - [ ] 完成內容分級問卷
  - [ ] 內容分級已通過審核

- [ ] **定價和發布範圍**
  - [ ] 選擇「免費」或「付費」
  - [ ] 選擇發布國家/地區

### 發布步驟

1. **建置正式版本**
   ```bash
   eas build --platform android --profile production
   ```

2. **提交到正式版軌道**
   ```bash
   eas submit --platform android --track production
   ```

3. **在 Google Play Console 中發布**
   - 前往「發布」→「正式版」
   - 點擊「建立新的發布版本」
   - 選擇已上傳的建置版本
   - 填寫「發布說明」
   - 點擊「審查發布」

4. **提交審核**
   - 完成所有必要資訊後，點擊「提交以供審核」
   - 等待 Google 審核（通常 1-7 天，首次發布可能需要更長時間）

5. **發布應用程式**
   - 審核通過後，點擊「發布」
   - 應用程式會在幾小時內出現在 Google Play Store 中

### 版本更新

當您需要更新應用程式時：

1. **更新版本號**
   - 在 `app.json` 中更新 `version`（例如：`1.0.0` → `1.0.1`）
   - 在 `app.json` 中遞增 `android.versionCode`（例如：`1` → `2`）

2. **建置新版本**
   ```bash
   eas build --platform android --profile production
   ```

3. **提交更新**
   ```bash
   eas submit --platform android --track production
   ```

4. **在 Google Play Console 中發布**
   - 前往「發布」→「正式版」
   - 點擊「建立新的發布版本」
   - 選擇新的建置版本
   - 填寫「發布說明」（說明此次更新的內容）
   - 點擊「審查發布」→「提交以供審核」

---

## 常見問題排除

### ❌ 錯誤：`EXPO_TOKEN_TOKEN_APP is invalid`

**原因**：Expo Token 無效或已過期。

**解決方法**：
1. 前往 [Expo 設定頁面](https://expo.dev/accounts/[your-account]/settings/access-tokens)
2. 刪除舊的 Token
3. 建立新的 Token
4. 更新 GitHub Secret `EXPO_TOKEN_TOKEN_APP`（自動化）或重新登入（手動）

### ❌ 錯誤：`Google Service Account authentication failed`

**原因**：Service Account 金鑰無效或權限不足。

**解決方法**：
1. 確認 Service Account JSON 檔案內容正確
2. 確認 Service Account 已連結到 Google Play Console
3. 確認 Service Account 有「管理版本發布」權限
4. 確認 Google Play Android Developer API 已啟用

### ❌ 錯誤：`Package name not found in Google Play Console`

**原因**：應用程式尚未在 Google Play Console 建立，或 Package Name 不匹配。

**解決方法**：

#### 步驟 1: 確認應用程式已建立

1. 前往 [Google Play Console](https://play.google.com/console/)
2. 確認是否有 Package Name 為 `com.passon.ecoinwallet` 的應用程式

**如果沒有應用程式記錄**：
1. 點擊「建立應用程式」
2. 填寫應用程式詳細資訊
3. 在「應用程式完整性」中確認 Package Name 為 `com.passon.ecoinwallet`

#### 步驟 2: 確認 Package Name 完全一致

確認以下位置的 Package Name 完全一致（區分大小寫）：

- `app.json` 中的 `expo.android.package`: `com.passon.ecoinwallet`
- Google Play Console 中的 Package Name: `com.passon.ecoinwallet`

#### 步驟 3: 確認 Service Account 權限

1. 前往 Google Play Console
2. 點擊「設定」→「API 存取權」
3. 確認 Service Account 已連結並有「管理版本發布」權限

### ❌ 錯誤：`Build failed: Keystore not found`

**原因**：缺少簽名憑證（Keystore）。

**解決方法**：
1. 執行 `eas credentials --platform android` 配置憑證
2. 選擇「Let EAS handle credentials management」讓 EAS 自動管理
3. 或手動上傳 Keystore 檔案

### ❌ 錯誤：`Version code already exists`

**原因**：`versionCode` 已存在於 Google Play Console。

**解決方法**：
在 `app.json` 中遞增 `versionCode`：

```json
{
  "expo": {
    "android": {
      "versionCode": 2  // 遞增版本號
    }
  }
}
```

> **注意**：每次提交到 Google Play Store 時，`versionCode` 必須比之前的版本更高。

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

**原因**：構建的 App 不符合 Google Play Store 要求。

**解決方法**：
1. 檢查 `app.json` 配置是否正確
2. 確認版本號已更新
3. 檢查是否有必要的權限設定
4. 查看詳細的錯誤訊息

### ❌ 錯誤：應用程式審核被拒

**常見原因**：
- 違反 Google Play 政策
- 缺少必要的隱私權政策
- 內容分級不正確
- 應用程式崩潰或功能異常

**解決方法**：
1. 查看 Google Play Console 中的拒絕原因
2. 修正問題後重新提交
3. 如果對拒絕原因有疑問，可以提出申訴

---

## 相關資源

- [Expo EAS Build 文檔](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit 文檔](https://docs.expo.dev/submit/introduction/)
- [Google Play Console 說明](https://support.google.com/googleplay/android-developer)
- [Google Play 政策中心](https://play.google.com/about/developer-content-policy/)
- [Android App Bundle 說明](https://developer.android.com/guide/app-bundle)
- [Google Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)

---

## ✅ 檢查清單

在提交前，請確認：

### 基本設定
- [ ] Google Play Developer 帳號已建立並啟用
- [ ] Expo 帳號已建立並登入
- [ ] **Google Play Console 中已建立應用程式**（重要！）
  - [ ] 已登入 Google Play Console 確認應用程式存在
  - [ ] Package Name 為 `com.passon.ecoinwallet`
- [ ] **Package Name 在所有位置完全一致**（區分大小寫）
  - [ ] `app.json` 中的 `android.package`: `com.passon.ecoinwallet`
  - [ ] Google Play Console 中的 Package Name: `com.passon.ecoinwallet`
- [ ] **Service Account 已設定**
  - [ ] Service Account 已建立
  - [ ] Service Account 已連結到 Google Play Console
  - [ ] Service Account 有「管理版本發布」權限

### 手動上傳
- [ ] 已安裝並登入 EAS CLI
- [ ] 憑證已正確配置（使用 EAS 管理或手動上傳）
- [ ] 應用程式圖示和啟動畫面已設定
- [ ] 版本號和版本代碼已更新
- [ ] `eas.json` 中已設定 `cli.appVersionSource: "remote"`

### Monorepo 配置
- [ ] `metro.config.js` 已正確配置 `watchFolders` 和 `resolver.extraNodeModules`
- [ ] `pkg` 目錄中的模組不使用 `import.meta`（React Native 不支援）
- [ ] 共用模組（如 `@pkg/logger`）已針對 React Native 環境優化

### 商店資訊
- [ ] 應用程式圖示已上傳（512x512 PNG）
- [ ] 功能圖形已上傳（1024x500 PNG）
- [ ] 螢幕截圖已上傳（至少 2 張）
- [ ] 簡短說明已填寫（80 字以內）
- [ ] 完整說明已填寫（4000 字以內）
- [ ] 隱私權政策網址已提供（如果應用程式處理使用者資料）
- [ ] 內容分級已完成

### 自動化部署
- [ ] Expo Access Token 已建立並設定到 GitHub Secrets
- [ ] Google Service Account 已建立並設定到 GitHub Secrets
- [ ] Package Name 已設定到 GitHub Secrets
- [ ] 所有 GitHub Secrets 都已正確設定
- [ ] GitHub Actions Workflow 檔案已存在
- [ ] Workflow 中使用 `--non-interactive` 標誌

---

## 🎉 完成！

完成以上步驟後，您的應用程式應該已經成功上傳到 Google Play Store。使用者可以透過 Google Play Store 下載並使用您的應用程式。

---

## 安全建議

### ✅ 最佳實踐

1. **保護 Service Account 金鑰**：不要將 Service Account JSON 檔案提交到 Git Repository
2. **使用最小權限**：只給予 Service Account 必要的權限
3. **定期更新 Secrets**：每 90 天檢查一次 Service Account 金鑰
4. **監控 Actions**：定期檢查 Actions 執行記錄
5. **使用 Google Play App Signing**：讓 Google 管理應用程式簽名金鑰，提供更好的安全性

### ⚠️ 注意事項

- Service Account 金鑰一旦設定，就無法再查看內容
- 如果忘記 Service Account 金鑰，需要重新建立
- Service Account 金鑰可以隨時撤銷
- 每次提交到 Google Play Store 時，`versionCode` 必須遞增

---

**最後更新**：2025-01-27  
**適用版本**：Expo SDK 54, EAS CLI 5.9.0+

