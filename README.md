# Doublespot Full-Stack Project

Full-stack app (React + Express + Prisma/MySQL) 開發運行統一用 **Docker Compose**。

**請務必閱讀 documents 內含 README 檔名的檔案。**

---

## 🛠️ Tech Stack

- **Backend**: Express.js, TypeScript, Prisma, MySQL, tsx (ESM/NodeNext)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, Zustand, TanStack Query, React Router
- **DevOps**: Docker, Docker Compose

---

## 📁 Project Structure

```
.
├── docker-compose.yml    # 三服務編排（database + backend + frontend）
├── backend/              # Express API + Prisma schema
└── frontend/             # React SPA
```

---

## 🚀 快速開始

### 前置需求

- Docker Desktop（含 docker compose）

### 啟動步驟

```bash
# 1. 複製環境變數檔案
cp backend/.env.example backend/.env

# 2. 啟動所有服務（資料庫 + 後端 + 前端）
docker compose up -d --build

# 3. 執行資料庫遷移
docker compose exec backend npm run db:migrate
```

### 存取服務

- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:3000
- 🗄️ Database: localhost:3306

### 查看日誌

```bash
# 查看後端即時日誌（熱重載開發）
docker compose logs -f backend

# 查看所有服務狀態
docker compose ps
```

### 停止服務

```bash
docker compose down          # 停止服務
docker compose down -v       # 停止並清空資料庫
```

---

## 📜 常用指令

所有指令透過 `docker compose exec` 在容器內執行。

### Backend 開發

```bash
# 資料庫操作
docker compose exec backend npm run db:migrate      # 執行資料庫遷移
docker compose exec backend npm run db:generate     # 生成 Prisma Client
docker compose exec backend npm run db:studio       # 開啟 Prisma Studio
docker compose exec backend npm run db:push         # 直接推送 schema（謹慎使用）

# 代碼品質檢查
docker compose exec backend npm run lint            # ESLint 檢查
docker compose exec backend npm run lint:fix        # 自動修復 lint 問題
docker compose exec backend npm run format          # Prettier 格式化
docker compose exec backend npm run format:check    # 檢查格式
docker compose exec backend npm run typecheck       # TypeScript 類型檢查

# 測試
docker compose exec backend npm run test            # 執行測試
docker compose exec backend npm run test:run        # 執行測試（單次）
```

### Frontend 開發

```bash
docker compose exec frontend npm run lint           # ESLint 檢查
docker compose exec frontend npm run build          # 建置生產版本
```

---

## 🧪 測試

```bash
# 後端測試
docker compose exec backend npm run test

# 前端測試
docker compose exec frontend npm run lint
```

---

## 📚 相關文件

- **Backend**
  - [初始化指南](documents/backend-init.md) - 從零建立 Backend（Docker-only）
  - [開發規範（中文）](documents/backend-dev-convention-CH.md)
  - [開發規範（English）](documents/backend-dev-convention-EN.md)
- **Frontend**
  - [初始化指南](documents/frontend-init.md)
- **工具與配置**
  - [Prisma 使用指南](documents/prisma-init.md)
  - [Docker 配置說明](documents/docker-init.md)

---

## 🔧 常見問題

### 資料庫連線失敗

確認 `backend/.env` 中的 `DATABASE_HOST` 設定為 `database`（不是 localhost）。

```bash
# 檢查服務健康狀態
docker compose ps

# 查看後端連線日誌
docker compose logs backend
```

### API 無法存取

```bash
# 查看後端即時日誌
docker compose logs -f backend
```

### 完全重置資料庫

```bash
# 停止並移除所有資料
docker compose down -v

# 重新啟動
docker compose up -d --build

# 執行遷移
docker compose exec backend npm run db:migrate
```

### Port 被占用

- Frontend: 5173
- Backend: 3000
- MySQL: 3306

請確認這些 port 沒有被其他服務占用。
