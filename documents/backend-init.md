# Step 1: Initialization & Installation

Start fresh. This command installs the core framework (Express 5) and the modern dev tools (tsx).

```bash
# 1. Initialize project
npm init -y

# 2. Install production dependencies (Express 5 + Dotenv + CORS + Prisma)
npm install express@5 dotenv cors @prisma/client

# 3. Install development dependencies (TypeScript + Types + TSX + Prisma CLI)
npm install -D typescript tsx @types/node @types/express @types/cors prisma
```

# Step 2: TypeScript Configuration (tsconfig.json)

Create a tsconfig.json file. This configuration is strict to prevent bugs but configured specifically to work smoothly with tsx and modern Node.

```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/__tests__"],
  "compilerOptions": {
    /* 1. Project Structure */
    "rootDir": "./src",
    "outDir": "./dist",

    /* 2. Runtime Environment (Node.js) */
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "resolvejsonModule": true,

    /* 3. Strictness & Safety */
    "strict": true,
    "noImplicitAny": true,
    "forceConsistentCasingInFileNames": true /* Prevents Linux crashes */,

    /* 4. Interop & Compatibility */
    "esModuleInterop": true /* Allows 'import express from "express"' */,
    "skipLibCheck": true /* Speeds up compilation */,

    /* 5. Modern Tooling */
    "isolatedModules": true /* Optimized for 'tsx' and 'esbuild' */,
    "moduleDetection": "force" /* Treats every file as a module */
  }
}
```

Step 3: Update package.json Scripts
Open your package.json and replace the scripts section. We use tsx watch for the fastest development experience.

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

# Step 4: Create the Architecture

Don't put everything in one file. Run this command (or create folders manually) to set up a professional structure immediately.

```bash
mkdir -p src/config src/controllers src/models src/routes src/services src/middlewares src/utils
touch src/app.ts
touch src/server.ts
```

# Step 5: The Code (Separation of Concerns)

We separate the App (logic) from the Server (port listening).

## A. Create src/app.ts

This configures the application instance.

```typescript
import express, { Application, Request, Response } from "express";
import cors from "cors";

const app: Application = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "active", message: "Backend is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Backend is connected!",
    timestamp: new Date().toISOString(),
  });
});

export default app;
```

## B. Create src/server.ts

This starts the application.

```typescript
import dotenv from "dotenv";
import app from "./app";
import prisma from "./config/database";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Prisma database connection successful");
  } catch (error) {
    console.error("Prisma database connection failed:", error);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await testDatabaseConnection();
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

# Step 6: Run It

You are ready.

Create a .env file: PORT=3000

Start the dev server:

```bash
npm run dev
```

# Step 7: Database Setup (Prisma)

Configure Prisma ORM for type-safe database access with auto-generated queries.

## A. Initialize Prisma

Run this command to create the Prisma configuration:

```bash
npx prisma init
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to your `.env` file.

## B. Create src/config/database.ts

Create a database configuration file that exports the Prisma client instance.

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

## C. Update prisma/schema.prisma

Configure your database provider and define your data models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Example model - replace with your schema
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## D. Generate Prisma Client & Push Schema

After defining your schema, run:

```bash
npm run db:push        # Push schema to database
npm run db:generate    # Generate Prisma Client
```

# Step 8: Environment Variables Configuration

Configure environment variables for your application settings and database connection.

## A. Create .env.example

Create a template file that documents all required environment variables.

```env
PORT=3000

# Prisma Database Connection
DATABASE_URL="mysql://user:password@database:3306/my_app_db"
```

## B. Create .env

Copy `.env.example` to `.env` and update the values according to your environment:

- **Local development**: `DATABASE_URL="mysql://user:password@localhost:3306/my_app_db"`
- **Docker environment**: `DATABASE_URL="mysql://user:password@database:3306/my_app_db"`

For local development, your `.env` file should look like:

```env
PORT=3000

# Prisma Database Connection (Local)
DATABASE_URL="mysql://user:password@localhost:3306/my_app_db"
```

**Note**: Make sure to add `.env` to your `.gitignore` file to prevent committing sensitive information.
