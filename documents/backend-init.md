# Step 1: Initialization & Installation

Start fresh. This command installs the core framework (Express 5) and the modern dev tools (tsx).

```bash
# 1. Initialize project
npm init -y

# 2. Install production dependencies (Express 5 + Dotenv + CORS)
npm install express@5 dotenv cors

# 3. Install development dependencies (TypeScript + Types + TSX)
npm install -D typescript tsx @types/node @types/express @types/cors
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
  "start": "node dist/server.js"
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

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

# Step 6: Run It

You are ready.

Create a .env file: PORT=3000

Start the dev server:

```bash
npm run dev
```
