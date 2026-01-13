# GitHub Actions Workflow 說明

本專案使用 GitHub Actions 進行自動化程式碼檢查，確保程式碼品質。

---

## Workflow 概念

### 觸發時機

**Pull Request 到 main 分支時**，根據變更的檔案自動執行對應的檢查：

```
PR 包含 backend/ 變更  →  執行 Backend PR Check
PR 包含 frontend/ 變更 →  執行 Frontend PR Check
```

**優點**：
- 只檢查有變更的部分（節省時間和資源）
- 平行執行，互不影響
- 在合併前發現問題

---

## Backend PR Check

**檔案**：`.github/workflows/backend-pr-check.yml`

**檢查流程**：

```
1. Checkout 程式碼
   ↓
2. 設定 Node.js 22 環境
   ↓
3. 安裝依賴 (npm ci)
   ↓
4. 格式檢查 (Prettier)
   ↓
5. 程式碼檢查 (ESLint)
   ↓
6. 型別檢查 (TypeScript)
   ↓
7. 執行測試 (Vitest)
   ↓
8. 建置檢查 (tsc)
```

**執行指令**：
- `npm run format:check` - 檢查程式碼格式
- `npm run lint` - ESLint 檢查
- `npm run typecheck` - TypeScript 型別檢查
- `npm run test:run` - 執行測試（CI 模式）
- `npm run build` - 編譯 TypeScript

---

## Frontend PR Check

**檔案**：`.github/workflows/frontend-pr-check.yml`

**檢查流程**：

```
1. Checkout 程式碼
   ↓
2. 設定 Node.js 22 環境
   ↓
3. 安裝依賴 (npm ci)
   ↓
4. 程式碼檢查 (ESLint)
   ↓
5. 建置檢查 (Vite build)
```

**執行指令**：
- `npm run lint` - ESLint 檢查
- `npm run build` - Vite 建置檢查

---

## 關鍵配置

### 路徑篩選

只在相關檔案變更時才執行：

```yaml
on:
  pull_request:
    paths:
      - "backend/**"                           # backend 程式碼
      - ".github/workflows/backend-pr-check.yml"  # workflow 本身
```

### 工作目錄

指定執行目錄，避免路徑問題：

```yaml
defaults:
  run:
    working-directory: backend  # 所有指令都在 backend/ 執行
```

### 快取依賴

加速建置時間：

```yaml
- uses: actions/setup-node@v6
  with:
    cache: npm
    cache-dependency-path: backend/package-lock.json
```

---

## 使用流程

1. **開發者提交 PR**
   ```bash
   git checkout -b feature/new-feature
   git push origin feature/new-feature
   # 在 GitHub 建立 PR 到 main
   ```

2. **GitHub Actions 自動執行**
   - 檢查哪些檔案有變更
   - 執行對應的 workflow
   - 顯示檢查結果

3. **檢查通過 ✅**
   - 所有測試通過
   - 程式碼品質符合標準
   - 可以合併 PR

4. **檢查失敗 ❌**
   - 查看錯誤訊息
   - 修正問題
   - Push 新的 commit（會自動重新執行）

---

## 本地預先檢查

在提交 PR 前，先在本地執行相同的檢查：

### Backend
```bash
cd backend
npm run format:check  # 格式檢查
npm run lint          # ESLint
npm run typecheck     # 型別檢查
npm run test          # 測試
npm run build         # 建置
```

### Frontend
```bash
cd frontend
npm run lint          # ESLint
npm run build         # 建置
```