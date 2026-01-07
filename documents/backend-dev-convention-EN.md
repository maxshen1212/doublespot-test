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
├── server.ts                 # 🚀 Entry point
├── app.ts                    # ⚙️  Express configuration
├── config/                   # 🔧 Configuration files
│   ├── prisma.ts            # Database client
│   └── env.ts               # Environment validation
├── routes/                   # 🛣️  Route definitions
│   └── user.ts
├── controllers/              # 🎮 HTTP request handlers
│   └── userController.ts
├── services/                 # 💼 Business logic (Core)
│   └── userService.ts
│   └── __tests__/           # Unit tests
├── middlewares/              # 🔒 Middlewares
│   ├── validator.ts         # Data validation
│   └── errorHandler.ts      # Error handling
├── utils/                    # 🛠️  Utility functions
└── generated/prisma/         # 🤖 Auto-generated types
```

---

## 🏗️ Layer Responsibilities

### 1️⃣ Routes Layer

**Responsibility**: Define API endpoints, compose middlewares, map to Controllers

**✅ Should Do**:
- Define HTTP routes (GET, POST, PATCH, DELETE)
- Compose middlewares (validation, authentication)
- Keep it concise, one route per line

**❌ Should NOT Do**:
- Any business logic
- Direct database operations
- Error handling (delegate to errorHandler)

```typescript
// ✅ Correct Example
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

### 2️⃣ Controllers Layer

**Responsibility**: Handle HTTP layer logic, coordinate Service layer

**✅ Should Do**:
- Extract parameters from `req` (body, params, query)
- Call Service layer methods
- Transform Service results to HTTP responses
- Handle errors using `try-catch` + `next(error)`

**❌ Should NOT Do**:
- Business logic decisions (e.g., checking if email exists)
- Direct database operations
- Complex data processing

```typescript
// ✅ Correct Example
import { Request, Response, NextFunction } from "express";
import { userService } from "../services/userService";

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.listUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error); // Forward to errorHandler
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

// ❌ Bad Example
export async function createUserBad(req: Request, res: Response) {
  const { email } = req.body;

  // ❌ Business logic should not be in Controller
  if (!email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  // ❌ Should not directly operate database
  const user = await prisma.user.create({ data: req.body });
  res.json(user);
}
```

---

### 3️⃣ Services Layer ⭐ Core

**Responsibility**: Implement all business logic, independent from HTTP framework

**✅ Should Do**:
- Implement business rules and validation
- Operate database (through Prisma)
- Use Plain Objects/DTOs as parameters
- Throw explicit business exceptions
- Be independently unit testable

**❌ Should NOT Do**:
- Depend on Express (no Request/Response usage)
- Handle HTTP status codes
- Directly return HTTP responses

```typescript
// ✅ Correct Example
import { prisma } from "../config/prisma";

// Define clear DTO (Data Transfer Object)
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
  // Business rule: Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already exists"); // Throw business exception
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

**Unit Test Example** (Service layer is independently testable):

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

### 4️⃣ Middlewares Layer

#### Data Validation Middleware

Use **Zod** for type-safe data validation:

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

// Usage Example
const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2).max(50).optional(),
  age: z.number().int().positive().optional(),
});

router.post("/users", validateBody(createUserSchema), createUser);
```

#### Error Handler Middleware

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

  // Prisma error handling
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Duplicate entry" });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }

  // Custom business errors
  if (err.name === "BusinessError") {
    return res.status(400).json({ error: err.message });
  }

  // Default error
  res.status(500).json({ error: "Internal server error" });
}

// Register at the end of app.ts
app.use(errorHandler);
```

---

## 📝 Naming Conventions

### File Naming

| Type         | Convention              | Examples                    |
| ------------ | ----------------------- | --------------------------- |
| Controllers  | `<resource>Controller.ts` | `userController.ts`       |
| Services     | `<resource>Service.ts`    | `userService.ts`          |
| Routes       | `<resource>.ts` (plural)  | `users.ts`, `posts.ts`    |
| Middlewares  | `<feature>.ts`            | `auth.ts`, `validator.ts` |
| Tests        | `<file>.test.ts`          | `userService.test.ts`     |

### Function Naming

```typescript
// Controllers: HTTP verb + resource name
export async function getUsers() {}
export async function getUser() {}
export async function createUser() {}
export async function updateUser() {}
export async function deleteUser() {}

// Services: Business action verbs
async function listUsers() {}
async function findUserById() {}
async function createUser() {}
async function updateUser() {}
async function removeUser() {}
async function checkEmailExists() {}
```

### Variable Naming

```typescript
// ✅ Use clear descriptive names
const activeUsers = await userService.findActiveUsers();
const totalUserCount = users.length;
const isEmailValid = validateEmail(email);

// ❌ Avoid abbreviations and single letters
const u = await userService.find(); // Bad
const cnt = users.length; // Bad
const x = validateEmail(email); // Bad
```

---

## 🔐 Development Standards

### TypeScript Strict Mode

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

### Async Handling

```typescript
// ✅ Use async/await
async function getUser(id: number) {
  const user = await userService.findById(id);
  return user;
}

// ❌ Avoid Promise.then()
function getUserBad(id: number) {
  return userService.findById(id).then(user => user);
}
```

### Error Handling Pattern

```typescript
// Controller Layer
export async function handler(req: Request, res: Response, next: NextFunction) {
  try {
    // Business logic
    const result = await someService.doSomething();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error); // Forward to errorHandler
  }
}

// Service Layer
async function deleteUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("User not found"); // Throw explicit business exception
  }

  return prisma.user.delete({ where: { id } });
}
```

### Environment Variables Management

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

// Validate required environment variables
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

## 🗄️ Prisma Best Practices

### Use select to Avoid Over-fetching

```typescript
// ✅ Only query needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    // Don't return sensitive data like password
  },
});

// ❌ Avoid returning all fields
const users = await prisma.user.findMany(); // Includes all fields
```

### Use Transactions to Ensure Data Consistency

```typescript
// ✅ Use transaction for multiple related operations
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

### Handle Prisma Errors

```typescript
// Common Prisma error codes
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

## 🎯 Complete CRUD Example

### 1. Schema Definition

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

### 2. Service Layer

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
  // Validate author exists
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

### 3. Controller Layer

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

### 4. Route Layer

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

### 5. Register Routes

```typescript
// app.ts
import postRouter from "./routes/posts";

app.use("/api/posts", postRouter);
```

---

## ✅ Development Checklist

Before submitting a PR, please verify the following:

### Architecture Check
- [ ] Service layer is completely independent from Express (no Request/Response dependencies)
- [ ] Controller only handles HTTP, all business logic is in Service
- [ ] Routes only do mapping and middleware composition, no business logic
- [ ] Dependency direction is correct (Routes → Controllers → Services → DB)

### Code Quality
- [ ] All functions have explicit TypeScript type definitions
- [ ] Use async/await, avoid Promise.then()
- [ ] Consistently use try-catch + next() for error handling
- [ ] Variables and functions have clear, descriptive names

### Data Validation
- [ ] Use Zod to validate all input data
- [ ] Validation logic is in middleware or Service layer
- [ ] Return clear error messages

### Database Operations
- [ ] Use Prisma Client to access database
- [ ] Use select to query only needed fields
- [ ] Handle Prisma-specific errors (e.g., P2002, P2025)
- [ ] Use transactions for complex operations

### Testing
- [ ] Service layer has unit tests (using Vitest)
- [ ] Tests cover main business logic
- [ ] Mock external dependencies (e.g., Prisma)
- [ ] Tests pass: `npm test`

### CI/CD
- [ ] ESLint check passes: `npm run lint`
- [ ] TypeScript compiles successfully: `npm run build`
- [ ] All tests pass: `npm test`

---

## References

- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
---

## Core Philosophy

> **"Separation of Concerns"** and **"Dependency Inversion"** are the core of Clean Architecture.
>
> Keep each layer's responsibilities single and clear, making code easy to test, maintain, and extend!
