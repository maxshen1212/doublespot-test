# Prisma 設定指南

本文檔記錄 Prisma ORM 的設定和常用操作。

---

## 安裝

```bash
npm install @prisma/client @prisma/adapter-mariadb
npm install -D prisma
```

---

## 設定檔案

### 1. prisma.config.ts（根目錄）

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

### 2. prisma/schema.prisma

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

### 3. src/config/prisma.ts

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

### 4. .env 環境變數

```env
DATABASE_URL="mysql://root:rootpassword@database:3306/my_app_db"
DATABASE_HOST="database"
DATABASE_USER="user"
DATABASE_PASSWORD="password"
DATABASE_NAME="my_app_db"
```

---

## 常用指令

```bash
# 產生 Prisma Client
npx prisma generate

# 建立並執行 migration（開發環境）
npx prisma migrate dev --name init

# 部署 migration（生產環境）
npx prisma migrate deploy

# 推送 schema 變更（不建立 migration）
npx prisma db push

# 查看 migration 狀態
npx prisma migrate status

# 開啟資料庫 GUI
npx prisma studio

# 重置資料庫（⚠️ 會清空資料）
npx prisma migrate reset
```

---

## Docker 環境指令

```bash
# 在容器內執行指令
docker compose exec backend npx prisma generate
docker compose exec backend npx prisma migrate dev
docker compose exec backend npx prisma studio
```

或使用 package.json scripts：

```bash
docker compose exec backend npm run db:generate
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:studio
```

---

## 基本 CRUD 操作

### Create
```typescript
await prisma.space.create({
  data: { name: "會議室A", capacity: 10 }
});
```

### Read
```typescript
// 單筆
await prisma.space.findUnique({ where: { id: "abc123" } });

// 多筆
await prisma.space.findMany({
  where: { capacity: { gte: 5 } }
});

// 第一筆
await prisma.space.findFirst();
```

### Update
```typescript
await prisma.space.update({
  where: { id: "abc123" },
  data: { capacity: 20 }
});
```

### Delete
```typescript
await prisma.space.delete({ where: { id: "abc123" } });
```

---

## Schema 語法快速參考

### 常用欄位型別
```prisma
String    Int       Float     Boolean
DateTime  Json      Bytes
```

### 常用屬性
```prisma
@id                    // 主鍵
@unique                // 唯一值
@default(cuid())       // 預設值（CUID）
@default(now())        // 預設值（當前時間）
@updatedAt             // 自動更新時間
```

### 關聯範例
```prisma
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
```

---

## 重要注意事項

1. **修改 schema 後必須執行 `prisma generate`**
2. **Migration 檔案要加入 Git 版本控制**
3. **開發環境用 `migrate dev`，生產環境用 `migrate deploy`**
4. **使用單一 Prisma Client 實例（singleton pattern）**
5. **Docker 環境中 `DATABASE_HOST` 必須是 "database"**

---

## 常見問題

### 問題 1: Prisma Generate 失敗

**檢查**：Dockerfile 中是否在 `npm install` **前**複製 `prisma/` 和 `prisma.config.ts`

### 問題 2: 資料庫連線失敗

**檢查**：`.env` 中 `DATABASE_HOST="database"`（不是 localhost）

### 問題 3: Schema 變更沒生效

**解決**：執行 `npx prisma generate` 重新產生 client
