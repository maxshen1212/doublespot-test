# Doublespot Full-Stack Project

Full-stack app (React + Express + Prisma/MySQL) 使用 **Docker Compose** 統一開發環境。

---

## 🛠️ Tech Stack

### Backend
- Express.js 5 + TypeScript (ESM/NodeNext)
- Prisma 7 + MySQL 8.4 (MariaDB adapter)
- tsx (hot-reload), Vitest, ESLint, Prettier

### Frontend
- React 19 + TypeScript + Vite 7
- Tailwind CSS v4
- TanStack Query + Zustand + React Router

### DevOps
- Docker + Docker Compose
- GitHub Actions (PR 自動檢查)

---

## 📁 Project Structure

```
.
├── docker-compose.yml       # 三服務編排（database, backend, frontend）
├── backend/                 # Express API + Prisma ORM
│   ├── src/
│   │   ├── features/        # Feature-based 架構
│   │   ├── config/          # Prisma client 等配置
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── Dockerfile
├── frontend/                # React SPA
│   ├── src/
│   │   ├── pages/
│   │   ├── hooks/           # TanStack Query hooks
│   │   ├── services/        # API 服務
│   │   └── types/
│   └── Dockerfile
└── documents/               # 完整文檔
```

---

## 🚀 快速開始

### 前置需求

- Docker Desktop（包含 docker compose）

### 啟動步驟

```bash
# 1. 確認環境變數檔案存在
ls backend/.env  # 應該已經存在，如果沒有：cp backend/.env.example backend/.env

# 2. 啟動所有服務
docker compose up --build

# 3. 執行資料庫 Migration（另開終端）
docker compose exec backend npm run db:migrate

# 4. 產生 prisma 客戶端
docker compose exec backend npm run db:generate

# 5. 重啟 backend 服務以載入新的 Prisma Client
docker compose restart backend
```

### 存取服務

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3000/api/health
- 🗄️ **Database**: localhost:3306
- 📊 **Prisma Studio**: `docker compose exec backend npm run db:studio` → http://localhost:5555

### 停止服務

```bash
docker compose down          # 停止服務
docker compose down -v       # 停止並清空資料庫（⚠️ 資料會遺失）
```

---

## 📜 常用指令

### 資料庫操作

```bash
docker compose exec backend npm run db:migrate      # 執行 migration
docker compose exec backend npm run db:generate     # 產生 Prisma Client
docker compose exec backend npm run db:studio       # 開啟 Prisma Studio
docker compose exec backend npm run db:reset        # 重置資料庫（⚠️ 危險）
```

### Backend 開發

```bash
# 程式碼品質
docker compose exec backend npm run lint            # ESLint 檢查
docker compose exec backend npm run lint:fix        # 自動修復
docker compose exec backend npm run format          # Prettier 格式化
docker compose exec backend npm run typecheck       # 型別檢查

# 測試
docker compose exec backend npm run test            # 執行測試（watch 模式）
docker compose exec backend npm run test:run        # 執行測試（CI 模式）

# 建置
docker compose exec backend npm run build           # 編譯 TypeScript
```

### Frontend 開發

```bash
docker compose exec frontend npm run lint           # ESLint 檢查
docker compose exec frontend npm run build          # Vite 建置
```

### 查看 Logs

```bash
docker compose logs -f                              # 所有服務
docker compose logs -f backend                      # 只看 backend
docker compose logs -f frontend                     # 只看 frontend
```

---

## 📚 完整文檔

### 專案架設指南

- 📘 [Backend 初始化](documents/backend-init.md) - 從零建立 Backend（Docker-only）
- 📗 [Frontend 初始化](documents/frontend-init.md) - React + Vite + Tailwind CSS v4
- 🐳 [Docker 環境設定](documents/docker.README.md) - Docker Compose 配置說明

### 架構與規範

- 🏗️ [Backend 架構說明](documents/Backend_Architecture.README.md) - Feature-based Clean Architecture

### 工具指南

- 🔧 [Prisma 使用指南](documents/prisma.README.md) - ORM 設定與操作
- ⚙️ [GitHub Actions](documents/GitHubActions.README.md) - CI/CD workflow 說明

---

## 🧪 測試與 CI/CD

### 本地測試

```bash
# Backend
docker compose exec backend npm run test

# Frontend
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

### GitHub Actions

PR 到 main 分支時自動執行：

- **Backend PR Check**: 格式、Lint、型別檢查、測試、建置
- **Frontend PR Check**: Lint、建置

詳見 [GitHub Actions 說明](documents/GitHubActions.README.md)

---

## 🔧 常見問題

### 資料庫連線失敗

**檢查**：`backend/.env` 中 `DATABASE_HOST="database"`（不是 localhost）

```bash
docker compose ps                    # 查看服務狀態
docker compose logs backend          # 查看錯誤訊息
```

### Prisma Generate 失敗

**原因**：Dockerfile 順序錯誤

**檢查**：`COPY prisma ./prisma` 和 `COPY prisma.config.ts ./` 必須在 `RUN npm install` **之前**

### API 回應 "table does not exist"

**原因**：忘記執行 migration

**解決**：
```bash
docker compose exec backend npm run db:migrate
```

### 完全重置專案

```bash
# 1. 停止並清除所有資料
docker compose down -v

# 2. 重新建置並啟動
docker compose up --build

# 3. 執行 migration 和 generate（另開終端）
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:generate

# 4. 重啟 backend
docker compose restart backend
```

### Port 被占用

使用的 Port：
- Frontend: **5173**
- Backend: **3000**
- MySQL: **3306**
- Prisma Studio: **5555**

確認這些 port 沒有被其他服務占用。

---

## 🎯 開發流程

1. **啟動服務**: `docker compose up`
2. **修改程式碼**: 檔案自動同步，支援 hot-reload
3. **查看 logs**: `docker compose logs -f backend`
4. **測試**: `docker compose exec backend npm run test`
5. **提交 PR**: GitHub Actions 自動檢查
6. **停止服務**: `docker compose down`

---

## 📖 架構重點

### Backend 架構（Feature-based Clean Architecture）

```
Route → Controller → Usecase → Repo → Prisma
```

- **Route**: URL 路由定義
- **Controller**: HTTP 請求/回應處理
- **Usecase**: 業務邏輯（可重用）
- **Repo**: 資料庫操作封裝

詳見 [Backend 架構說明](documents/Backend_Architecture.README.md)

### 環境配置重點

- **Docker 環境**: `DATABASE_HOST="database"`（服務名稱）
- **Prisma 順序**: schema 檔案必須在 `npm install` 前複製
- **Healthcheck**: MySQL 使用 `$${MYSQL_ROOT_PASSWORD}` 轉義
- **Frontend**: Vite 必須加 `--host` 參數

---

## 🤝 貢獻

1. Fork 專案
2. 建立 feature branch (`git checkout -b feature/amazing-feature`)
3. Commit 變更 (`git commit -m 'Add amazing feature'`)
4. Push 到 branch (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request（會自動觸發 GitHub Actions 檢查）

---

## 📄 License

MIT
