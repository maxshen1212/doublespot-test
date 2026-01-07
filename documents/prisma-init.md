# Prisma 設定指南

## 安裝

```bash
npm install @prisma/client @prisma/adapter-mariadb
npm install -D prisma dotenv
```

## 設定檔案

### 1. 環境變數 (`.env`)

```env
DB_HOST=database
DB_USER=user
DB_PASSWORD=password
DB_NAME=my_app_db
DATABASE_URL="mysql://user:password@database:3306/my_app_db"
```

### 2. Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

### 3. Prisma Client (`src/config/prisma.ts`)

```typescript
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || "database",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "my_app_db",
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
```

## 常用指令

```bash
# 產生 Prisma Client
npx prisma generate

# 建立並執行遷移
npx prisma migrate dev --name <name>

# 部署遷移（生產環境）
npx prisma migrate deploy

# 推送 schema 變更（開發用）
npx prisma db push

# 開啟資料庫 GUI
npx prisma studio
```

## 基本使用

### Create
```typescript
await prisma.user.create({
  data: { email: 'user@example.com', name: 'John' }
});
```

### Read
```typescript
// 單筆
await prisma.user.findUnique({ where: { id: 1 } });

// 多筆
await prisma.user.findMany({
  where: { email: { contains: '@example.com' } }
});
```

### Update
```typescript
await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Jane' }
});
```

### Delete
```typescript
await prisma.user.delete({ where: { id: 1 } });
```

## Schema 語法

### 欄位型別
- `String`, `Int`, `Float`, `Boolean`, `DateTime`, `Json`

### 屬性
- `@id` - 主鍵
- `@unique` - 唯一值
- `@default(value)` - 預設值
- `@updatedAt` - 自動更新時間

### 關聯
```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}
```

## 注意事項

- 使用單一 Prisma Client 實例
- 修改 schema 後執行 `npx prisma generate`
- 遷移檔案要納入版本控制
- 生產環境用 `migrate deploy`，開發環境用 `migrate dev`
