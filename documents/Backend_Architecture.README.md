# Backend 架構文件

**Feature-based Clean Architecture**

> 適合中小型專案的後端架構：職責清晰、容易理解、避免過度設計

---

## 目錄

1. [為什麼需要這個架構？](#為什麼需要這個架構)
2. [核心概念](#核心概念)
3. [資料夾結構](#資料夾結構)
4. [請求流程](#請求流程)
5. [各層職責](#各層職責)
6. [四不碰原則](#四不碰原則)
7. [設計取捨](#設計取捨)

---

## 為什麼需要這個架構？

### 傳統做法的問題

把所有邏輯寫在一起：業務邏輯與 HTTP 綁死、難以測試、無法重用、難以維護

### 我們的解決方案

**分層架構**：每一層只做一件事，職責清楚

```
使用者請求 → Route → Controller → Usecase → Repo → 資料庫
                        ↓            ↓         ↓
                    處理HTTP      業務邏輯    資料存取
```

---

## 核心概念

### 架構圖

```
┌─────────────┐
│   Route     │  定義 URL 對應
└──────┬──────┘
       ↓
┌─────────────┐
│ Controller  │  處理 HTTP 請求/回應
└──────┬──────┘
       ↓
┌─────────────┐
│  Usecase    │  執行業務流程
└──────┬──────┘
       ↓
┌─────────────┐
│    Repo     │  資料庫操作
└──────┬──────┘
       ↓
┌─────────────┐
│   Prisma    │  ORM
└─────────────┘
```

### 依賴方向

```
Controller → Usecase → Repo → Prisma
                ↕
            Entity (業務規則，選用)
```

**重點**：上層可以呼叫下層，下層不能回頭呼叫上層

---

## 資料夾結構

```
src/
  ├── app.ts              # Express 應用設定
  ├── server.ts           # 伺服器啟動
  │
  ├── features/           # 功能模組（按業務分類）
  │   └── space/
  │       ├── routes.ts           # URL 路由
  │       ├── controller.ts       # HTTP 處理
  │       ├── types.ts            # DTO 定義
  │       ├── usecases/           # 業務邏輯
  │       │   ├── create-space.usecase.ts
  │       │   ├── get-space.usecase.ts
  │       │   ├── list-spaces.usecase.ts
  │       │   ├── update-space.usecase.ts
  │       │   └── delete-space.usecase.ts
  │       └── repos/              # 資料存取
  │           └── space.repo.ts
  │
  ├── config/             # 設定檔
  ├── middlewares/        # Express 中介層
  └── utils/              # 共用工具
```

**為什麼按 feature 分類？**
- 相關程式碼集中，容易找
- 新增功能只需新增資料夾
- 刪除功能直接刪資料夾

---

## 請求流程

### 建立 Space 的完整流程

```
POST /api/spaces { name: "會議室A", capacity: 10 }
    ↓
[Route]
    routes.ts 對應到 createSpace controller
    ↓
[Controller]
    controller.ts
    1. 從 req.body 取資料
    2. 呼叫 createSpaceUsecase
    3. 回傳 201 JSON
    ↓
[Usecase]
    create-space.usecase.ts
    1. 驗證業務規則（capacity > 0）
    2. 呼叫 spaceRepo.create
    3. 回傳結果
    ↓
[Repo]
    space.repo.ts
    執行 prisma.space.create()
    ↓
[Prisma]
    INSERT INTO Space ...
    ↓
回傳結果 → Repo → Usecase → Controller → 回應 201 JSON
```

---

## 各層職責

### 1️⃣ Route（路由層）

**職責**：定義 URL 對應到哪個 Controller

- ✅ 只做路由對應
- ❌ 不能寫任何邏輯

---

### 2️⃣ Controller（控制層）

**職責**：HTTP 請求/回應的翻譯器

**可以做**：
- 取 `req.body`, `req.params`, `req.query`
- 驗證輸入格式（缺少必填欄位）
- 呼叫 Usecase
- 設定 HTTP status code

**不能做**：
- ❌ 直接使用 `prisma`
- ❌ 寫業務邏輯（計算、驗證規則）

---

### 3️⃣ Usecase（業務邏輯層）

**職責**：執行業務流程，編排操作

**可以做**：
- 驗證業務規則
- 呼叫一個或多個 Repo
- 組合資料、計算結果
- 拋出業務錯誤

**不能做**：
- ❌ 接觸 `req` / `res`
- ❌ 直接使用 `prisma`

**為什麼要分離 Usecase？**
- 可在不同地方重用（CLI、排程、WebSocket）
- 容易測試（不需 mock HTTP）
- 業務邏輯集中管理

---

### 4️⃣ Repo（資料存取層）

**職責**：封裝所有資料庫操作

**可以做**：
- Prisma 查詢
- 資料庫交易
- 資料格式轉換

**不能做**：
- ❌ 寫業務規則
- ❌ 接觸 HTTP

**為什麼要 Repo？**
- 換資料庫只需改 Repo
- 測試時可 mock Repo
- 複雜查詢統一管理

---

### 5️⃣ DTO（Data Transfer Object）

**職責**：定義資料格式契約

在 `types.ts` 定義輸入/輸出的 TypeScript 介面

---

## 四不碰原則

### 記住這四條規則，架構就不會亂

| 規則 | 說明 | 為什麼？ |
|------|------|----------|
| **1️⃣ Controller 不碰 Prisma** | 只能呼叫 Usecase | HTTP 與資料庫分離 |
| **2️⃣ Usecase 不接 req/res** | 不用 Express 的東西 | 業務邏輯可重用 |
| **3️⃣ Repo 不寫業務規則** | 只負責資料存取 | 邏輯集中在 Usecase |
| **4️⃣ Entity 不依賴框架** | 純粹的業務物件 | 核心邏輯獨立 |

### 依賴方向

```
Controller → Usecase → Repo → Prisma
```

✅ **正確**：上層呼叫下層
❌ **錯誤**：下層回頭呼叫上層

---

## 設計取捨

### 為什麼不用完整的 Clean Architecture？

**完整版需要**：
- 大量 Interface 定義
- Dependency Injection 容器
- 複雜的資料夾層級
- 大量樣板程式碼

**我們的選擇**：
- **80% 的好處，20% 的複雜度**
- 保持簡單但職責清楚
- 需要時可逐步擴展

### 什麼時候需要升級？

- 需要大量單元測試（用 Interface mock）
- 要替換基礎設施（換資料庫、換 framework）
- 團隊規模變大，需要更嚴格規範

---

## 心智模型

### 傳統 MVC 的問題

```
Controller → Service → Model
              ↓
         所有邏輯都塞在這裡（垃圾桶）
```

### 我們的改進

把 Service 拆成三個清楚的角色：

```
傳統 Service
    ↓ 拆分為
┌─────────────┐
│  Usecase    │ → 業務流程（做什麼）
├─────────────┤
│  Entity     │ → 業務規則（怎麼做）
├─────────────┤
│  Repo       │ → 資料存取（從哪拿）
└─────────────┘
```

---

## 總結

### ✅ 架構優點

- 職責清楚：每一層只做一件事
- 容易測試：各層獨立測試
- 好維護：知道要改哪裡
- 可擴展：未來逐步加強

### 📝 開發順序

新增功能時：

1. 定義 `types.ts` (DTO)
2. 寫 `repos/` (資料存取)
3. 寫 `usecases/` (業務邏輯)
4. 寫 `controller.ts` (HTTP 處理)
5. 寫 `routes.ts` (路由定義)

### 🎯 核心原則

> **每一層只做自己該做的事，然後傳給下一層**

### 參考實作

參考 `src/features/space/` 的完整範例