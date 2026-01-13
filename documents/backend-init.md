# Backend 專案架設指南（Docker 環境）

本文檔記錄如何在 Docker 環境下從零架設 Backend 專案，確保未來可以完整復刻。

## 前置需求

- Docker Desktop 已安裝並運行
- 專案根目錄已有 `docker-compose.yml`（包含 database, backend, frontend 服務）

---

# Step 1: 建立專案結構

在 `backend/` 目錄下建立完整的資料夾結構：

```bash
cd backend

# 建立核心目錄
mkdir -p src/config src/features src/middlewares src/utils

# 建立 Space feature 範例（可依需求調整）
mkdir -p src/features/space/repos src/features/space/usecases

# 建立核心檔案
touch src/app.ts
touch src/server.ts
touch src/config/prisma.ts
touch src/example.test.ts

# 建立 Space feature 檔案
touch src/features/space/controller.ts
touch src/features/space/routes.ts
touch src/features/space/types.ts
touch src/features/space/repos/space.repo.ts
touch src/features/space/usecases/create-space.usecase.ts
touch src/features/space/usecases/get-space.usecase.ts
touch src/features/space/usecases/list-spaces.usecase.ts
touch src/features/space/usecases/update-space.usecase.ts
touch src/features/space/usecases/delete-space.usecase.ts
```

---

建立 `backend/tsconfig.json`，配置嚴格的 TypeScript 設定：

```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/generated"],
  "compilerOptions": {
    /* 1. Project Structure */
    "rootDir": "./src",
    "outDir": "./dist",

    /* 2. Runtime Environment (Node.js) */
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "resolveJsonModule": true,

    /* 3. Strict Mode & Safety */
    "strict": true,
    "noImplicitAny": true,
    "forceConsistentCasingInFileNames": true,

    /* 4. Interoperability & Compatibility */
    "esModuleInterop": true,
    "skipLibCheck": true,

    /* 5. Modern Toolchain */
    "isolatedModules": true,
    "moduleDetection": "force"
  }
}
```

---

# Step 3: Package Configuration (package.json)
建立或更新 `backend/package.json`，包含所有必要的 scripts 和依賴：

```json
{
  "name": "backend-test",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "postinstall": "prisma generate",
    "dev": "tsx watch src/server.ts",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/adapter-mariadb": "^7.2.0",
    "@prisma/client": "^7.2.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^25.0.6",
    "eslint": "^9.39.2",
    "eslint-config-prettier": "^10.1.8",
    "prettier": "^3.7.4",
    "prisma": "^7.2.0",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.53.0",
    "vitest": "^4.0.17"
  }
}
```

**安裝依賴**（會在 Docker build 時自動執行，也可在容器內手動執行）：

```bash
docker compose exec backend npm install
```

---

# Step 4: Prisma Configuration

## A. 建立 prisma.config.ts

建立 `backend/prisma.config.ts`（⚠️ 必須放在根目錄，與 package.json 同層）：

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

## B. 初始化 Prisma Schema

建立 `backend/prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
}

model Space {
  id        String   @id @default(cuid())
  name      String
  capacity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## C. 建立 Prisma Client 實例

建立 `backend/src/config/prisma.ts`：

```typescript
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

const requiredEnvs = [
  "DATABASE_HOST",
  "DATABASE_USER",
  "DATABASE_PASSWORD",
  "DATABASE_NAME",
];

requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    console.warn(`${env} not set, using default`);
  }
});

export { prisma };
```

---

# Step 5: Environment Variables Configuration

建立 `backend/.env.example`（範本檔案）：

```env
PORT=3000

DATABASE_URL="mysql://root:rootpassword@database:3306/my_app_db"

DATABASE_USER="user"
DATABASE_PASSWORD="password"
DATABASE_NAME="my_app_db"
DATABASE_HOST="database"
DATABASE_PORT=3306
```

複製並建立實際使用的 `backend/.env`：

```bash
cp backend/.env.example backend/.env
```

**關鍵注意事項**：
- `DATABASE_HOST="database"` - 必須使用 docker-compose 的服務名稱，不是 `localhost` 或 `backend`
- `DATABASE_URL` 的 host 部分也要用 `@database:3306`

---

# Step 6: Dockerfile Configuration (⚠️ 檔案順序很重要)

建立 `backend/Dockerfile`，**注意 Prisma 相關檔案必須在 npm install 之前複製**：

```dockerfile
# Use specific node version (matches your engines config)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Copy Prisma schema (needed for postinstall script)
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies (will run prisma generate via postinstall)
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the API port
EXPOSE 3000

# Start the dev server (matches your 'scripts' in package.json)
CMD ["npm", "run", "dev"]
```

**為什麼這個順序很重要**：
- `npm install` 會執行 `postinstall` script (`prisma generate`)
- `prisma generate` 需要讀取 `prisma/schema.prisma` 和 `prisma.config.ts`
- 如果這些檔案在 `COPY . .` 才複製，`npm install` 會失敗

---

# Step 7: Docker Compose Configuration

確認專案根目錄的 `docker-compose.yml` 正確配置（重點檢查）：

```yaml
services:
  database:
    image: mysql:8.4
    container_name: mysql_dev
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: ${DATABASE_NAME:-my_app_db}
      MYSQL_USER: ${DATABASE_USER:-user}
      MYSQL_PASSWORD: ${DATABASE_PASSWORD:-password}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    env_file:
      - ./backend/.env
    healthcheck:
      # ⚠️ 使用 $${MYSQL_ROOT_PASSWORD} 雙重 $ 符號進行轉義
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  backend:
    build: ./backend
    container_name: backend_dev
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    env_file:
      - ./backend/.env
    depends_on:
      database:
        condition: service_healthy

  frontend:
    build: ./frontend
    container_name: frontend_dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://backend:3000
    depends_on:
      - backend

volumes:
  mysql_data:
```

**關鍵配置說明**：
- `healthcheck` 的 password 使用 `$${MYSQL_ROOT_PASSWORD}` 雙重 $ 進行轉義
- `depends_on.database.condition: service_healthy` 確保 backend 等待資料庫就緒
- `volumes` 掛載讓 hot-reload 生效

---

# Step 8: 核心程式碼

## A. src/app.ts

建立 Express 應用實例：

```typescript
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { spaceRouter } from "./features/space/routes.js";

const app: Application = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Health Check Route (for frontend proxy)
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "active",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/spaces", spaceRouter);

export default app;
```

## B. src/server.ts

建立伺服器啟動邏輯：

```typescript
import dotenv from "dotenv";
import app from "./app.js";
import { prisma } from "./config/prisma.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// 檢查資料庫連線
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // 測試查詢
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database query test passed");

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// 啟動伺服器
async function startServer() {
  const isConnected = await connectDatabase();

  if (!isConnected) {
    console.error("Failed to connect to database. Exiting...");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();

process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  console.log("Database disconnected");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  console.log("Database disconnected");
  process.exit(0);
});
```

---

# Step 9: Code Quality Tools

## A. eslint.config.js

建立 `backend/eslint.config.js`：

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "src/generated/**",
      "prisma/migrations/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
];
```

## B. prettier.config.js

建立 `backend/prettier.config.js`：

```javascript
export default {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 80,
};
```

## C. .prettierignore

建立 `backend/.prettierignore`：

```
dist/
node_modules/
src/generated/
*.log
```

---

# Step 10: Vitest Configuration

建立 `backend/vitest.config.ts`：

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

建立範例測試 `backend/src/example.test.ts`：

```typescript
import { describe, it, expect } from "vitest";

describe("Example Test Suite", () => {
  it("should pass basic math test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle async operations", async () => {
    const result = await Promise.resolve("test");
    expect(result).toBe("test");
  });
});
```

---

# Step 11: 啟動專案

## 1. Build 並啟動所有服務

```bash
docker compose up --build
```

等待所有服務啟動（特別是 database 的 healthcheck 通過）。

## 2. 執行資料庫 Migration

在另一個終端視窗執行：

```bash
docker compose exec backend npm run db:migrate
```

預期輸出：

```
Applying migration `20260112100023_init`
Your database is now in sync with your schema.
```

---

# Step 12: 驗證專案運作

## A. 檢查 Backend Health

```bash
# 方法 1：使用 curl
curl http://localhost:3000/api/health

# 方法 2：在容器內使用 wget
docker compose exec backend wget -qO- http://localhost:3000/api/health
```

預期回應：

```json
{
  "status": "active",
  "message": "Backend is running",
  "timestamp": "..."
}
```

## B. 測試 API Endpoint

```bash
# 獲取所有 Spaces（應該是空陣列）
docker compose exec backend wget -qO- http://localhost:3000/api/spaces
```

預期回應：

```json
[]
```

## C. 開啟 Prisma Studio（可選）

```bash
docker compose exec backend npm run db:studio
```

訪問 [http://localhost:5555](http://localhost:5555) 查看資料庫。

---

# Step 13: 常見問題排查

## 問題 1: 資料庫連線失敗 "pool timeout"

**原因**：`DATABASE_HOST` 設定錯誤

**解決方案**：
- 確認 `backend/.env` 中 `DATABASE_HOST="database"`（使用 docker-compose 服務名稱）
- 不要使用 `localhost` 或 `backend`

## 問題 2: Dockerfile build 失敗 "prisma generate error"

**原因**：Prisma 檔案未在 `npm install` 前複製

**解決方案**：
- 檢查 Dockerfile，確保 `COPY prisma ./prisma` 和 `COPY prisma.config.ts ./` 在 `RUN npm install` **之前**

## 問題 3: MySQL healthcheck 失敗

**原因**：healthcheck 密碼語法錯誤

**解決方案**：
- 使用 `"-p$${MYSQL_ROOT_PASSWORD}"` 雙重 $ 符號
- 或直接寫死密碼：`"-prootpassword"`

## 問題 4: API 回應 "table Space does not exist"

**原因**：忘記執行 migration

**解決方案**：

```bash
docker compose exec backend npm run db:migrate
```

---

# Step 14: 常用 Docker 指令

```bash
# 啟動服務
docker compose up

# 背景啟動
docker compose up -d

# 重新 build 並啟動
docker compose up --build

# 停止服務
docker compose down

# 查看 logs
docker compose logs backend
docker compose logs -f backend  # 持續追蹤

# 進入容器 shell
docker compose exec backend sh

# 執行指令
docker compose exec backend npm run test
docker compose exec backend npm run lint

# 資料庫操作
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:studio
docker compose exec backend npm run db:reset

# 清除所有容器和 volumes（⚠️ 會刪除資料）
docker compose down -v
```

---

# 完成檢查清單

✅ 專案結構已建立
✅ `tsconfig.json` 已配置
✅ `package.json` 包含所有 scripts 和依賴
✅ `prisma.config.ts` 和 `schema.prisma` 已設定
✅ `.env` 已配置（`DATABASE_HOST="database"`）
✅ `Dockerfile` 順序正確（Prisma 檔案在 npm install 之前）
✅ `docker-compose.yml` healthcheck 正確使用 `$${MYSQL_ROOT_PASSWORD}`
✅ 核心程式碼 `app.ts` 和 `server.ts` 已建立
✅ ESLint, Prettier, Vitest 已配置
✅ `docker compose up --build` 成功啟動
✅ `npm run db:migrate` 成功執行
✅ API 回應正常

---

## 下一步

- 參考 [Architecture.README.md](../backend/Architecture.README.md) 了解專案架構
- 參考 [backend-dev-convention-CH.md](./backend-dev-convention-CH.md) 了解開發規範
- 開始實作你的 Features（參考 `src/features/space` 範例）