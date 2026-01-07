# Backend Development Convention 🏗️

> Backend Development Standards Following Clean Architecture Principles

---

## 🎯 Core Principles

### Four Pillars of Clean Architecture

1. **Testability** - Business logic independent from frameworks, easy to unit test
2. **Maintainability** - Clear separation of concerns, minimal impact from changes
3. **Scalability** - Easy to add new features without breaking existing architecture
4. **Independence** - Frameworks, databases, and UI can be replaced without affecting core logic

### Dependency Rule (Outside to Inside)

```
┌─────────────────────────────────────┐
│  Routes Layer (HTTP Endpoints)      │
│    ↓ Can only call Controller       │
├─────────────────────────────────────┤
│  Controllers Layer (HTTP Handler)   │
│    ↓ Can only call Service          │
├─────────────────────────────────────┤
│  Services Layer (Business Logic)⭐  │
│    ↓ Can only call Database         │
├─────────────────────────────────────┤
│  Database Layer (Data Access)       │
└─────────────────────────────────────┘
```

**🚫 No Reverse Dependencies**: Inner layers must not depend on outer layers (e.g., Service cannot use Request/Response)

---

## 📁 Project Structure

```
backend/src/
├── server.ts                 # 🚀 啟動入口
├── app.ts                    # ⚙️  Express 配置
├── config/                   # 🔧 配置檔案
│   ├── prisma.ts            # Database client
│   └── env.ts               # 環境變數驗證
├── routes/                   # 🛣️  路由定義
│   └── user.ts
├── controllers/              # 🎮 HTTP 請求處理
│   └── userController.ts
├── services/                 # 💼 業務邏輯（核心）
│   └── userService.ts
│   └── __tests__/           # 單元測試
├── middlewares/              # 🔒 中間件
│   ├── validator.ts         # 資料驗證
│   └── errorHandler.ts      # 錯誤處理
├── utils/                    # 🛠️  工具函數
└── generated/prisma/         # 🤖 自動生成的類型
```

---

## 🏗️ 各層職責詳解

### 1️⃣ Routes Layer（路由層）

**職責**：定義 API 端點，組合中間件，映射到 Controller

**✅ 應該做**：
- 定義 HTTP 路由（GET、POST、PATCH、DELETE）
- 組合中間件（驗證、認證）
- 保持簡潔，一行一個路由

**❌ 不應該做**：
- 任何業務邏輯
- 直接操作資料庫
- 處理錯誤（交給 errorHandler）

```typescript
// ✅ 正確示範
import { Router } from "express";
import { getUsers, createUser, updateUser } from "../controllers/userController";
import { validateBody } from "../middlewares/validator";
import { createUserSchema } from "../schemas/userSchemas";

const router = Router();

router.get("/", getUsers);
router.post("/", validateBody(createUserSchema), createUser);
router.patch("/:id", validateBody(updateUserSchema), updateUser);

export default router;
```

---

### 2️⃣ Controllers Layer（控制器層）

**職責**：處理 HTTP 層邏輯，協調 Service 層

**✅ 應該做**：
- 從 `req` 提取參數（body、params、query）
- 調用 Service 層方法
- 將 Service 結果轉換為 HTTP 響應
- 使用 `try-catch` + `next(error)` 處理錯誤

**❌ 不應該做**：
- 業務邏輯判斷（如驗證 email 是否重複）
- 直接操作資料庫
- 複雜的資料處理

```typescript
// ✅ 正確示範
import { Request, Response, NextFunction } from "express";
import { userService } from "../services/userService";

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.listUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error); // 轉發給 errorHandler
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name } = req.body;
    const user = await userService.createUser({ email, name });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

// ❌ 錯誤示範
export async function createUserBad(req: Request, res: Response) {
  const { email } = req.body;

  // ❌ 業務邏輯不應該在 Controller
  if (!email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  // ❌ 不應該直接操作資料庫
  const user = await prisma.user.create({ data: req.body });
  res.json(user);
}
```

---

### 3️⃣ Services Layer（服務層）⭐ 核心

**職責**：實現所有業務邏輯，獨立於 HTTP 框架

**✅ 應該做**：
- 實現業務規則和驗證
- 操作資料庫（通過 Prisma）
- 使用 Plain Objects/DTOs 作為參數
- 拋出明確的業務異常
- 可獨立進行單元測試

**❌ 不應該做**：
- 依賴 Express（不使用 Request/Response）
- 處理 HTTP 狀態碼
- 直接返回 HTTP 響應

```typescript
// ✅ 正確示範
import { prisma } from "../config/prisma";

// 定義清楚的 DTO（Data Transfer Object）
interface CreateUserDTO {
  email: string;
  name?: string;
}

async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });
}

async function createUser(data: CreateUserDTO) {
  // 業務規則：檢查 email 是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already exists"); // 拋出業務異常
  }

  return prisma.user.create({ data });
}

async function updateUser(id: number, data: Partial<CreateUserDTO>) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("User not found");
  }

  return prisma.user.update({ where: { id }, data });
}

export const userService = {
  listUsers,
  createUser,
  updateUser,
};
```

**單元測試範例**（Service 層可獨立測試）：

```typescript
// services/__tests__/userService.test.ts
import { describe, it, expect, vi } from "vitest";
import { userService } from "../userService";
import { prisma } from "../../config/prisma";

vi.mock("../../config/prisma");

describe("userService.createUser", () => {
  it("should throw error if email exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "Test",
    });

    await expect(
      userService.createUser({ email: "test@example.com" })
    ).rejects.toThrow("Email already exists");
  });
});
```

---

### 4️⃣ Middlewares（中間件層）

#### 資料驗證中間件

使用 **Zod** 進行型別安全的資料驗證：

```typescript
// middlewares/validator.ts
import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
}

// 使用範例
const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2).max(50).optional(),
  age: z.number().int().positive().optional(),
});

router.post("/users", validateBody(createUserSchema), createUser);
```

#### 錯誤處理中間件

```typescript
// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Error:", err);

  // Prisma 錯誤處理
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Duplicate entry" });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }

  // 自定義業務錯誤
  if (err.name === "BusinessError") {
    return res.status(400).json({ error: err.message });
  }

  // 默認錯誤
  res.status(500).json({ error: "Internal server error" });
}

// 在 app.ts 最後註冊
app.use(errorHandler);
```

---

## 📝 命名規則

### 檔案命名

| 類型         | 命名規則                | 範例                        |
| ------------ | ----------------------- | --------------------------- |
| Controllers  | `<資源>Controller.ts`   | `userController.ts`         |
| Services     | `<資源>Service.ts`      | `userService.ts`            |
| Routes       | `<資源>.ts`（複數）     | `users.ts`, `posts.ts`      |
| Middlewares  | `<功能>.ts`             | `auth.ts`, `validator.ts`   |
| Tests        | `<檔案>.test.ts`        | `userService.test.ts`       |

### 函數命名

```typescript
// Controllers: HTTP 動詞 + 資源名稱
export async function getUsers() {}
export async function getUser() {}
export async function createUser() {}
export async function updateUser() {}
export async function deleteUser() {}

// Services: 業務動作動詞
async function listUsers() {}
async function findUserById() {}
async function createUser() {}
async function updateUser() {}
async function removeUser() {}
async function checkEmailExists() {}
```

### 變數命名

```typescript
// ✅ 使用清楚的描述性名稱
const activeUsers = await userService.findActiveUsers();
const totalUserCount = users.length;
const isEmailValid = validateEmail(email);

// ❌ 避免縮寫和單字母
const u = await userService.find(); // 不好
const cnt = users.length; // 不好
const x = validateEmail(email); // 不好
```

---

## 🔐 開發規範

### TypeScript 嚴格模式

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 異步處理

```typescript
// ✅ 使用 async/await
async function getUser(id: number) {
  const user = await userService.findById(id);
  return user;
}

// ❌ 避免 Promise.then()
function getUserBad(id: number) {
  return userService.findById(id).then(user => user);
}
```

### 錯誤處理模式

```typescript
// Controller 層
export async function handler(req: Request, res: Response, next: NextFunction) {
  try {
    // 業務邏輯
    const result = await someService.doSomething();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error); // 統一轉發給 errorHandler
  }
}

// Service 層
async function deleteUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("User not found"); // 拋出明確的業務異常
  }

  return prisma.user.delete({ where: { id } });
}
```

### 環境變數管理

```typescript
// config/env.ts
import "dotenv/config";

interface Config {
  port: number;
  database: {
    host: string;
    user: string;
    password: string;
    name: string;
  };
}

// 驗證必要的環境變數
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const config: Config = {
  port: parseInt(process.env.PORT || "3000"),
  database: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    name: process.env.DB_NAME!,
  },
};
```

---

## 🗄️ Prisma 最佳實踐

### 使用 select 避免過度查詢

```typescript
// ✅ 只查詢需要的欄位
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    // 不返回 password 等敏感資料
  },
});

// ❌ 避免返回所有欄位
const users = await prisma.user.findMany(); // 包含所有欄位
```

### 使用 Transaction 保證資料一致性

```typescript
// ✅ 使用 transaction 處理多個相關操作
async function createUserWithProfile(userData: CreateUserDTO, profileData: CreateProfileDTO) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    const profile = await tx.profile.create({
      data: { ...profileData, userId: user.id },
    });
    return { user, profile };
  });
}
```

### 處理 Prisma 錯誤

```typescript
// Prisma 常見錯誤碼
// P2002: Unique constraint violation
// P2025: Record not found
// P2003: Foreign key constraint failed

try {
  await prisma.user.create({ data });
} catch (error) {
  if (error.code === "P2002") {
    throw new Error("Email already exists");
  }
  throw error;
}
```

---

## 🎯 完整 CRUD 範例

### 1. Schema 定義

```prisma
// prisma/schema.prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Service 層

```typescript
// services/postService.ts
import { prisma } from "../config/prisma";

interface CreatePostDTO {
  title: string;
  content: string;
  authorId: number;
}

interface UpdatePostDTO {
  title?: string;
  content?: string;
  published?: boolean;
}

async function listPosts(options?: { published?: boolean }) {
  return prisma.post.findMany({
    where: options?.published !== undefined ? { published: options.published } : undefined,
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getPostById(id: number) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  return post;
}

async function createPost(data: CreatePostDTO) {
  // 驗證 author 存在
  const author = await prisma.user.findUnique({
    where: { id: data.authorId },
  });

  if (!author) {
    throw new Error("Author not found");
  }

  return prisma.post.create({
    data,
    include: { author: true },
  });
}

async function updatePost(id: number, data: UpdatePostDTO) {
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new Error("Post not found");
  }

  return prisma.post.update({
    where: { id },
    data,
    include: { author: true },
  });
}

async function deletePost(id: number) {
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new Error("Post not found");
  }

  return prisma.post.delete({ where: { id } });
}

export const postService = {
  listPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
```

### 3. Controller 層

```typescript
// controllers/postController.ts
import { Request, Response, NextFunction } from "express";
import { postService } from "../services/postService";

export async function getPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const published =
      req.query.published === "true"
        ? true
        : req.query.published === "false"
        ? false
        : undefined;

    const posts = await postService.listPosts({ published });
    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const post = await postService.getPostById(id);
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postService.createPost(req.body);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const post = await postService.updatePost(id, req.body);
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    await postService.deletePost(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
```

### 4. Route 層

```typescript
// routes/posts.ts
import { Router } from "express";
import { z } from "zod";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController";
import { validateBody } from "../middlewares/validator";

const router = Router();

// Zod schemas
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  authorId: z.number().int().positive(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

// Routes
router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", validateBody(createPostSchema), createPost);
router.patch("/:id", validateBody(updatePostSchema), updatePost);
router.delete("/:id", deletePost);

export default router;
```

### 5. 註冊路由

```typescript
// app.ts
import postRouter from "./routes/posts";

app.use("/api/posts", postRouter);
```

---

## ✅ 開發檢查清單

在提交 PR 前，請確認以下事項：

### 架構檢查
- [ ] Service 層完全獨立於 Express（無 Request/Response 依賴）
- [ ] Controller 只處理 HTTP，所有業務邏輯在 Service
- [ ] Routes 只做映射和中間件組合，無業務邏輯
- [ ] 依賴方向正確（Routes → Controllers → Services → DB）

### 程式碼品質
- [ ] 所有函數都有明確的 TypeScript 類型定義
- [ ] 使用 async/await，避免 Promise.then()
- [ ] 統一使用 try-catch + next() 處理錯誤
- [ ] 變數和函數命名清晰、描述性強

### 資料驗證
- [ ] 使用 Zod 驗證所有輸入資料
- [ ] 驗證邏輯在中間件或 Service 層
- [ ] 返回清晰的錯誤訊息

### 資料庫操作
- [ ] 使用 Prisma Client 存取資料庫
- [ ] 使用 select 只查詢需要的欄位
- [ ] 處理 Prisma 特定錯誤（如 P2002、P2025）
- [ ] 複雜操作使用 transaction

### 測試
- [ ] Service 層有單元測試（使用 Vitest）
- [ ] 測試覆蓋主要業務邏輯
- [ ] Mock 外部依賴（如 Prisma）
- [ ] 測試通過：`npm test`

### CI/CD
- [ ] ESLint 檢查通過：`npm run lint`
- [ ] TypeScript 編譯成功：`npm run build`
- [ ] 測試全部通過：`npm test`

---

## 參考資源

- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
---

## 核心理念

> **"關注點分離"** 和 **"依賴反轉"** 是 Clean Architecture 的核心。
>
> 保持每一層職責單一、清晰，讓程式碼易於測試、維護和擴展！
