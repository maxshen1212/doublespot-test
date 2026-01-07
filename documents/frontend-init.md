**Stack:** Vite + React (SWC) + TypeScript + Tailwind CSS v4 + TanStack Query + Zustand

# 1. Project Scaffolding

Run these commands in your project root (alongside the `backend` folder).

```bash
# 1. Create project with SWC (Rust-based compiler)
npm create vite@latest frontend -- --template react-swc-ts

# 2. Enter directory
cd frontend

# 3. Install core dependencies
npm install

```

# 2. Install Modern Stack

Install the v4 styling engine and standard logic libraries.

```bash
# Logic Libraries (Router, Data Fetching, State, Utilities)
npm install react-router-dom @tanstack/react-query axios zustand clsx tailwind-merge

# Styling Engine (Tailwind v4 + Vite Plugin)
npm install tailwindcss @tailwindcss/vite

```

# 3. Configuration

## A. Vite Config (`vite.config.ts`)

Configures the Tailwind v4 plugin and the Proxy to the Express backend with environment variable support for Docker compatibility.

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(), // 1. Activates Tailwind v4
    ],
    server: {
      host: true, // Needed for Docker
      proxy: {
        "/api": {
          // If running in Docker, use 'http://backend:3000'
          // If running locally, use 'http://localhost:3000'
          target: env.VITE_API_URL || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
```

**Environment Variable Support:**
- The `VITE_API_URL` environment variable allows you to configure the backend URL
- When running locally, defaults to `http://localhost:3000`
- When running in Docker, set `VITE_API_URL=http://backend:3000` in your environment
- The `host: true` option is required for Docker to expose Vite to the network

## B. Global CSS (`src/index.css`)

Replace the entire file content with the Tailwind v4 import.

```css
@import "tailwindcss";

/* Optional: Define theme variables here directly in CSS */
@theme {
  --font-sans: "Inter", system-ui, sans-serif;
}

/* Reset basics */
html,
body {
  height: 100%;
  margin: 0;
  background-color: #f9fafb; /* gray-50 */
}
```

# 4. Architecture

Create the folder structure.

```bash
mkdir -p src/components/ui src/pages src/hooks src/services src/store src/layouts src/types
```

# 5. Application Entry (`src/main.tsx`)

Setup `QueryClientProvider` and `BrowserRouter`.

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

# 6. Smoke Test Component (`src/App.tsx`)

A clean landing page to verify Tailwind and State are working.

```tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// 1. Define the shape of the data we expect from the backend
interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

function App() {
  // 2. Use the hook to fetch data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["health"], // Unique key for caching
    queryFn: async () => {
      // The proxy in vite.config.ts redirects '/api' -> 'http://localhost:3000/api'
      const { data } = await axios.get<HealthResponse>("/api/health");
      return data;
    },
    retry: 1, // Only retry once if it fails
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100 text-center transition-all hover:shadow-2xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
          System Status
        </h1>

        {/* STATE: LOADING */}
        {isLoading && (
          <div className="flex flex-col items-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-500 animate-pulse">
              Connecting to backend...
            </p>
          </div>
        )}

        {/* STATE: ERROR */}
        {isError && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-100">
            <div className="text-red-500 text-5xl mb-2">❌</div>
            <h3 className="text-lg font-bold text-red-700">
              Connection Failed
            </h3>
            <p className="text-sm text-red-600 mt-1">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Check if the backend is running on port 3000.
            </p>
          </div>
        )}

        {/* STATE: SUCCESS */}
        {data && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">✅</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-green-700">
                {data.message}
              </h2>
              <p className="text-sm text-gray-400 mt-1 font-mono">
                Server Time: {new Date(data.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Status: {data.status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

# 7. Start Development

```bash
npm run dev
```
