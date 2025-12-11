# iOS TestFlight 自動化部署指南

本指南將幫助您設定 GitHub Actions 自動化流程，實現 iOS App 的自動打包並上傳到 TestFlight 送審。

## 📋 目錄

- [前置需求](#前置需求)
- [步驟 1: 建立 Expo 帳號並取得 Token](#步驟-1-建立-expo-帳號並取得-token)
- [步驟 2: 取得 Apple Developer 資訊](#步驟-2-取得-apple-developer-資訊)
- [步驟 3: 建立 App-Specific Password](#步驟-3-建立-app-specific-password)
- [步驟 4: 取得 App Store Connect API Key](#步驟-4-取得-app-store-connect-api-key-選用)
- [步驟 5: 設定 GitHub Secrets](#步驟-5-設定-github-secrets)
- [步驟 6: 測試 Workflow](#步驟-6-測試-workflow)
- [步驟 7: 觸發部署](#步驟-7-觸發部署)
- [常見問題排除](#常見問題排除)

---

## 前置需求

在開始之前，請確認您已具備：

- ✅ **Apple Developer 帳號**（年費 $99 USD）
- ✅ **Expo 帳號**（免費）
- ✅ **GitHub 帳號**
- ✅ **App Store Connect 存取權限**
- ✅ **已註冊的 App ID**（Bundle ID: `com.passon.ecoinwallet`）

---

## 步驟 1: 建立 Expo 帳號並取得 Token

### 1.1 建立 Expo 帳號

1. 前往 [Expo 官網](https://expo.dev/)
2. 點擊「Sign Up」註冊帳號（可使用 GitHub 帳號登入）

### 1.2 安裝 EAS CLI

```bash
npm install -g eas-cli
```

### 1.3 登入 Expo

```bash
eas login
```

輸入您的 Expo 帳號和密碼。

### 1.4 建立 Access Token

1. 前往 [Expo 設定頁面](https://expo.dev/accounts/[your-account]/settings/access-tokens)
2. 點擊「Create Token」
3. 輸入 Token 名稱（例如：`github-actions-token`）
4. 選擇權限範圍：**Full Access**
5. 點擊「Create」
6. **複製 Token**（只會顯示一次，請妥善保存）

> ⚠️ **重要**：Token 只會顯示一次，請立即複製並保存到安全的地方。

---

## 步驟 2: 取得 Apple Developer 資訊

### 2.1 Apple ID

這是您用來登入 Apple Developer 和 App Store Connect 的電子郵件地址。

**範例**：`your-email@example.com`

### 2.2 Team ID

1. 前往 [Apple Developer](https://developer.apple.com/account/)
2. 登入您的 Apple Developer 帳號
3. 在右上角點擊您的帳號名稱
4. 在「Membership」區塊中找到 **Team ID**

**範例**：`ABC123DEF4`

### 2.3 App ID (ASC App ID)

1. 前往 [App Store Connect](https://appstoreconnect.apple.com/)
2. 登入您的帳號
3. 點擊「我的 App」
4. 選擇您的 App（如果還沒有，需要先建立）
5. 在「App 資訊」頁面，找到 **Apple ID**（這是 App Store Connect App ID）

**範例**：`1234567890`

> 📝 **注意**：如果還沒有建立 App，請先到 App Store Connect 建立一個新的 App。

---

## 步驟 3: 建立 App-Specific Password

App-Specific Password 用於自動化上傳到 TestFlight，不需要兩步驟驗證。

### 3.1 建立步驟

1. 前往 [Apple ID 帳號頁面](https://appleid.apple.com/)
2. 登入您的 Apple ID
3. 在「安全性」區塊中，找到「App 專用密碼」
4. 點擊「產生 App 專用密碼」
5. 輸入標籤名稱（例如：`GitHub Actions TestFlight`）
6. 點擊「建立」
7. **複製密碼**（格式：`xxxx-xxxx-xxxx-xxxx`）

> ⚠️ **重要**：密碼只會顯示一次，請立即複製並保存。

### 3.2 啟用兩步驟驗證

如果您的 Apple ID 還沒有啟用兩步驟驗證，需要先啟用：

1. 在「安全性」區塊中，點擊「啟用兩步驟驗證」
2. 按照指示完成設定

---

## 步驟 4: 取得 App Store Connect API Key（選用）

如果您想使用 API Key 而不是 App-Specific Password，可以建立 App Store Connect API Key：

### 4.1 建立 API Key

1. 前往 [App Store Connect](https://appstoreconnect.apple.com/)
2. 點擊「使用者與存取權限」
3. 選擇「金鑰」標籤
4. 點擊「產生 API 金鑰」
5. 輸入金鑰名稱（例如：`GitHub Actions`）
6. 選擇「App Manager」或「Admin」角色
7. 點擊「產生」
8. **下載 `.p8` 檔案**（只會顯示一次）
9. **複製 Key ID** 和 **Issuer ID**

### 4.2 使用 API Key（進階）

如果您使用 API Key，需要在 GitHub Secrets 中設定：

- `APPLE_API_KEY_ID`: Key ID
- `APPLE_API_ISSUER_ID`: Issuer ID
- `APPLE_API_KEY`: `.p8` 檔案的內容

> 📝 **注意**：本指南使用 App-Specific Password，更簡單且適合大多數情況。

---

## 步驟 5: 設定 GitHub Secrets

### 5.1 進入 Secrets 設定頁面

1. 前往您的 GitHub Repository
2. 點擊「Settings」
3. 在左側選單中，點擊「Secrets and variables」→「Actions」
4. 點擊「New repository secret」

### 5.2 新增以下 Secrets

按照以下順序新增所有必要的 Secrets：

#### 5.2.1 EXPO_TOKEN_TOKEN_APP

- **Name**: `x`x``
- **Value**: 從步驟 1.4 取得的 Expo Access Token
- **範例**: `exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **說明**: 加上 `_TOKEN_APP` 後綴以便與其他 app 區分

#### 5.2.2 APPLE_ID_TOKEN_APP

- **Name**: `APPLE_ID_TOKEN_APP`
- **Value**: 您的 Apple ID 電子郵件地址
- **範例**: `your-email@example.com`
- **說明**: 如果多個 app 使用不同的 Apple ID，需要分別設定

#### 5.2.3 APPLE_APP_SPECIFIC_PASSWORD

- **Name**: `APPLE_APP_SPECIFIC_PASSWORD`
- **Value**: 從步驟 3.1 建立的 App-Specific Password
- **範例**: `xxxx-xxxx-xxxx-xxxx`
- **說明**: **共用 Secret** - 所有 app 共用同一個 App-Specific Password

#### 5.2.4 APPLE_TEAM_ID

- **Name**: `APPLE_TEAM_ID`
- **Value**: 從步驟 2.2 取得的 Team ID
- **範例**: `ABC123DEF4`
- **說明**: **共用 Secret** - 所有 app 共用同一個 Team ID

#### 5.2.5 APPLE_APP_ID_TOKEN_APP

- **Name**: `APPLE_APP_ID_TOKEN_APP`
- **Value**: 從步驟 2.3 取得的 App Store Connect App ID
- **範例**: `1234567890`
- **說明**: 每個 app 都有唯一的 App ID

### 5.3 驗證 Secrets

確認所有 Secrets 都已正確設定：

```
✅ EXPO_TOKEN_TOKEN_APP          (Token App 專用)
✅ APPLE_ID_TOKEN_APP             (Token App 專用)
✅ APPLE_APP_SPECIFIC_PASSWORD    (共用 - 所有 app)
✅ APPLE_TEAM_ID                  (共用 - 所有 app)
✅ APPLE_APP_ID_TOKEN_APP         (Token App 專用)
```

### 5.4 多 App 管理說明

#### Secrets 分類

**App 專用 Secrets**（每個 app 需要獨立設定）：
- `EXPO_TOKEN_TOKEN_APP` - Expo Access Token（建議每個 app 使用獨立的 token）
- `APPLE_ID_TOKEN_APP` - Apple ID（如果不同 app 使用不同的 Apple ID）
- `APPLE_APP_ID_TOKEN_APP` - App Store Connect App ID（每個 app 都有唯一的 App ID）

**共用 Secrets**（所有 app 共用）：
- `APPLE_APP_SPECIFIC_PASSWORD` - App-Specific Password（所有 app 共用）
- `APPLE_TEAM_ID` - Apple Developer Team ID（所有 app 共用）

#### 命名規則

對於新的 app，請使用以下命名規則：

**App 專用**：
```
{服務名稱}_{APP名稱}
```

**共用**：
```
{服務名稱}  (不加 APP 名稱)
```

**範例**：
- Token App: 
  - `EXPO_TOKEN_TOKEN_APP` ✅
  - `APPLE_ID_TOKEN_APP` ✅
  - `APPLE_APP_ID_TOKEN_APP` ✅
- POS Merchant App:
  - `EXPO_TOKEN_POS_MERCHANT_APP` ✅
  - `APPLE_ID_POS_MERCHANT_APP` ✅
  - `APPLE_APP_ID_POS_MERCHANT_APP` ✅
- 共用：
  - `APPLE_APP_SPECIFIC_PASSWORD` ✅（所有 app 共用）
  - `APPLE_TEAM_ID` ✅（所有 app 共用）

#### 為什麼有些 Secrets 共用？

1. **APPLE_TEAM_ID**：通常所有 app 都屬於同一個 Apple Developer Team
2. **APPLE_APP_SPECIFIC_PASSWORD**：一個 App-Specific Password 可以用於上傳所有 app 到 TestFlight

#### 為什麼有些 Secrets 不共用？

1. **EXPO_TOKEN**：每個 app 使用獨立的 token 更安全，也方便追蹤使用情況
2. **APPLE_APP_ID**：每個 app 在 App Store Connect 都有唯一的 App ID
3. **APPLE_ID**：如果不同 app 使用不同的 Apple ID，需要分別設定

---

## 步驟 6: 測試 Workflow

### 6.1 檢查 Workflow 檔案

確認 `.github/workflows/build-token-app-ios.yml` 檔案已存在且正確。

### 6.2 手動觸發測試

1. 前往 GitHub Repository
2. 點擊「Actions」標籤
3. 選擇「Build and Deploy iOS to TestFlight」
4. 點擊「Run workflow」
5. 輸入版本號（例如：`1.0.0`）
6. 點擊「Run workflow」

### 6.3 監控執行過程

在 Actions 頁面中，您可以：

- 查看每個步驟的執行狀態
- 查看詳細的日誌輸出
- 檢查是否有錯誤訊息

### 6.4 常見錯誤處理

如果遇到錯誤，請參考[常見問題排除](#常見問題排除)章節。

---

## 步驟 7: 觸發部署

### 7.1 使用 Git Tag 觸發（推薦）

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

### 7.2 手動觸發

1. 前往 GitHub Repository → Actions
2. 選擇「Build and Deploy iOS to TestFlight」
3. 點擊「Run workflow」
4. 輸入版本號
5. 點擊「Run workflow」

### 7.3 檢查 TestFlight

構建完成後（通常需要 15-30 分鐘）：

1. 前往 [App Store Connect](https://appstoreconnect.apple.com/)
2. 選擇您的 App
3. 點擊「TestFlight」標籤
4. 在「iOS Builds」區塊中，您應該會看到新的構建版本
5. 等待 Apple 處理完成（通常需要 10-30 分鐘）
6. 處理完成後，可以選擇測試群組進行分發

---

## 常見問題排除

### ❌ 錯誤：`EXPO_TOKEN_TOKEN_APP is invalid`

**原因**：Expo Token 無效或已過期。

**解決方法**：
1. 前往 [Expo 設定頁面](https://expo.dev/accounts/[your-account]/settings/access-tokens)
2. 刪除舊的 Token
3. 建立新的 Token
4. 更新 GitHub Secret `EXPO_TOKEN_TOKEN_APP`

### ❌ 錯誤：`Apple ID authentication failed`

**原因**：Apple ID 或 App-Specific Password 錯誤。

**解決方法**：
1. 確認 `APPLE_ID_TOKEN_APP` 是正確的電子郵件地址
2. 確認 `APPLE_APP_SPECIFIC_PASSWORD` 格式正確（`xxxx-xxxx-xxxx-xxxx`）
3. 如果密碼已過期，建立新的 App-Specific Password
4. 確認 Apple ID 已啟用兩步驟驗證

### ❌ 錯誤：`Team ID not found`

**原因**：Team ID 設定錯誤或沒有權限。

**解決方法**：
1. 確認 `APPLE_TEAM_ID` 格式正確（10 個字元的英數字）
2. 確認您的 Apple ID 是該 Team 的成員
3. 前往 [Apple Developer](https://developer.apple.com/account/) 確認 Team ID

### ❌ 錯誤：`App not found in App Store Connect`

**原因**：App 尚未在 App Store Connect 建立，或 App ID 錯誤。

**解決方法**：
1. 前往 [App Store Connect](https://appstoreconnect.apple.com/)
2. 確認 App 已建立
3. 確認 `APPLE_APP_ID_TOKEN_APP` 是正確的 App Store Connect App ID
4. 確認 Bundle ID 與 `app.json` 中的設定一致

### ❌ 錯誤：`Build failed: Provisioning profile not found`

**原因**：缺少 Provisioning Profile 或憑證。

**解決方法**：
1. 確認您的 Apple Developer 帳號有建立 App ID
2. 確認已建立 Distribution Certificate 和 Provisioning Profile
3. EAS 會自動管理憑證，但需要正確的 Team ID 和 Bundle ID

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

---

## 工作流程說明

### 完整流程圖

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

### 預估時間

- **構建時間**：15-30 分鐘（取決於專案大小）
- **Apple 處理時間**：10-30 分鐘
- **總計**：約 30-60 分鐘

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

## 進階設定

### 自動化版本號管理

可以在 `app.json` 中使用環境變數：

```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    }
  }
}
```

### 多環境配置

可以在 `eas.json` 中設定不同的構建配置：

```json
{
  "build": {
    "development": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

---

## 相關資源

- [Expo EAS Build 文檔](https://docs.expo.dev/build/introduction/)
- [EAS Submit 文檔](https://docs.expo.dev/submit/introduction/)
- [Apple Developer 文檔](https://developer.apple.com/documentation/)
- [App Store Connect API](https://developer.apple.com/app-store-connect/api/)

---

## 總結

完成以上步驟後，您就可以：

1. ✅ 自動構建 iOS App
2. ✅ 自動上傳到 TestFlight
3. ✅ 自動送審流程

每次推送版本標籤時，GitHub Actions 會自動執行完整的構建和上傳流程，大大簡化了發布流程！

---

**需要幫助？** 請查看 [常見問題排除](#常見問題排除) 或參考相關文檔。

