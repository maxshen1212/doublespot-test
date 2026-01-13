# Frontend 專案初始化指南（Docker 環境）

**技術棧**：Vite + React 19 + TypeScript + Tailwind CSS v4 + TanStack Query + Zustand

本文檔記錄如何建立 Frontend 專案，確保與 Backend 的 API 整合。

---

## Step 1: 建立專案

在專案根目錄執行（與 `backend/` 同層）：

```bash
# 使用 Vite 建立 React + TypeScript 專案（使用 SWC 編譯器）
npm create vite@latest frontend -- --template react-swc-ts

# 進入目錄
cd frontend

# 安裝基礎依賴
npm install
```

---

## Step 2: 安裝依賴套件

```bash
# 核心套件
npm install react-router-dom @tanstack/react-query axios zustand clsx tailwind-merge

# Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite
```

---

## Step 3: 設定檔配置

### A. vite.config.ts

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL || "http://backend:3000";
  console.log("API Target:", apiUrl);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // Docker 需要
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
```

**關鍵配置**：
- `host: true` - 讓 Docker 可以訪問
- `proxy` - 代理 `/api` 請求到 backend
- `VITE_API_URL` - 環境變數支援（Docker 中使用 `http://backend:3000`）

### B. src/index.css

替換整個檔案內容：

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", system-ui, sans-serif;
}

html,
body {
  height: 100%;
  margin: 0;
  background-color: #f9fafb;
}
```

---

## Step 4: 建立資料夾結構

```bash
mkdir -p src/components/ui src/pages src/hooks src/services src/store src/layouts src/types
```

**結構說明**：

```
src/
  ├── components/ui/      # UI 元件（按鈕、輸入框等）
  ├── pages/              # 頁面元件
  ├── hooks/              # 自訂 Hooks（TanStack Query）
  ├── services/           # API 服務（axios）
  ├── store/              # 全域狀態（Zustand）
  ├── layouts/            # 佈局元件
  └── types/              # TypeScript 型別定義
```

---

## Step 5: 建立 Dockerfile

建立 `frontend/Dockerfile`：

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5173

# ⚠️ 必須加 --host 讓 Docker 可以訪問
CMD ["npm", "run", "dev", "--", "--host"]
```

---

## Step 6: 啟動開發

### Docker 環境（推薦）

```bash
# 在專案根目錄
docker compose up
```

### 本機開發（可選）

```bash
cd frontend
npm run dev
```

訪問 [http://localhost:5173](http://localhost:5173)

---

## API 整合範例

### 建立型別 (types/space.ts)

```typescript
export interface Space {
  id: string;
  name: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSpaceInput {
  name: string;
  capacity: number;
}
```

### 建立 API 服務 (services/space.service.ts)

```typescript
import axios from "axios";
import { Space, CreateSpaceInput } from "../types/space";

const api = axios.create({
  baseURL: "/api", // 會被 Vite proxy 轉發到 backend
});

export const spaceService = {
  fetchSpaces: async (): Promise<Space[]> => {
    const { data } = await api.get<Space[]>("/spaces");
    return data;
  },

  createSpace: async (input: CreateSpaceInput): Promise<Space> => {
    const { data } = await api.post<Space>("/spaces", input);
    return data;
  },
};
```

### 建立 Hook (hooks/useSpaces.ts)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { spaceService } from "../services/space.service";

export function useSpaces() {
  return useQuery({
    queryKey: ["spaces"],
    queryFn: spaceService.fetchSpaces,
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: spaceService.createSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}
```

---

## 完成檢查清單

✅ Vite 專案已建立
✅ 依賴套件已安裝
✅ `vite.config.ts` 已配置（proxy + Docker）
✅ `index.css` 已設定 Tailwind v4
✅ 資料夾結構已建立
✅ `Dockerfile` 已建立（包含 `--host`）
✅ API 整合範例已了解

---

## 下一步

- 參考 `src/pages/SpacesPage.tsx` 完整 CRUD 範例
- 了解 TanStack Query 的 cache invalidation
- 學習 Zustand 全域狀態管理
