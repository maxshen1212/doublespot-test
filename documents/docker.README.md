# Docker 環境設定指南

使用 Docker Compose 管理整個應用程式的三個服務：MySQL 資料庫、Express.js 後端、React 前端。

---

## 前置需求

- Docker Desktop 已安裝並運行
- 基本 Docker 概念理解

---

## 專案結構

```
doublespot-test/
├── docker-compose.yml          # 服務編排設定
├── backend/
│   ├── Dockerfile
│   ├── .env
│   └── prisma/
└── frontend/
    └── Dockerfile
```

---

## Docker Compose 設定

### 三個服務

```
database (MySQL 8.4)  →  backend (Express.js)  →  frontend (React + Vite)
      ↓                        ↓                          ↓
   Port 3306               Port 3000                  Port 5173
```

### docker-compose.yml 重點

**Database 服務**：
- MySQL 8.4
- Port: 3306
- Healthcheck: 確保資料庫就緒後才啟動 backend
- Volume: `mysql_data` 持久化資料
- 使用 `$${MYSQL_ROOT_PASSWORD}` 轉義環境變數

**Backend 服務**：
- Build: `./backend`
- Port: 3000
- Volume 掛載實現 hot-reload
- 等待 database healthcheck 通過

**Frontend 服務**：
- Build: `./frontend`
- Port: 5173
- 環境變數: `VITE_API_URL=http://backend:3000`
- 等待 backend 就緒

---

## Backend Dockerfile 重點

```dockerfile
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./

# ⚠️ 關鍵：Prisma 檔案必須在 npm install 前複製
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

**為什麼順序重要**：
- `npm install` 會執行 `postinstall: prisma generate`
- `prisma generate` 需要讀取 `prisma/schema.prisma` 和 `prisma.config.ts`
- 如果這些檔案不在前面複製，build 會失敗

---

## Frontend Dockerfile 重點

```dockerfile
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5173

# ⚠️ 必須加 --host 才能從瀏覽器訪問
CMD ["npm", "run", "dev", "--", "--host"]
```

---

## 環境變數設定

### Backend (.env)

```env
PORT=3000

# ⚠️ 重要：DATABASE_HOST 必須是 "database"（Docker 服務名稱）
DATABASE_URL="mysql://root:rootpassword@database:3306/my_app_db"
DATABASE_HOST="database"
DATABASE_USER="user"
DATABASE_PASSWORD="password"
DATABASE_NAME="my_app_db"
DATABASE_PORT=3306
```

**常見錯誤**：
- ❌ `DATABASE_HOST="localhost"`（會導致連線失敗）
- ✅ `DATABASE_HOST="database"`（使用 Docker 服務名稱）

### Frontend

在 `docker-compose.yml` 中設定：

```yaml
environment:
  - VITE_API_URL=http://backend:3000
```

---

## 常用指令

### 啟動服務

```bash
# 前景啟動（看得到 logs）
docker compose up

# 背景啟動
docker compose up -d

# 重新 build 並啟動
docker compose up --build
```

### 查看 Logs

```bash
# 所有服務
docker compose logs -f

# 特定服務
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f database
```

### 停止服務

```bash
# 停止服務
docker compose down

# 停止並刪除 volumes（⚠️ 會清空資料庫）
docker compose down -v
```

### 執行指令

```bash
# 在容器內執行指令
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:studio
docker compose exec backend sh

# 進入資料庫
docker compose exec database mysql -uroot -prootpassword
```

---

## 開發流程

1. **啟動服務**
   ```bash
   docker compose up -d
   ```

2. **執行 Migration**（首次啟動）
   ```bash
   docker compose exec backend npm run db:migrate
   ```

3. **修改程式碼**
   - 檔案會透過 volume 掛載自動同步
   - 前端和後端都支援 hot-reload

4. **查看 Logs**
   ```bash
   docker compose logs -f
   ```

5. **停止服務**
   ```bash
   docker compose down
   ```

---

## 常見問題

### 1. Backend 無法連接資料庫

**檢查**：`backend/.env` 中 `DATABASE_HOST="database"`

### 2. Frontend 無法訪問

**檢查**：Dockerfile CMD 是否包含 `--host` 參數

### 3. Prisma Generate 失敗

**檢查**：Dockerfile 中 `COPY prisma ./prisma` 和 `COPY prisma.config.ts ./` 是否在 `RUN npm install` **之前**

### 4. 資料庫 Healthcheck 失敗

**檢查**：docker-compose.yml 使用 `$${MYSQL_ROOT_PASSWORD}` 雙重 $

---

## 網路架構

容器間透過 Docker 內部網路通訊：

```
Host Machine
    ↓
localhost:5173  →  frontend (容器)
    ↓
http://backend:3000  →  backend (容器)
    ↓
mysql://database:3306  →  database (容器)
```

**關鍵概念**：
- 在容器內使用服務名稱（`database`, `backend`）
- 在 host 使用 `localhost`

---

## 生產環境注意事項

**⚠️ 這些 Dockerfile 僅供開發使用**

生產環境需要：
- Multi-stage builds
- 最小化 image 大小
- 移除開發依賴
- 使用 production build
- 適當的安全配置
- 不掛載原始碼
